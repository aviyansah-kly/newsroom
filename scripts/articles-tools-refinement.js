/* Article List Tools V2 — isolated UI adapter for Newsroom prototype.
 * This replaces the legacy rebuilt action-menu DOM. No backend mutations.
 * Existing row, article link, filter, and shared header/sidebar remain untouched.
 */
(function () {
  'use strict';
  const rows = [...document.querySelectorAll('.article-row')];
  if (!rows.length) return;

  const states = new WeakMap();
  const icon = (name) => '<i data-lucide="' + name + '" aria-hidden="true"></i>';
  const escapeHTML = (value) => String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function initialState(row) {
    const quick = (name) => !!row.querySelector('.article-quick-btn[data-action="' + name + '"].is-active');
    const option = (name) => !!row.querySelector('.article-feature-option[data-choice="' + name + '"].is-active');
    const index = rows.indexOf(row);
    const isFirst = index === 0;
    return {
      published: row.dataset.status === 'published',
      distribute: quick('distribute'),
      curated: quick('curated'),
      exclude: quick('exclude'),
      adult: quick('adult'),
      feedback: quick('feedback'),
      varnish: quick('varnish'),
      headlineHome: option('Headline · Home') || isFirst,
      headlineTV: option('Headline · TV'),
      pinHome: option('Pin Article · Home'),
      pinTV: option('Pin Article · TV'),
      adsDesktop: option('Article Ads · Desktop') || isFirst,
      adsMobile: option('Article Ads · Mobile'),
      advanced: false,
      technical: false,
      confirmUnpublish: false
    };
  }

  const toggleRow = (key, label, description, glyph, on) =>
    '<button type="button" class="nr-tools-row" data-tools-toggle="' + key +
    '" aria-pressed="' + on + '"><span class="nr-tools-leading">' + icon(glyph) +
    '<span class="nr-tools-copy"><strong>' + label + '</strong>' +
    (description ? '<small>' + description + '</small>' : '') +
    '</span></span><span class="nr-tools-switch" aria-hidden="true"><span></span></span></button>';
  const choice = (key, label, glyph, on) =>
    '<button type="button" class="nr-tools-choice' + (on ? ' is-selected' : '') +
    '" data-tools-toggle="' + key + '" aria-pressed="' + on + '">' +
    icon(glyph) + '<span>' + label + '</span>' +
    '<span class="nr-tools-check" aria-hidden="true">' + (on ? icon('check') : '') + '</span></button>';

  function menuHTML(row, s) {
    const title = row.dataset.title || row.querySelector('.article-title')?.textContent || 'Artikel';
    const status = s.published ? 'Published' : (row.dataset.status === 'review' ? 'Ready to Review' :
      row.dataset.status === 'scheduled' ? 'Scheduled' : 'Draft');
    return '' +
      '<div class="nr-tools-header"><div><strong>Tools Artikel</strong>' +
      '<p title="' + escapeHTML(title) + '">' + escapeHTML(title) + '</p></div>' +
      '<button type="button" class="nr-tools-close" data-tools-command="close" aria-label="Tutup Tools">' + icon('x') + '</button></div>' +
      '<div class="nr-tools-scroll">' +
        '<div class="nr-tools-section"><span class="nr-tools-label">Aksi Artikel</span>' +
          '<div class="nr-tools-meta"><span>Status</span><span class="nr-tools-status' +
          (s.published ? ' published' : '') + '">' + status + '</span></div>' +
          '<button type="button" class="nr-tools-link" data-tools-command="open-url">' +
          icon('external-link') + '<span>Buka URL Artikel</span>' + icon('arrow-up-right') + '</button>' +
          toggleRow('distribute', 'Distribusi', 'Aktifkan distribusi artikel', 'send', s.distribute) +
        '</div>' +
        '<div class="nr-tools-section"><span class="nr-tools-label">Penempatan</span>' +
          '<div class="nr-tools-field"><div class="nr-tools-field-head">' + icon('panel-top') +
          '<span><strong>Headline</strong><small>Tampilkan di halaman pilihan</small></span></div>' +
          '<div class="nr-tools-choices">' +
            choice('headlineHome', 'Homepage', 'house', s.headlineHome) +
            choice('headlineTV', 'TV', 'tv', s.headlineTV) +
          '</div></div>' +
          '<div class="nr-tools-field"><div class="nr-tools-field-head">' + icon('pin') +
          '<span><strong>Pin Artikel</strong><small>Prioritaskan posisi artikel</small></span></div>' +
          '<div class="nr-tools-choices">' +
            choice('pinHome', 'Homepage', 'house', s.pinHome) +
            choice('pinTV', 'TV', 'tv', s.pinTV) +
          '</div></div>' +
          toggleRow('curated', 'Curated', '', 'badge-check', s.curated) +
          toggleRow('exclude', 'Exclude', 'Kecualikan dari penempatan', 'ban', s.exclude) +
        '</div>' +
        '<div class="nr-tools-section"><span class="nr-tools-label">Pengaturan Lanjutan</span>' +
          '<button class="nr-tools-disclosure" type="button" data-tools-disclosure="advanced" aria-expanded="' + s.advanced + '">' +
          icon('badge-dollar-sign') + '<span><strong>Monetisasi & Konten</strong><small>Konten dewasa dan penempatan iklan</small></span>' +
          icon(s.advanced ? 'chevron-up' : 'chevron-down') + '</button>' +
          (s.advanced ? '<div class="nr-tools-disclosure-content">' +
            toggleRow('adult', 'Konten Dewasa', '', 'shield-alert', s.adult) +
            toggleRow('adsDesktop', 'Iklan Desktop', '', 'monitor', s.adsDesktop) +
            toggleRow('adsMobile', 'Iklan Mobile', '', 'smartphone', s.adsMobile) +
            '</div>' : '') +
          '<button class="nr-tools-disclosure" type="button" data-tools-disclosure="technical" aria-expanded="' + s.technical + '">' +
          icon('wrench') + '<span><strong>Teknis</strong><small>Feedback, cache, dan pengujian</small></span>' +
          icon(s.technical ? 'chevron-up' : 'chevron-down') + '</button>' +
          (s.technical ? '<div class="nr-tools-disclosure-content">' +
            toggleRow('feedback', 'Feedback', '', 'message-square', s.feedback) +
            toggleRow('varnish', 'Bypass Varnish', '', 'refresh-cw-off', s.varnish) +
            '<button class="nr-tools-link" type="button" data-tools-command="google-tools">' + icon('flask-conical') +
            '<span>Google Testing Tools</span>' + icon('arrow-up-right') + '</button></div>' : '') +
        '</div>' +
        (s.published ? '<div class="nr-tools-section nr-tools-danger-section">' +
          (s.confirmUnpublish ?
            '<div class="nr-tools-confirm"><strong>Batalkan publikasi?</strong><p>Perubahan ini hanya simulasi UI.</p>' +
            '<div><button type="button" data-tools-command="cancel-unpublish">Batal</button>' +
            '<button type="button" class="nr-tools-confirm-danger" data-tools-command="confirm-unpublish">Ya, Unpublish</button></div></div>' :
            '<button type="button" class="nr-tools-unpublish" data-tools-command="unpublish">' +
            icon('globe-2') + '<span>Unpublish Artikel</span></button>') +
          '</div>' : '') +
      '</div>' +
      '<div class="nr-tools-footer">' + icon('info') + '<span>Preview interaktif · perubahan belum disimpan ke CMS</span></div>';
  }

  function announce(text) {
    const region = document.getElementById('articleActionFeedback');
    if (!region) return;
    const label = region.querySelector('span');
    if (label) label.textContent = text;
    region.classList.add('show');
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => region.classList.remove('show'), 2500);
  }

  function syncRow(row, s) {
    // Show compact, deduplicated settings as read-only chips in the index.
    const keys = [
      ['distribute', 'Distribusi', 'send'], ['headlineHome', 'Headline Homepage', 'panel-top'],
      ['headlineTV', 'Headline TV', 'tv'], ['pinHome', 'Pin Homepage', 'pin'],
      ['pinTV', 'Pin TV', 'pin'], ['curated', 'Curated', 'badge-check'],
      ['exclude', 'Exclude', 'ban'], ['adult', 'Konten Dewasa', 'shield-alert'],
      ['adsDesktop', 'Iklan Desktop', 'monitor'], ['adsMobile', 'Iklan Mobile', 'smartphone'],
      ['feedback', 'Feedback', 'message-square'], ['varnish', 'Bypass Varnish', 'refresh-cw-off']
    ];
    const meta = row.querySelector('.article-meta');
    let chips = row.querySelector('.article-setting-chips');
    if (!chips && meta) {
      chips = document.createElement('div');
      chips.className = 'article-setting-chips';
      meta.after(chips);
    }
    if (chips) {
      chips.replaceChildren();
      keys.filter(([key]) => s[key]).forEach(([, label, glyph]) => {
        const chip = document.createElement('span');
        chip.className = 'article-setting-chip';
        chip.title = label;
        chip.setAttribute('aria-label', label + ' aktif');
        chip.innerHTML = icon(glyph);
        chips.appendChild(chip);
      });
      chips.hidden = !chips.children.length;
    }
    const status = row.querySelector('.article-status-pill');
    if (status && row.dataset.status !== 'scheduled' && row.dataset.status !== 'review') {
      status.className = 'article-status-pill ' + (s.published ? 'published' : 'draft');
      status.textContent = s.published ? 'Published' : 'Draft';
    }
    if (window.lucide?.createIcons) window.lucide.createIcons({nodes: [chips].filter(Boolean)});
  }

  function position(menu, trigger) {
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(356, window.innerWidth - 16);
    const height = Math.min(615, window.innerHeight - 16);
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    let top = rect.bottom + 8;
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 8);
    menu.style.setProperty('--nr-tools-left', left + 'px');
    menu.style.setProperty('--nr-tools-top', top + 'px');
    menu.style.setProperty('--nr-tools-max-height', Math.min(height, window.innerHeight - top - 8) + 'px');
  }

  rows.forEach(row => {
    const more = row.querySelector('.article-more');
    const menu = more?.querySelector('.article-row-menu');
    const trigger = more?.querySelector('.article-more-btn');
    if (!menu || !trigger) return;
    const state = initialState(row);
    states.set(row, state);
    menu.classList.add('nr-tools-menu');
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Tools Artikel');
    menu.setAttribute('aria-modal', 'false');
    const render = (focusKey) => {
      // Do not jump to the top of a long popup after toggling a setting.
      const previousScroll = focusKey ? (menu.querySelector('.nr-tools-scroll')?.scrollTop || 0) : 0;
      menu.innerHTML = menuHTML(row, state);
      if (window.lucide?.createIcons) window.lucide.createIcons({nodes: [menu]});
      position(menu, trigger);
      const nextScroll = menu.querySelector('.nr-tools-scroll');
      if (nextScroll) nextScroll.scrollTop = previousScroll;
      if (focusKey) {
        const next = menu.querySelector('[data-tools-toggle="' + focusKey + '"], [data-tools-disclosure="' + focusKey + '"], [data-tools-command="' + focusKey + '"]');
        next?.focus({preventScroll:true});
      }
    };
    render();
    syncRow(row, state);
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'nr-tools-' + rows.indexOf(row));
    trigger.setAttribute('aria-expanded', 'false');
    menu.id = 'nr-tools-' + rows.indexOf(row);

    trigger.addEventListener('click', () => {
      // Legacy listener owns the open class. Keep accessible state and placement in sync.
      requestAnimationFrame(() => {
        const open = more.classList.contains('open');
        trigger.setAttribute('aria-expanded', String(open));
        if (open) render();
      });
    });

    menu.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !menu.contains(button)) return;
      event.stopPropagation();
      const key = button.dataset.toolsToggle;
      const disclosure = button.dataset.toolsDisclosure;
      const command = button.dataset.toolsCommand;
      if (key) {
        state[key] = !state[key];
        if (key === 'curated' && state.curated) state.exclude = false;
        if (key === 'exclude' && state.exclude) state.curated = false;
        render(key);
        syncRow(row, state);
        announce('Simulasi: pengaturan diperbarui (belum tersimpan)');
      } else if (disclosure) {
        state[disclosure] = !state[disclosure];
        render(disclosure);
      } else if (command === 'unpublish') {
        state.confirmUnpublish = true; render('cancel-unpublish');
      } else if (command === 'cancel-unpublish') {
        state.confirmUnpublish = false; render('unpublish');
      } else if (command === 'confirm-unpublish') {
        state.published = false;
        state.confirmUnpublish = false;
        row.dataset.status = 'draft';
        render();
        syncRow(row, state);
        document.getElementById('articleSearch')?.dispatchEvent(new Event('input', {bubbles:true}));
        announce('Simulasi: artikel menjadi Draft. Tidak ada perubahan di CMS.');
      } else if (command === 'open-url') {
        // Static preview has no canonical published URL; never fabricate one.
        const url = row.dataset.publishedUrl;
        if (url && /^https:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
        else announce('URL publik belum tersedia pada preview.');
      } else if (command === 'google-tools') {
        announce('Google Testing Tools belum terhubung di preview.');
      } else if (command === 'close') {
        more.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });

    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation();
        more.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', event => {
    if (event.target.closest('.article-more')) return;
    document.querySelectorAll('.article-more-btn[aria-expanded="true"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  });
  const closeOnViewportChange = () => {
    document.querySelectorAll('.article-more.open').forEach(more => {
      const menu = more.querySelector('.nr-tools-menu');
      const trigger = more.querySelector('.article-more-btn');
      if (menu && trigger) position(menu, trigger);
    });
  };
  window.addEventListener('resize', closeOnViewportChange);
  window.addEventListener('scroll', closeOnViewportChange, {passive:true});
})();
