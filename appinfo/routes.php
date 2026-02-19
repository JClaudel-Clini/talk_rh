<?php
return [
    'routes' => [
        // Page principale de ton app (celle qui s'ouvre depuis le menu)
        ['name' => 'page#index', 'url' => '/page', 'verb' => 'GET'],
        // Vue manager accessible explicitement pour les utilisateurs supervisant un compte
        ['name' => 'page#supervisorView', 'url' => '/page/supervisor', 'verb' => 'GET'],
        // Vue employé accessible explicitement (utile pour les admins aussi)
        ['name' => 'page#employeeView', 'url' => '/page/employee', 'verb' => 'GET'],
        ['name' => 'page#settingsView', 'url' => '/page/settings', 'verb' => 'GET'],

        // Employee API
        ['name' => 'api#getMyLeaves', 'url' => '/api/leaves', 'verb' => 'GET'],
        ['name' => 'api#createLeave', 'url' => '/api/leaves', 'verb' => 'POST'],
        ['name' => 'api#deleteLeave', 'url' => '/api/leaves/{id}', 'verb' => 'DELETE'],

        // Supervisor endpoints
        ['name' => 'api#listMyEmployees', 'url' => '/api/my/employees', 'verb' => 'GET'],
        ['name' => 'api#getSupervisorLeaves', 'url' => '/api/supervisor/leaves', 'verb' => 'GET'],
        ['name' => 'api#setLeaveStatus', 'url' => '/api/supervisor/leaves/{id}/status', 'verb' => 'POST'],

        // Admin API
        ['name' => 'api#getAllLeaves', 'url' => '/api/admin/leaves', 'verb' => 'GET'],
        ['name' => 'api#setLeaveStatus', 'url' => '/api/admin/leaves/{id}/status', 'verb' => 'POST'],

        // Settings (admin page renders via ISettings; this endpoint saves selection)
        ['name' => 'api#saveAdminGroup', 'url' => '/api/admin/settings/group', 'verb' => 'POST'],
        ['name' => 'api#getAdminGroup', 'url' => '/api/admin/settings/group', 'verb' => 'GET'],
        ['name' => 'api#listGroups', 'url' => '/api/admin/settings/groups', 'verb' => 'GET'],
        ['name' => 'api#getAdminGroupMembers', 'url' => '/api/admin/settings/group/members', 'verb' => 'GET'],
        ['name' => 'api#getTalkSetting', 'url' => '/api/admin/settings/talk', 'verb' => 'GET'],
        ['name' => 'api#saveTalkSetting', 'url' => '/api/admin/settings/talk', 'verb' => 'POST'],
        // Talk channel selection
        ['name' => 'api#listTalkChannels', 'url' => '/api/admin/settings/talk/channels', 'verb' => 'GET'],
        ['name' => 'api#getTalkChannel', 'url' => '/api/admin/settings/talk/channel', 'verb' => 'GET'],
        ['name' => 'api#saveTalkChannel', 'url' => '/api/admin/settings/talk/channel', 'verb' => 'POST'],
        // Admin test endpoint for Talk diagnostics
        ['name' => 'api#testTalk', 'url' => '/api/admin/test/talk', 'verb' => 'POST'],

        // ICS feature removed: direct calendar push is used instead
    ],
];
