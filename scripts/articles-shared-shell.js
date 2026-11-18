/* Article List shares the Editor AppHeader and sidebar, while its
 * New Article action belongs to the Article List page heading—not the global header. */
(function () {
  'use strict';

  function init() {
    if (!document.body.classList.contains('articles-page')) return;
    const head = document.querySelector('.article-page-head');
    const menu = document.getElementById('newArticleMenu');
    if (!head || !menu) return;

    // Keep the ORIGINAL menu/button and its click handlers; reparenting never
    // clones the control and does not duplicate the dropdown.
    let actions = head.querySelector('.article-head-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'article-head-actions';
      head.appendChild(actions);
    }
    if (menu.parentElement !== actions) actions.appendChild(menu);

    // Remove the empty adapter slot from the global header, if any.
    document.querySelectorAll('.nr-topbar .nr-header-page-actions').forEach(el => {
      if (!el.children.length) el.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once:true });
  } else init();
})();
