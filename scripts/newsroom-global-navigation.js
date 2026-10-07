/* Shared Newsroom app chrome. Content and navigation copied from Editor baseline.
   Every standard application page uses this single component; the Editor remains its reference. */
(function(){
  'use strict';
  const editorBrand="<div class=\"newsroom-header-left\"><div class=\"newsroom-header-brand\" aria-label=\"KLY\"><img src=\"assets/KLY%20Logo.png\" alt=\"KLY\"></div><div class=\"newsroom-header-site-switcher newsroom-site-switcher\" id=\"newsroomSiteSwitcher\">\n  <button class=\"newsroom-header-site-trigger newsroom-site-trigger\" id=\"newsroomSiteTrigger\" type=\"button\" aria-haspopup=\"listbox\" aria-expanded=\"false\">\n    <span class=\"newsroom-site-wordmark\" id=\"newsroomSiteCurrent\"><img src=\"assets/liputan6-logo.svg\" alt=\"Liputan6\"></span>\n    <i data-lucide=\"chevrons-up-down\"></i>\n  </button>\n  <div class=\"newsroom-site-menu newsroom-header-site-menu\" id=\"newsroomSiteMenu\" role=\"listbox\" aria-label=\"Pilih site\">\n    <button type=\"button\" class=\"newsroom-site-option active\" data-site=\"Liputan6\" data-logo=\"assets/liputan6-logo.svg\" role=\"option\" aria-selected=\"true\"><span class=\"newsroom-site-option-mark\"><img src=\"assets/liputan6-logo.svg\" alt=\"Liputan6\"></span><i data-lucide=\"check\"></i></button>\n    <button type=\"button\" class=\"newsroom-site-option\" data-site=\"KapanLagi\" data-logo=\"assets/Kapanlagi.svg\" role=\"option\" aria-selected=\"false\"><span class=\"newsroom-site-option-mark kapanlagi\"><img src=\"assets/Kapanlagi.svg\" alt=\"KapanLagi\"></span><i data-lucide=\"check\"></i></button>\n    <button type=\"button\" class=\"newsroom-site-option\" data-site=\"Bola.com\" data-logo=\"assets/Bola.com.png\" role=\"option\" aria-selected=\"false\"><span class=\"newsroom-site-option-mark bola\"><img src=\"assets/Bola.com.png\" alt=\"Bola.com\"></span><i data-lucide=\"check\"></i></button>\n    <button type=\"button\" class=\"newsroom-site-option\" data-site=\"Merdeka.com\" data-logo=\"assets/Merdeka.svg\" role=\"option\" aria-selected=\"false\"><span class=\"newsroom-site-option-mark merdeka\"><img src=\"assets/Merdeka.svg\" alt=\"Merdeka.com\"></span><i data-lucide=\"check\"></i></button>\n  </div>\n</div></div>";
  const editorNavigation="<div class=\"cms-nav-scroll\">\n  <div class=\"cms-nav-cluster cms-nav-legacy-order open\" data-cms-cluster>\n    <div class=\"cms-nav-items\">\n      <button class=\"cms-nav-item active\" type=\"button\" data-cms-item=\"Articles\"><i data-lucide=\"newspaper\"></i><span>Articles</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Embedded Contents\"><i data-lucide=\"code-2\"></i><span>Embedded Contents</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Images\"><i data-lucide=\"image\"></i><span>Images</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Livestreamings\"><i data-lucide=\"radio-tower\"></i><span>Livestreamings</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Photo Galleries\"><i data-lucide=\"gallery-horizontal\"></i><span>Photo Galleries</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Video Galleries\"><i data-lucide=\"clapperboard\"></i><span>Video Galleries</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Autopilot Articles\"><i data-lucide=\"bot\"></i><span>Autopilot Articles</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Rewrite Articles\"><i data-lucide=\"wand-sparkles\"></i><span>Rewrite Articles</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Distributed Articles\"><i data-lucide=\"send\"></i><span>Distributed Articles</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Persona\"><i data-lucide=\"user-round-cog\"></i><span>Persona</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"N A I S\"><i data-lucide=\"brain-circuit\"></i><span>N A I S</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Topical Hub\"><i data-lucide=\"network\"></i><span>Topical Hub</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"SEO Recommendation\"><i data-lucide=\"search-check\"></i><span>SEO Recommendation</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Earthquake News\"><i data-lucide=\"activity\"></i><span>Earthquake News</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Live Reports\"><i data-lucide=\"radio\"></i><span>Live Reports</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Figures\"><i data-lucide=\"users\"></i><span>Figures</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Football\"><i data-lucide=\"trophy\"></i><span>Football</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"CG Keywords\"><i data-lucide=\"key-round\"></i><span>CG Keywords</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"CG Articles\"><i data-lucide=\"shield-alert\"></i><span>CG Articles</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"CG Settings\"><i data-lucide=\"settings-2\"></i><span>CG Settings</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Video Distributions\"><i data-lucide=\"send-to-back\"></i><span>Video Distributions</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Badwords\"><i data-lucide=\"message-square-warning\"></i><span>Badwords</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Photo Sources\"><i data-lucide=\"camera\"></i><span>Photo Sources</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Content Promotions\"><i data-lucide=\"badge-percent\"></i><span>Content Promotions</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Special Contents\"><i data-lucide=\"star\"></i><span>Special Contents</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Headlines\"><i data-lucide=\"panel-top\"></i><span>Headlines</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Newstickers\"><i data-lucide=\"badge-info\"></i><span>Newstickers</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Selected Tags\"><i data-lucide=\"tags\"></i><span>Selected Tags</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Comments\"><i data-lucide=\"message-square\"></i><span>Comments</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Push Notification\"><i data-lucide=\"bell-ring\"></i><span>Push Notification</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Promo Redaksi\"><i data-lucide=\"megaphone\"></i><span>Promo Redaksi</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Boost Video\"><i data-lucide=\"rocket\"></i><span>Boost Video</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Playlist Boost Video\"><i data-lucide=\"list-video\"></i><span>Playlist Boost Video</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Native Videos\"><i data-lucide=\"video\"></i><span>Native Videos</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"RSS Builders\"><i data-lucide=\"rss\"></i><span>RSS Builders</span></button>\n      <button class=\"cms-nav-item\" type=\"button\" data-cms-item=\"Static Contents\"><i data-lucide=\"file-text\"></i><span>Static Contents</span></button>\n\n      <div class=\"cms-nav-legacy-separator\" aria-hidden=\"true\"></div>\n\n      <a class=\"cms-nav-item\" href=\"tags.html\" data-cms-item=\"Tags\"><i data-lucide=\"tag\"></i><span>Tags</span></a>\n    </div>\n  </div>\n</div>";
  const routes={'Articles':'articles.html','Tags':'tags.html'};
  if(!document.getElementById('newsroomLegacyOrderStyle')){
    const style=document.createElement('style');
    style.id='newsroomLegacyOrderStyle';
    style.textContent='.cms-nav-legacy-order,.nr-nav-cluster.cms-nav-legacy-order{border-bottom:0!important}.cms-nav-legacy-order>.cms-nav-items,.nr-nav-cluster.cms-nav-legacy-order>.nr-nav-items{display:grid!important;padding-left:0!important;padding-right:0!important}.cms-nav-legacy-separator{height:1px;margin:8px 0;background:#e2e8f0}.nr-sidebar-collapsed .cms-nav-legacy-separator,.cms-sidebar-collapsed .cms-nav-legacy-separator{margin:6px 0}.cms-nav-legacy-order .cms-nav-item,.cms-nav-legacy-order .nr-nav-item{flex:none;width:100%!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important}';
    document.head.append(style);
  }
  const leaf=(window.location.pathname.split('/').pop()||'index.html');
  const page=leaf==='dashboard.html'?'Dashboard':leaf==='tags.html'?'Tags':'Articles';
  if(document.body.classList.contains('alt-editor-layout')){
    // Render the same canonical brand/site selector and navigation in Editor.
    // Executed immediately after Editor shell markup, before its interaction scripts.
    const existingBrand=document.querySelector('.newsroom-header-left');
    if(existingBrand){
      const holder=document.createElement('div');
      holder.innerHTML=editorBrand;
      const canonical=holder.firstElementChild;
      if(canonical)existingBrand.replaceWith(canonical);
    }
    const existingNavigation=document.querySelector('#cmsNavDrawer > .cms-nav-scroll');
    if(existingNavigation){
      const holder=document.createElement('div');
      holder.innerHTML=editorNavigation;
      const canonical=holder.firstElementChild;
      if(canonical)existingNavigation.replaceWith(canonical);
    }
    if(window.lucide?.createIcons)window.lucide.createIcons();
    return;
  }
  if(!document.body.classList.contains('nr-app'))return;
  const header=document.querySelector('.nr-topbar');
  const sidebar=document.querySelector('.nr-sidebar');
  if(!header||!sidebar)return;

  const logo='<a class="nr-global-dashboard-link" href="dashboard.html" aria-label="Dashboard Newsroom">'+editorBrand.replace('<div class="newsroom-header-brand" aria-label="KLY">','<div class="newsroom-header-brand" aria-label="KLY">')+'</a>';
  // Editor identity and site switcher are kept as-is, including approved spacing.
  header.innerHTML='<button class="nr-mobile-menu" id="mobileMenu" type="button" aria-label="Open menu"><i data-lucide="menu"></i></button>'+
    '<div class="nr-global-brand">'+editorBrand+'</div>'+
    '<span class="nr-global-separator" aria-hidden="true"></span>'+
    '<nav class="nr-global-breadcrumb" aria-label="Breadcrumb"><a href="dashboard.html">Content Production</a><i data-lucide="chevron-right"></i><strong>'+page+'</strong></nav>'+
    '<div class="nr-spacer"></div>';
  header.querySelector('.newsroom-header-brand').setAttribute('title','Newsroom Dashboard');
  header.querySelector('.newsroom-header-brand').setAttribute('role','link');
  header.querySelector('.newsroom-header-brand').tabIndex=0;
  header.querySelector('.newsroom-header-brand').addEventListener('click',()=>{window.location.href='dashboard.html'});
  header.querySelector('.newsroom-header-brand').addEventListener('keydown',e=>{if(e.key==='Enter')window.location.href='dashboard.html'});

  let nav=editorNavigation.replace(/cms-nav-scroll/g,'nr-sidebar-scroll')
    .replace(/cms-nav-cluster/g,'nr-nav-cluster')
    .replace(/cms-nav-items/g,'nr-nav-items')
    .replace(/cms-nav-item/g,'nr-nav-item')
    .replace(/data-cms-cluster/g,'data-cluster')
    .replace(/data-cms-item/g,'data-item');
  const template=document.createElement('div');
  template.innerHTML=nav;
  template.querySelectorAll('[data-item]').forEach(item=>{
    const name=item.getAttribute('data-item');
    item.classList.toggle('active',name===page);
    if(routes[name] && item.tagName==='BUTTON'){
      const anchor=document.createElement('a');
      anchor.href=routes[name];anchor.className=item.className;anchor.setAttribute('data-item',name);
      anchor.innerHTML=item.innerHTML;item.replaceWith(anchor);
    }
    if(routes[name] && item.tagName==='A')item.href=routes[name];
  });
  template.querySelectorAll('[data-cluster]').forEach(cluster=>{
    cluster.classList.toggle('open',Boolean(cluster.querySelector('[data-item].active')));
  });
  const search=document.createElement('div');
  search.className='nr-global-search-row';
  search.innerHTML='<div class="nr-global-search"><i data-lucide="search"></i><input id="sidebarSearch" type="search" placeholder="Search CMS menu…" aria-label="Search CMS menu"></div>'+
    '<button type="button" id="sidebarToggle" aria-label="Collapse sidebar"><i data-lucide="panel-left-close"></i></button>';
  sidebar.innerHTML='';
  sidebar.append(search,template.firstElementChild);
  const footer=document.createElement('div');
  footer.className='nr-sidebar-bottom';
  sidebar.append(footer);

  const siteSwitcher=header.querySelector('#newsroomSiteSwitcher');
  const siteTrigger=header.querySelector('#newsroomSiteTrigger');
  siteTrigger?.addEventListener('click',e=>{
    e.stopPropagation();
    const opened=siteSwitcher.classList.toggle('open');
    siteTrigger.setAttribute('aria-expanded',String(opened));
  });
  siteSwitcher?.querySelectorAll('[data-site]').forEach(option=>option.addEventListener('click',e=>{
    e.stopPropagation();
    siteSwitcher.querySelectorAll('[data-site]').forEach(btn=>{
      btn.classList.toggle('active',btn===option);
      btn.setAttribute('aria-selected',String(btn===option));
    });
    const current=header.querySelector('#newsroomSiteCurrent');
    current.innerHTML='<img src="'+option.dataset.logo+'" alt="'+option.dataset.site+'">';
    siteSwitcher.classList.remove('open');
    siteTrigger.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('click',e=>{
    if(!siteSwitcher?.contains(e.target)){
      siteSwitcher?.classList.remove('open');
      siteTrigger?.setAttribute('aria-expanded','false');
    }
  });
  if(window.lucide?.createIcons)window.lucide.createIcons();
})();