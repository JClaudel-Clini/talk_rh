<?php
declare(strict_types=1);

namespace OCA\TalkRh\Controller;

use OCA\TalkRh\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\IGroupManager;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\IUserSession;
use Psr\Log\LoggerInterface;

class PageController extends Controller {
    public function __construct(
        string $appName,
        IRequest $request,
        private IUserSession $userSession,
        private IGroupManager $groupManager,
        private IConfig $config,
        private IURLGenerator $urlGenerator,
    ) {
        parent::__construct($appName, $request);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index(): TemplateResponse {
        $user = $this->userSession->getUser();
        if ($user === null) {
            return new TemplateResponse($this->appName, 'not-logged-in');
        }

        $apiController = \OC::$server->query(ApiController::class);
        $supervisedEmployees = $apiController->listMyEmployees()->getData();
        $isSupervisor = is_array($supervisedEmployees['employees']) && count($supervisedEmployees['employees']) > 0;

        $adminGroup = Application::getAdminGroupId($this->config);
        $isServerAdmin = $this->groupManager->isAdmin($user->getUID());
        $isAppAdmin = $this->groupManager->isInGroup($user->getUID(), $adminGroup);

        if ($isServerAdmin || $isAppAdmin) {
            return new TemplateResponse($this->appName, 'admin', ['isAdmin' => true, 'isSupervisor' => $isSupervisor]);
        }
        if ($isSupervisor) {
            return new TemplateResponse($this->appName, 'supervisor', ['isAdmin' => false, 'isSupervisor' => true]);
        }
        return new TemplateResponse($this->appName, 'employee', ['isAdmin' => false, 'isSupervisor' => false]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function employeeView(): TemplateResponse {
        $user = $this->userSession->getUser();
        $isAdmin = false;
        if ($user !== null) {
            $adminGroup = Application::getAdminGroupId($this->config);
            $isServerAdmin = $this->groupManager->isAdmin($user->getUID());
            $isAppAdmin = $this->groupManager->isInGroup($user->getUID(), $adminGroup);
            $isAdmin = $isServerAdmin || $isAppAdmin;
        }
        $apiController = \OC::$server->query(ApiController::class);
        $supervisedEmployees = $apiController->listMyEmployees()->getData();
        $isSupervisor = is_array($supervisedEmployees['employees']) && count($supervisedEmployees['employees']) > 0;

        return new TemplateResponse($this->appName, 'employee', ['isAdmin' => $isAdmin, 'isSupervisor' => $isSupervisor]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function supervisorView(): TemplateResponse {
        $user = $this->userSession->getUser();
        $isAdmin = false;
        if ($user !== null) {
            $adminGroup = Application::getAdminGroupId($this->config);
            $isServerAdmin = $this->groupManager->isAdmin($user->getUID());
            $isAppAdmin = $this->groupManager->isInGroup($user->getUID(), $adminGroup);
            $isAdmin = $isServerAdmin || $isAppAdmin;
        }
        $apiController = \OC::$server->query(ApiController::class);
        $supervisedEmployees = $apiController->listMyEmployees()->getData();
        $isSupervisor = is_array($supervisedEmployees['employees']) && count($supervisedEmployees['employees']) > 0;

        return new TemplateResponse($this->appName, 'supervisor', ['isAdmin' => $isAdmin, 'isSupervisor' => $isSupervisor]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function settingsView(): TemplateResponse {
        $user = $this->userSession->getUser();
        if ($user === null) {
            return new TemplateResponse($this->appName, 'not-logged-in');
        }

        $adminGroup = Application::getAdminGroupId($this->config);
        $isServerAdmin = $this->groupManager->isAdmin($user->getUID());
        $isAppAdmin = $this->groupManager->isInGroup($user->getUID(), $adminGroup);

        $apiController = \OC::$server->query(ApiController::class);
        $supervisedEmployees = $apiController->listMyEmployees()->getData();
        $isSupervisor = is_array($supervisedEmployees['employees']) && count($supervisedEmployees['employees']) > 0;

        if (!($isServerAdmin || $isAppAdmin)) {
            throw new \OCP\AppFramework\Http\NotFoundResponse();
        }
        
        return new TemplateResponse($this->appName, 'settings', ['isAdmin' => true, 'isSupervisor' => $isSupervisor]);
    }
}
