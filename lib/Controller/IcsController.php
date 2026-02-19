<?php
declare(strict_types=1);

namespace OCA\TalkRh\Controller;

use OCA\TalkRh\AppInfo\Application;
use OCA\TalkRh\Service\LeaveService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\TextPlainResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;

class IcsController extends Controller {
    public function __construct(
        string $appName,
        IRequest $request,
        private IUserSession $userSession,
        private IConfig $config,
        private IURLGenerator $urlGenerator,
        private LeaveService $leaveService,
    ) {
        parent::__construct($appName, $request);
    }

    private function ensureLoggedIn(): void {
        if ($this->userSession->getUser() === null) {
            throw new \Exception('Not logged in');
        }
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getToken(): JSONResponse {
        $this->ensureLoggedIn();
        $user = $this->userSession->getUser();
        $uid = $user->getUID();
        $token = $this->config->getUserValue($uid, Application::APP_ID, 'ics_token', '');
        if ($token === '') {
            $token = bin2hex(random_bytes(16));
            $this->config->setUserValue($uid, Application::APP_ID, 'ics_token', $token);
        }
        $url = $this->urlGenerator->linkToRouteAbsolute('talk_rh.ics.feed', ['uid' => $uid, 'token' => $token]);
        return new JSONResponse(['uid' => $uid, 'token' => $token, 'url' => $url]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function regenToken(): JSONResponse {
        $this->ensureLoggedIn();
        $user = $this->userSession->getUser();
        $uid = $user->getUID();
        $token = bin2hex(random_bytes(16));
        $this->config->setUserValue($uid, Application::APP_ID, 'ics_token', $token);
        $url = $this->urlGenerator->linkToRouteAbsolute('talk_rh.ics.feed', ['uid' => $uid, 'token' => $token]);
        return new JSONResponse(['uid' => $uid, 'token' => $token, 'url' => $url]);
    }

    private function icsEscape(string $s): string {
        // Escape commas, semicolons, backslashes and newlines per RFC5545
        $s = str_replace('\\', '\\\\', $s);
        $s = str_replace([",", ";"], ['\,', '\;'], $s);
        $s = str_replace(["\r\n", "\n", "\r"], '\\n', $s);
        return $s;
    }

    private function dateAddDays(string $isoDate, int $days): string {
        $d = new \DateTimeImmutable($isoDate);
        $d = $d->modify(($days >= 0 ? '+' : '') . $days . ' day');
        return $d->format('Ymd');
    }

    /**
     * Public ICS feed for a user's approved leaves
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
    public function feed(string $uid, string $token): Response {
        // Validate token
        $expected = $this->config->getUserValue($uid, Application::APP_ID, 'ics_token', '');
        if ($expected === '' || !hash_equals($expected, $token)) {
            return new TextPlainResponse('Invalid token', 403);
        }

        $leaves = $this->leaveService->getApprovedLeavesForUser($uid);
        $now = (new \DateTimeImmutable())->format('Ymd\THis\Z');

        $lines = [];
        $lines[] = 'BEGIN:VCALENDAR';
        $lines[] = 'VERSION:2.0';
        $lines[] = 'PRODID:-//talk_rh//Nextcloud//FR';
        $lines[] = 'CALSCALE:GREGORIAN';
        $lines[] = 'METHOD:PUBLISH';

        foreach ($leaves as $l) {
            $start = str_replace('-', '', (string)$l['start_date']); // YYYYMMDD
            // DTEND is exclusive; add 1 day to end_date for all-day event
            $endExclusive = $this->dateAddDays((string)$l['end_date'], 1);
            $summary = p($l->t('Congé approuvé'));
            if (!empty($l['type'])) {
                $typeFr = $l['type'] === 'paid' ? p($l->t('Soldé')) : ($l['type'] === 'unpaid' ? p($l->t('Sans Solde')) : p($l->t('Récup.')));
                $summary .= ' · ' . $typeFr;
            }
            $desc = '';
            if (!empty($l['reason'])) {
                $desc = t('talk_rh', 'Raison: ') . (string)$l['reason'];
            }
            if (!empty($l['admin_comment'])) {
                $desc .= ($desc ? "\\n" : '') . p($l->t('Commentaire: ')) . (string)$l['admin_comment'];
            }
            $uidLine = 'talk_rh-leave-' . (string)$l['id'] . '@' . parse_url($this->urlGenerator->getBaseUrl(), PHP_URL_HOST);

            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:' . $this->icsEscape($uidLine);
            $lines[] = 'DTSTAMP:' . $now;
            $lines[] = 'DTSTART;VALUE=DATE:' . $start;
            $lines[] = 'DTEND;VALUE=DATE:' . $endExclusive;
            $lines[] = 'SUMMARY:' . $this->icsEscape($summary);
            if ($desc !== '') {
                $lines[] = 'DESCRIPTION:' . $this->icsEscape($desc);
            }
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        $resp = new TextPlainResponse(implode("\r\n", $lines));
        $resp->addHeader('Content-Type', 'text/calendar; charset=utf-8');
        return $resp;
    }
}
