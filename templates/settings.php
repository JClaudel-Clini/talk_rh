<?php
script('talk_rh', 'admin');
script('talk_rh', 'navigation');
script('talk_rh', 'loader');
style('files', 'style');
script('talk_rh', 'settings');
style('talk_rh', 'main');

// Set navigation context
$_['currentPage'] = 'settings';
?>
<div class="talkrh-layout">
  <?php include_once __DIR__ . '/navigation.php'; ?>
  <div class="talkrh-main">
    <div class="talkrh-container">
      <div class="talkrh-header">
        <h2><?php p($l->t('Paramètres de l\'application')); ?></h2>
      </div>
      
      <div class="talkrh-card">
        <div class="title"><?php p($l->t('Groupe administrateur')); ?></div>
        <div class="talkrh-meta"><?php p($l->t('Sélectionnez le groupe Nextcloud qui aura les droits d\'administration sur cette application.')); ?></div>
        
        <div class="field">
          <label for="settingsGroupSelect"><?php p($l->t('Groupe admin')); ?></label>
          <select id="settingsGroupSelect" class="">
            <option value=""><?php p($l->t('Chargement...')); ?></option>
          </select>
        </div>
        
        <h4><?php p($l->t('Membres du groupe')); ?></h4>
        <ul id="settingsMembersList" class="talkrh-list">
          <li><?php p($l->t('Chargement...')); ?></li>
        </ul>
        
        <div class="talkrh-actions">
          <button id="saveSettingsBtn" class="button primary"><?php p($l->t('Enregistrer')); ?></button>
        </div>
      </div>

      <div class="talkrh-card">
        <div class="title"><?php p($l->t('Intégration Talk')); ?></div>
        <div class="talkrh-meta"><?php p($l->t('Lorsque cette option est activée, une demande de congés enverra un message Talk au manager. Lorsqu\'un manager valide/refuse, un message sera envoyé à l\'employé.')); ?></div>
        <div class="field">
          <label class="talkrh-switch">
            <input type="checkbox" id="talkToggle" class="talkrh-switch-input" />
            <span class="talkrh-switch-slider" aria-hidden="true"></span>
            <span class="talkrh-switch-text"><?php p($l->t('Activer les messages Talk')); ?></span>
          </label>
        </div>
        <div class="field">
          <label for="talkChannelSelect"><?php p($l->t('Canal Talk (multi-utilisateurs)')); ?></label>
          <select id="talkChannelSelect">
            <option value=""><?php p($l->t('Chargement...')); ?></option>
          </select>
          <div class="talkrh-meta"><?php p($l->t('Si un canal est sélectionné, chaque nouvelle demande sera également publiée dans ce canal (en plus des messages aux managers). Laisser vide pour ne pas publier dans un canal.')); ?></div>
        </div>
        <div class="talkrh-actions">
          <button id="saveTalkBtn" class="button"><?php p($l->t('Sauvegarder')); ?></button>
          <button id="saveTalkChannelBtn" class="button"><?php p($l->t('Enregistrer le canal')); ?></button>
        </div>
      </div>
    </div>
  </div>
</div>


<?php include_once __DIR__ . '/partials/loader.php'; ?>
