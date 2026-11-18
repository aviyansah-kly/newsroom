/* Newsroom Article List — read-only, self-contained article preview.
 * Never publishes, edits, requests live URLs or writes to CMS backend. */
(function () {
  'use strict';
  const rows = [...document.querySelectorAll('.article-row')];
  if (!rows.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'nr-article-preview-overlay';
  overlay.hidden = true;
  overlay.innerHTML =
    '<section class="nr-article-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="nrArticlePreviewHeading">' +
      '<header class="nr-article-preview-topbar">' +
        '<div class="nr-article-preview-heading"><strong id="nrArticlePreviewHeading">Preview Artikel</strong><span>Data dummy · tidak dipublikasikan</span></div>' +
        '<div class="nr-article-preview-modes" aria-label="Tampilan Preview" role="group">' +
          '<button type="button" data-preview-mode="desktop" aria-pressed="true"><i data-lucide="monitor"></i><span>Desktop</span></button>' +
          '<button type="button" data-preview-mode="mobile" aria-pressed="false"><i data-lucide="smartphone"></i><span>Mobile</span></button>' +
        '</div>' +
        '<button type="button" class="nr-article-preview-close" aria-label="Tutup Preview Artikel"><i data-lucide="x"></i></button>' +
      '</header>' +
      '<div class="nr-article-preview-scroll">' +
        '<article class="nr-article-preview-canvas" aria-label="Isi artikel dummy">' +
          '<div class="nr-article-preview-kicker"></div>' +
          '<h2 class="nr-article-preview-title"></h2>' +
          '<p class="nr-article-preview-byline"></p>' +
          '<div class="nr-article-preview-photo"></div>' +
          '<p class="nr-article-preview-summary"></p>' +
          '<p class="nr-article-preview-fallback">Konten lengkap belum tersedia dalam data dummy Article List.</p>' +
        '</article>' +
      '</div>' +
    '</section>';
  document.body.appendChild(overlay);
  let origin = null;
  let previousOverflow = '';
  const panel = overlay.querySelector('.nr-article-preview-dialog');
  const modes = [...overlay.querySelectorAll('[data-preview-mode]')];
  const close = overlay.querySelector('.nr-article-preview-close');

  function setMode(mode) {
    panel.dataset.mode = mode;
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.previewMode === mode)));
  }
  function closePreview() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = previousOverflow;
    if (origin?.isConnected) origin.focus({preventScroll:true});
  }
  function openPreview(button) {
    const row = button.closest('.article-row');
    if (!row) return;
    const title = row.dataset.title || row.querySelector('.article-title')?.textContent?.trim() || 'Artikel';
    const description = row.querySelector('.article-description')?.textContent?.trim() || 'Ringkasan artikel tidak tersedia.';
    const byline = row.querySelector('.article-reporter-cell strong')?.textContent?.trim() ||
                   row.querySelector('.article-owner strong')?.textContent?.trim() || 'Redaksi Liputan6';
    const kicker = row.querySelector('.article-kicker')?.textContent?.replace(/\s+/g,' ').trim() || 'Liputan6';
    const status = row.querySelector('.article-status-pill')?.textContent?.trim() || row.dataset.status || 'Draft';
    const headline = row.querySelector('.article-thumb img');
    const photo = overlay.querySelector('.nr-article-preview-photo');
    const img = headline?.getAttribute('src');

    overlay.querySelector('.nr-article-preview-title').textContent = title;
    overlay.querySelector('.nr-article-preview-summary').textContent = description;
    overlay.querySelector('.nr-article-preview-byline').textContent = byline + ' · ' + status;
    overlay.querySelector('.nr-article-preview-kicker').textContent = kicker;
    photo.replaceChildren();
    if (img) {
      const previewImg = document.createElement('img');
      previewImg.src = img;
      previewImg.alt = headline.getAttribute('alt') || 'Headline artikel';
      previewImg.loading = 'lazy';
      previewImg.referrerPolicy = 'no-referrer';
      previewImg.addEventListener('error', () => {
        photo.textContent = 'Gambar tidak tersedia dalam preview.';
      }, {once:true});
      photo.appendChild(previewImg);
    } else photo.textContent = 'Gambar belum tersedia';
    origin = button;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlay.hidden = false;
    setMode('desktop');
    if (window.lucide?.createIcons) window.lucide.createIcons({nodes:[overlay]});
    close.focus({preventScroll:true});
  }

  document.querySelectorAll('.article-preview-btn').forEach(button => {
    button.type = 'button';
    button.title = 'Preview Artikel';
    button.setAttribute('aria-label','Preview Artikel (Dummy)');
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openPreview(button);
    });
  });

  modes.forEach(button => button.addEventListener('click', () => setMode(button.dataset.previewMode)));
  close.addEventListener('click', closePreview);
  overlay.addEventListener('click', event => {
    if (event.target === overlay) closePreview();
  });
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePreview();
    } else if (event.key === 'Tab') {
      const focusables = [...overlay.querySelectorAll('button:not([disabled])')];
      const current = focusables.indexOf(document.activeElement);
      if (event.shiftKey && current === 0) {
        event.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!event.shiftKey && current === focusables.length - 1) {
        event.preventDefault();
        focusables[0].focus();
      }
    }
  });
})();
