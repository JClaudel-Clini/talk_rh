<?php
declare(strict_types=1);

namespace OCA\TalkRh\Notifier;

use OCP\IURLGenerator;
use OCP\Notification\INotification;
use OCP\Notification\INotifier;

class LeaveNotifier implements INotifier {
    public function __construct(
        private IURLGenerator $urlGenerator,
    ) {}

    public function getID(): string {
        return 'talk_rh-notifier';
    }

    public function getName(): string {
        return 'Demande de congés';
    }

    public function prepare(INotification $notification, string $languageCode): INotification {
        if ($notification->getApp() !== 'talk_rh') {
            // Not for us
            return $notification;
        }

        $subject = $notification->getSubject();
        $params = $notification->getSubjectParameters();

        if ($subject === 'leave_created') {
            $uid = (string)($params['uid'] ?? '');
            $start = (string)($params['start'] ?? '');
            $end = (string)($params['end'] ?? '');
            $label = p($l->t('Nouvelle demande de congés'));
            $text = $uid !== ''
                ? sprintf(p($l->t('%s a créé une demande de congés du %s au %s.')), $uid, $start, $end)
                : sprintf(p($l->t('Nouvelle demande de congés du %s au %s.')), $start, $end);

            $notification->setParsedSubject($label)
                ->setParsedMessage($text)
                ->setIcon($this->urlGenerator->getAbsoluteURL($this->urlGenerator->imagePath('talk_rh', 'app.svg')));

            // If not already set, point to the app index
            if ($notification->getLink() === '') {
                $notification->setLink($this->urlGenerator->linkToRoute('talk_rh.page.index'));
            }
        } elseif ($subject === 'leave_status_changed') {
            $status = (string)($params['status'] ?? '');
            $start = (string)($params['start'] ?? '');
            $end = (string)($params['end'] ?? '');
            $comment = (string)($params['comment'] ?? '');
            $statusFr = $status === 'approved' ? p($l->t('approuvée')) : ($status === 'rejected' ? p($l->t('refusée')) : p($l->t('mise à jour')));
            $label = p($l->t('Statut de votre demande'));
            $base = sprintf(p($l->t('Votre demande de congés (%s → %s) a été %s.')), $start, $end, $statusFr);
            $text = $comment !== '' ? $base . ' ' . p($l->t('Commentaire: ')) . $comment : $base;

            $notification->setParsedSubject($label)
                ->setParsedMessage($text)
                ->setIcon($this->urlGenerator->imagePath('talk_rh', 'app.svg'));

            if ($notification->getLink() === '') {
                $notification->setLink($this->urlGenerator->linkToRoute('talk_rh.page.employeeView'));
            }
        }

        return $notification;
    }
}
