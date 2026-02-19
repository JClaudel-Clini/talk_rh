<?php
// Navigation template for TalkRH app
// Usage: include this file in your main templates
$isAdmin = $_['isAdmin'] ?? false;
$isSupervisor = $_['isSupervisor'] ?? false;
$currentPage = $_['currentPage'] ?? 'admin';
?>

<button class="talkrh-nav-toggle" aria-label="Toggle navigation">☰</button>
<nav class="talkrh-navigation">
  <ul class="app-navigation__list app-navigation-list">
    <?php if ($isAdmin): ?>
      <li class="app-navigation-entry-wrapper app-navigation-entry--collapsible app-navigation-entry--opened">
        <div class="app-navigation-entry <?php if ($currentPage === 'admin') echo 'active'; ?>">
          <a class="app-navigation-entry-link" href="/apps/talk_rh/page">
            <div class="app-navigation-entry-icon">
              <span class="icon-category-office<?php echo ($currentPage === 'admin') ? '-white' : '-dark'; ?>"></span>
            </div>
            <span class="app-navigation-entry__name"><?php echo $l->t('Vue admin'); ?></span>
          </a>
        </div>
        <ul class="app-navigation-entry__children">
          <li class="app-navigation-entry-wrapper">
            <div class="app-navigation-entry" id="nav-calendar-admin">
              <a id="navViewCalendar-admin" class="app-navigation-entry-link" href="/apps/talk_rh/page?view=calendar" data-view="calendar">
                <div class="app-navigation-entry-icon">
                  <span class="icon-calendar-dark"></span>
                </div>
                <span class="app-navigation-entry__name"><?php p($l->t('Vue calendrier')); ?></span>
              </a>
            </div>
          </li>
          <li class="app-navigation-entry-wrapper">
            <div class="app-navigation-entry" id="nav-list-admin">
              <a id="navViewList-admin" class="app-navigation-entry-link" href="/apps/talk_rh/page?view=list" data-view="list">
                <div class="app-navigation-entry-icon">
                  <span class="icon-toggle-filelist-dark"></span>
                </div>
                <span class="app-navigation-entry__name"><?php p($l->t('Vue liste')); ?></span>
              </a>
            </div>
          </li>
        </ul>
      </li>
    <?php endif; ?>
    <?php if ($isSupervisor): ?>
      <li class="app-navigation-entry-wrapper app-navigation-entry--collapsible app-navigation-entry--opened">
        <div class="app-navigation-entry <?php if ($currentPage === 'supervisor') echo 'active'; ?>">
          <a class="app-navigation-entry-link" href="/apps/talk_rh/page/supervisor">
            <div class="app-navigation-entry-icon">
              <span class="icon-category-office<?php echo ($currentPage === 'supervisor') ? '-white' : '-dark'; ?>"></span>
            </div>
            <span class="app-navigation-entry__name"><?php echo $l->t('Vue responsable'); ?></span>
          </a>
        </div>
        <ul class="app-navigation-entry__children">
          <li class="app-navigation-entry-wrapper">
            <div class="app-navigation-entry" id="nav-calendar-supervisor">
              <a id="navViewCalendar-supervisor" class="app-navigation-entry-link" href="/apps/talk_rh/page/supervisor?view=calendar" data-view="calendar">
                <div class="app-navigation-entry-icon">
                  <span class="icon-calendar-dark"></span>
                </div>
                <span class="app-navigation-entry__name"><?php p($l->t('Vue calendrier')); ?></span>
              </a>
            </div>
          </li>
          <li class="app-navigation-entry-wrapper">
            <div class="app-navigation-entry" id="nav-list-supervisor">
              <a id="navViewList-supervisor" class="app-navigation-entry-link" href="/apps/talk_rh/page/supervisor?view=list" data-view="list">
                <div class="app-navigation-entry-icon">
                  <span class="icon-toggle-filelist-dark"></span>
                </div>
                <span class="app-navigation-entry__name"><?php p($l->t('Vue liste')); ?></span>
              </a>
            </div>
          </li>
        </ul>
      </li>
    <?php endif; ?>
    <?php if ($isAdmin || $isSupervisor): ?>
      <li class="app-navigation-entry-wrapper">
        <div class="app-navigation-entry <?php if ($currentPage === 'employee') echo 'active'; ?>">
          <a class="app-navigation-entry-link" href="/apps/talk_rh/page/employee">
            <div class="app-navigation-entry-icon">
              <span class="icon-user<?php echo ($currentPage === 'employee') ? '-white' : '-dark'; ?>"></span>
            </div>
            <span class="app-navigation-entry__name"><?php p($l->t('Vue employé')); ?></span>
          </a>
        </div>
      </li>
    <?php else: ?>
      <li class="app-navigation-entry-wrapper">
        <div class="app-navigation-entry <?php if ($currentPage === 'employee') echo 'active'; ?>">
          <a class="app-navigation-entry-link" href="#">
            <div class="app-navigation-entry-icon">
              <span class="icon-user<?php echo ($currentPage === 'employee') ? '-white' : '-dark'; ?>"></span>
            </div>
            <span class="app-navigation-entry__name"><?php p($l->t('Mes congés')); ?></span>
          </a>
        </div>
      </li>
    <?php endif; ?>
  </ul>
  
  <?php if ($isAdmin): ?>
  <div class="app-navigation-settings">
    <div class="app-navigation-entry-wrapper">
      <div class="app-navigation-entry <?php if ($currentPage === 'settings') echo 'active'; ?>">
        <a class="app-navigation-entry-link" href="/apps/talk_rh/page/settings">
          <div class="app-navigation-entry-icon">
            <span class="icon-settings<?php echo ($currentPage === 'settings') ? '-white' : '-dark'; ?>"></span>
          </div>
          <span class="app-navigation-entry__name"><?php p($l->t('Paramètres')); ?></span>
        </a>
      </div>
    </div>
  </div>
  <?php endif; ?>
</nav>
