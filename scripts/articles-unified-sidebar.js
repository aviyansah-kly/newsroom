/* Standard-page adapter for the approved Editor two-level CMS sidebar.
   The Editor's latest sidebar has a 66px Dashboard/Admin rail + a content column,
   not the deprecated one-column legacy navigation. Scope rollout to Article List
   while keeping the existing sidebar account, item destinations and controllers. */
(function () {
  'use strict';

  const adminNames = [
    'Channel Management', 'Product Management', 'Ads Management',
    'Site Ads Management', 'Users', 'Activity Logs', 'Breaking News',
    'Dashboard Alerts', 'Widget', 'Site Management', 'Custom Page',
    'Topic Type', 'Program Type', 'Autocorrect Terms', 'Pageview Targets',
    'Custom Scripts', 'Partners', 'Autopost', 'Initiative Management',
    'Feature Toggling', 'Tools', 'Whitelist Link', 'Building Link'
  ];
  const adminIcons = [
    'radio-tower', 'package', 'megaphone', 'panels-top-left', 'users',
    'history', 'radio', 'bell', 'layout-template', 'globe', 'file-code',
    'tags', 'list-tree', 'spell-check', 'chart-no-axes-column', 'code-2',
    'handshake', 'send', 'clipboard-list', 'toggle-right', 'wrench',
    'link-2', 'link'
  ];

  function init() {
    if (!document.body.classList.contains('articles-page')) return;
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || sidebar.classList.contains('nr-unified-nav')) return;
    const oldScroll = sidebar.querySelector('.nr-sidebar-scroll');
    const toggle = document.getElementById('sidebarToggle');
    const account = sidebar.querySelector('.nr-sidebar-bottom');
    if (!oldScroll || !toggle || !account) return;

    const originalItems = [...oldScroll.querySelectorAll('[data-item]')];
    const dashboardList = document.createElement('div');
    dashboardList.className = 'nr-nav-list';
    dashboardList.dataset.group = 'dashboard';

    // Preserve existing menu elements (including hrefs) rather than duplicate
    // them, and retain a single selected Articles item.
    originalItems.forEach(item => {
      item.classList.toggle('active', item.dataset.item === 'Articles');
      dashboardList.appendChild(item);
    });

    const adminList = document.createElement('div');
    adminList.className = 'nr-nav-list';
    adminList.dataset.group = 'admin';
    adminList.hidden = true;
    adminNames.forEach((name, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nr-nav-item nr-admin-placeholder';
      button.dataset.adminMenu = name;
      button.title = 'Menu existing: ' + name + ' (halaman belum terhubung pada prototipe)';
      const icon = document.createElement('i');
      icon.dataset.lucide = adminIcons[index] || 'settings';
      const label = document.createElement('span');
      label.textContent = name;
      button.append(icon, label);
      adminList.appendChild(button);
    });

    const rail = document.createElement('nav');
    rail.className = 'nr-nav-rail';
    rail.setAttribute('aria-label', 'Kelompok Menu');

    const panel = document.createElement('div');
    panel.className = 'nr-nav-content';
    const heading = document.createElement('div');
    heading.className = 'nr-nav-heading';
    const groupTitle = document.createElement('strong');
    groupTitle.textContent = 'Dashboard';
    heading.appendChild(groupTitle);

    toggle.setAttribute('aria-label', 'Sembunyikan Menu');
    toggle.title = 'Sembunyikan Menu';
    heading.appendChild(toggle);
    panel.append(heading, dashboardList, adminList);

    const selectGroup = (key, target) => {
      rail.querySelectorAll('[data-nav-group]').forEach(button => {
        button.setAttribute('aria-selected', String(button === target));
      });
      dashboardList.hidden = key !== 'dashboard';
      adminList.hidden = key !== 'admin';
      groupTitle.textContent = key === 'dashboard' ? 'Dashboard' : 'Admin';
    };
    [['dashboard', 'layout-dashboard', 'Dashboard'], ['admin', 'settings', 'Admin']]
      .forEach(([key, icon, name]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.navGroup = key;
        button.setAttribute('aria-selected', String(key === 'dashboard'));
        button.title = name;
        const glyph = document.createElement('i');
        glyph.dataset.lucide = icon;
        const label = document.createElement('span');
        label.textContent = name;
        button.append(glyph, label);
        button.addEventListener('click', () => {
          if (document.body.classList.contains('nr-sidebar-collapsed')) toggle.click();
          selectGroup(key, button);
        });
        rail.appendChild(button);
      });

    // The old search row is no longer part of the latest Editor sidebar.
    // Keep its input in a hidden compatibility host for existing listeners.
    const compatibility = document.createElement('div');
    compatibility.hidden = true;
    compatibility.className = 'nr-nav-legacy-controls';
    const oldSearchRow = sidebar.querySelector('.nr-global-search-row');
    if (oldSearchRow) compatibility.appendChild(oldSearchRow);

    sidebar.insertBefore(rail, sidebar.firstChild);
    sidebar.insertBefore(panel, account);
    oldScroll.remove();
    sidebar.appendChild(compatibility);
    account.classList.add('nr-nav-account');
    sidebar.classList.add('nr-unified-nav');

    // Account is still owned by scripts/newsroom-shell.js, not this adapter.
    if (window.lucide?.createIcons) window.lucide.createIcons({ nodes: [rail, heading, adminList] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
