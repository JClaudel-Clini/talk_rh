<?php
script('talk_rh', 'supervisor');
script('talk_rh', 'navigation');
script('talk_rh', 'loader');
style('files', 'style');
style('talk_rh', 'main');

// Set navigation context
$_['currentPage'] = 'supervisor';
?>
<div class="talkrh-layout">
  <?php include_once __DIR__ . '/navigation.php'; ?>
  <div class="talkrh-main">
    <div class="talkrh-container">
  <div class="talkrh-header">
    <h2><?php p($l->t('Gestion des demandes de congés')); ?></h2>
    <div class="talkrh-actions">
      <select id="filterStatus">
        <option value="ALL"><?php p($l->t('Tous les statuts')); ?></option>
        <option value="pending"><?php p($l->t('En attente')); ?></option>
        <option value="approved"><?php p($l->t('Approuvées')); ?></option>
        <option value="rejected"><?php p($l->t('Refusées')); ?></option>
      </select>
      <select id="filterUser">
        <option value="ALL"><?php p($l->t('Tous les employés')); ?></option>
      </select>
    </div>
  </div>
  <div class="talkrh-calendar">
    <div class="calendar-toolbar">
      <button id="prevMonth" class="button"><?php p($l->t('Mois précédent')); ?></button>
      <div class="month-label" id="monthLabel"></div>
      <button id="nextMonth" class="button"><?php p($l->t('Mois suivant')); ?></button>
    </div>
    <div class="calendar-weekdays">
      <div class="weekday"><?php p($l->t('Lundi')); ?></div>
      <div class="weekday"><?php p($l->t('Mardi')); ?></div>
      <div class="weekday"><?php p($l->t('Mercredi')); ?></div>
      <div class="weekday"><?php p($l->t('Jeudi')); ?></div>
      <div class="weekday"><?php p($l->t('Vendredi')); ?></div>
      <div class="weekday"><?php p($l->t('Samedi')); ?></div>
      <div class="weekday"><?php p($l->t('Dimanche')); ?></div>
    </div>
    <div class="calendar-grid" id="calendarGrid"></div>
  </div>
  <div id="supervisorListView" class="talkrh-list" style="display:none;">
    <div class="talkrh-card">
      <div class="title"><?php p($l->t('Liste des demandes')); ?></div>
      <div class="talkrh-meta"><?php p($l->t('Filtrée par Employé et Statut.')); ?></div>
      <div class="talkrh-table-wrapper">
        <table id="supervisorListTable" class="talkrh-table" style="width:100%">
          <thead>
            <tr>
              <th>#</th>
              <th><?php p($l->t('Employé')); ?></th>
              <th><?php p($l->t('Du')); ?></th>
              <th><?php p($l->t('Au')); ?></th>
              <th><?php p($l->t('Type')); ?></th>
              <th><?php p($l->t('Statut')); ?></th>
              <th><?php p($l->t('Actions')); ?></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  </div>
  <div class="talkrh-modal-backdrop" id="talkrhModalBackdrop" style="display:none;">
    <div class="talkrh-modal" role="dialog" aria-modal="true" aria-labelledby="talkrhModalTitle">
      <div class="talkrh-modal-header">
        <h3 id="talkrhModalTitle"></h3>
        <button id="talkrhModalClose" class="button"><?php p($l->t('Fermer')); ?></button>
      </div>
      <div id="talkrhModalBody"></div>
    </div>
  </div>
    </div>
  </div>
</div>


<?php include_once __DIR__ . '/partials/loader.php'; ?>
