<?php
script('talk_rh', 'employee');
script('talk_rh', 'navigation');
script('talk_rh', 'loader');
style('files', 'style');
style('talk_rh', 'main');

// Set navigation context
$_['currentPage'] = 'employee';
?>
<div class="talkrh-layout">
  <?php include_once __DIR__ . '/navigation.php'; ?>
  <div class="talkrh-main">
    <div class="talkrh-container">
  <div class="talkrh-header">
    <h2><?php p($l->t('Mes demandes de congés')); ?></h2>
  </div>
  <div id="leave-form" class="talkrh-form">
    <div class="field">
      <label for="startDate"><?php p($l->t('Date de début')); ?></label>
      <input type="date" id="startDate">
    </div>
    <div class="field">
      <label for="endDate"><?php p($l->t('Date de fin')); ?></label>
      <input type="date" id="endDate">
    </div>
    <div class="field">
      <label for="type"><?php p($l->t('Type')); ?></label>
      <select id="type">
        <option value="paid"><?php p($l->t('Soldé')); ?></option>
        <option value="unpaid"><?php p($l->t('Sans Solde')); ?></option>
        <option value="sick"><?php p($l->t('Récup.')); ?></option>
      </select>
    </div>
    <div class="field" id="onBehalfField" style="display:none;">
      <label for="onBehalf"><?php p($l->t('Au nom de')); ?></label>
      <select id="onBehalf">
        <option value=""><?php p($l->t('Moi-même')); ?></option>
      </select>
    </div>
    <div class="field">
      <label for="reason"><?php p($l->t('Raison (optionnel)')); ?></label>
      <input type="text" id="reason" placeholder="<?php p($l->t('Optionnel')); ?>">
    </div>
    <button id="createBtn" class="button primary"><?php p($l->t('Créer')); ?></button>
  </div>
  <div class="talkrh-actions" style="justify-content: space-between; align-items:center; margin: 8px 0;">
    <div>
      <label for="empPageSize" style="font-size:13px; color: var(--talkrh-muted);"><?php p($l->t('Affichage:')); ?></label>
      <select id="empPageSize">
        <option value="5">5</option>
        <option value="10" selected>10</option>
        <option value="15">15</option>
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
    <div>
      <button id="empPrev" class="button"><?php p($l->t('Précédent')); ?></button>
      <span id="empPageInfo" class="talkrh-meta" style="margin: 0 8px;"><?php p($l->t('Page')); ?> 1/1</span>
      <button id="empNext" class="button"><?php p($l->t('Suivant')); ?></button>
    </div>
  </div>
  <ul id="myLeaves" class="talkrh-list"></ul>
  <div class="talkrh-empty" id="empEmptyHint" style="display:none;"><?php p($l->t('Aucune demande pour le moment.')); ?></div>
    </div>
  </div>
</div>

<div class="talkrh-modal-backdrop" id="talkrhModalBackdrop" style="display:none;">
  <div class="talkrh-modal" role="dialog" aria-modal="true" aria-labelledby="talkrhModalTitle">
    <div class="talkrh-modal-header">
      <h3 id="talkrhModalTitle"></h3>
    </div>
    <div id="talkrhModalBody"></div>
  </div>
  </div>

<?php include_once __DIR__ . '/partials/loader.php'; ?>
