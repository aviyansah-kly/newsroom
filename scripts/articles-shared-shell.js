/* Article List action adapter. AppHeader and AppSidebar are owned by
   newsroom-global-navigation.js / newsroom-shell.js and must not be cloned here. */
(function () {
  'use strict';

  function init() {
    if (!document.body.classList.contains('articles-page')) return;
    const header = document.querySelector('.nr-topbar');
    const menu = document.getElementById('newArticleMenu');
    const spacer = header?.querySelector('.nr-spacer');
    if (!header || !menu || !spacer) return;

    // Reparenting preserves the existing New Article click/dropdown listeners.
    if (menu.closest('.nr-topbar')) return;
    const oldParent = menu.parentElement;
    const actions = document.createElement('div');
    actions.className = 'nr-header-page-actions';
    actions.setAttribute('aria-label', 'Aksi Artikel');
    actions.appendChild(menu);
    spacer.insertAdjacentElement('afterend', actions);

    // Remove only the empty page-owned action wrapper. The search, filter,
    // Article List, pagination and selected article state are unchanged.
    if (oldParent?.classList.contains('article-head-actions') && !oldParent.children.length) {
      oldParent.remove();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
