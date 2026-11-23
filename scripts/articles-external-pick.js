/* External Article Source + Pick Article — isolated prototype controller.
 * This module deliberately stores only in-memory state. It DOES NOT perform a
 * cross-user lock, a CMS write, or a claim transaction. API contract below:
 * POST /articles/:id/pick must be atomic and reject a competing claim (409).
 */
(function () {
  'use strict';
  const CURRENT_EDITOR = 'Raka Pratama'; // fictional demo actor, not authenticated user identity
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
      if (name) name.textContent = editor || 'Belum Ada Editor';
      if (label) label.textContent = editor ? 'Editor · Draft Eksternal' : 'Draft Eksternal';
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
    state.textContent = available ? 'Tersedia' :
      mine ? 'Ditangani Anda' : 'Ditangani ' + owner;
    panel.appendChild(state);

    if (available || mine) {
      const button = document.createElement('button');
      button.type = 'button';
      // Reuse the existing Design System button; compact is only a scoped size variant.
      button.className = 'nr-btn nr-pick-button ' + (mine ? 'is-release' : 'is-claim');
      button.dataset.pickAction = mine ? 'release' : 'pick';
      button.textContent = mine ? 'Lepaskan' : 'Ambil';
      button.setAttribute('aria-label',(mine?'Lepaskan penanganan artikel: ':'Ambil artikel untuk ditangani: ')+(row.dataset.title || 'Draft'));
      panel.appendChild(button);
    } else {
      // Owner is already visible in the status and Reporter/Editor column.
      // Avoid a second repetitive warning line that makes the row too tall.
    }

    // Ownership filter and My Articles should reflect the current Pick (demo).
    row.dataset.owner = mine ? 'me' : 'team';
    reflectOwner(row,owner);

    const menuTrigger = row.querySelector('.article-more-btn');
    if (menuTrigger) {
      // No editorial Settings for draft that has not been picked by current
      // Editor. Preview via eye remains available.
      menuTrigger.disabled = !mine;
      menuTrigger.setAttribute('aria-label', mine ?
        'Settings Artikel (Demo)' : 'Settings terkunci — Pick Artikel terlebih dahulu');
      menuTrigger.title = mine ? 'Settings Artikel (Demo)' :
        (available ? 'Ambil artikel sebelum mengedit' : 'Sedang ditangani '+owner);
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
        announce('Artikel sedang ditangani ' + pickedBy);
        return;
      }
      row.dataset.pickedBy = CURRENT_EDITOR;
      announce('Artikel sekarang ditangani Anda (Demo)');
    } else if (button.dataset.pickAction === 'release') {
      if (pickedBy !== CURRENT_EDITOR) {
        announce('Hanya Editor yang menangani artikel dapat melepaskannya');
        return;
      }
      delete row.dataset.pickedBy;
      announce('Artikel kembali tersedia (Demo)');
    }
    render(row);
    refreshFilter();
    if (!row.hidden) row.querySelector('.nr-pick-button')?.focus({preventScroll:true});
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
