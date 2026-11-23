/* External Article Source + Pick Article — isolated prototype controller.
 * This module deliberately stores only in-memory state. It DOES NOT perform a
 * cross-user lock, a CMS write, or a claim transaction. API contract below:
 * POST /articles/:id/pick must be atomic and reject a competing claim (409).
 */
(function () {
  'use strict';
  const CURRENT_EDITOR = 'Saya QA'; // demo actor, not authenticated user identity
  const list = document.getElementById('articleList');
  if (!list) return;

  const SOURCE_LABELS = Object.freeze({
    kira:'KIRA', gempa:'Gempa', harga:'Harga', cnc:'CNC',
    kontributor:'Kontributor', ai:'AI'
  });
  const icon = (name) => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const externalRows = [...list.querySelectorAll('.article-row[data-source]')]
    .filter(row => row.dataset.source !== 'manual');

  function reflectOwner(row, editor) {
    // Actual reporter/editor identity stays backend-owned. For DEMO external
    // rows the ownership cell serves as the claim assignee field.
    const owner = row.querySelector('.article-reporter-cell');
    if (owner) {
      const name = owner.querySelector('strong');
      const label = owner.querySelector('span');
      if (name) name.textContent = editor || 'Belum Dipick';
      if (label) label.textContent = editor ? 'Picked Editor (Demo)' : 'Belum Ditugaskan';
    }
  }

  function announce(text) {
    const feedback = document.getElementById('articleActionFeedback');
    if (!feedback) return;
    const label = feedback.querySelector('span');
    if (label) label.textContent = text;
    feedback.classList.add('show');
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => feedback.classList.remove('show'), 2600);
  }
  function refreshFilter() {
    // Existing Article List apply() owns search/status/source/pick combination,
    // counts and empty state. Reuse it instead of a second filter implementation.
    document.getElementById('articleSearch')?.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function render(row, initial) {
    const source = row.dataset.source;
    const owner = row.dataset.pickedBy || '';
    const mine = owner === CURRENT_EDITOR;
    const available = !owner;
    const isDraft = row.dataset.status === 'draft';
    const meta = row.querySelector('.article-meta');
    const copy = row.querySelector('.article-copy');
    if (!copy || !meta) return;

    let chip = row.querySelector('.nr-external-source');
    if (!chip) {
      chip = document.createElement('span');
      chip.className = 'nr-external-source';
      chip.title = 'Sumber eksternal (dummy)';
      meta.appendChild(chip);
    }
    chip.textContent = 'Sumber: ' + (SOURCE_LABELS[source] || source.toUpperCase());

    let panel = row.querySelector('.nr-external-pick');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'nr-external-pick';
      panel.setAttribute('aria-live', 'polite');
      meta.after(panel);
    }
    panel.replaceChildren();
    if (!isDraft) return;

    const state = document.createElement('span');
    state.className = 'nr-pick-status ' + (available ? 'is-available' : mine ? 'is-mine' : 'is-locked');
    state.textContent = available ? 'Belum Dipick' :
      mine ? 'Dipick oleh Anda' : 'Dipick oleh ' + owner;
    panel.appendChild(state);

    if (available || mine) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nr-pick-button' + (mine ? ' is-release' : '');
      button.dataset.pickAction = mine ? 'release' : 'pick';
      button.textContent = mine ? 'Lepas Pick' : 'Pick Artikel';
      button.setAttribute('aria-label',(mine?'Lepas Pick: ':'Pick Artikel: ')+(row.dataset.title || 'Draft'));
      panel.appendChild(button);
    } else {
      const lock = document.createElement('span');
      lock.className = 'nr-pick-locked-note';
      lock.textContent = 'Sedang dikerjakan Editor lain';
      panel.appendChild(lock);
    }

    reflectOwner(row,owner);

    const menuTrigger = row.querySelector('.article-more-btn');
    if (menuTrigger) {
      // No editorial Settings for draft that has not been picked by current
      // Editor. Preview via eye remains available.
      menuTrigger.disabled = !mine;
      menuTrigger.setAttribute('aria-label', mine ?
        'Settings Artikel (Demo)' : 'Settings terkunci — Pick Artikel terlebih dahulu');
      menuTrigger.title = mine ? 'Settings Artikel (Demo)' :
        (available ? 'Pick Artikel sebelum mengedit' : 'Dipick oleh '+owner);
      const wrapper = menuTrigger.closest('.article-more');
      if (wrapper && !mine) wrapper.classList.remove('open');
    }
    const titleLink = row.querySelector('.article-title a');
    if (titleLink) {
      titleLink.title = 'Lihat preview draft eksternal (Demo)';
      titleLink.setAttribute('aria-label','Preview Draft: '+(row.dataset.title||'Artikel'));
    }
  }

  externalRows.forEach(row => render(row,true));

  list.addEventListener('click', event => {
    const button = event.target.closest('[data-pick-action]');
    if (!button || !list.contains(button)) return;
    event.preventDefault();
    event.stopPropagation();

    const row = button.closest('.article-row[data-source]');
    if (!row || row.dataset.status !== 'draft') return;
    const pickedBy = row.dataset.pickedBy || '';

    if (button.dataset.pickAction === 'pick') {
      if (pickedBy) {
        // Race-safe for local interactions only; server must enforce 409.
        announce('Artikel ini sudah dipick oleh ' + pickedBy);
        return;
      }
      row.dataset.pickedBy = CURRENT_EDITOR;
      announce('Draft berhasil dipick oleh Anda (Demo)');
    } else if (button.dataset.pickAction === 'release') {
      if (pickedBy !== CURRENT_EDITOR) {
        announce('Hanya Editor yang melakukan Pick dapat melepasnya');
        return;
      }
      delete row.dataset.pickedBy;
      announce('Pick telah dilepas (Demo)');
    }
    render(row);
    refreshFilter();
  });

  list.addEventListener('click', event => {
    const link = event.target.closest('.article-row[data-source] .article-title a');
    if (!link) return;
    // External records have dummy IDs and cannot open an exact editor record.
    // Show the corresponding read-only Preview, rather than navigating to the
    // generic index.html Editor for the wrong article.
    event.preventDefault();
    event.stopPropagation();
    link.closest('.article-row')?.querySelector('.article-preview-btn')?.click();
  });

  if (window.lucide?.createIcons) window.lucide.createIcons({nodes:[list]});
})();
