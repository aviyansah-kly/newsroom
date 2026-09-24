// NEWSROOM_COLLAPSIBLE_RIGHT_PANEL_START
// Shared right-panel controller. The Editor prototype embeds this source
// directly to avoid stale cached assets in preview; reusable copy lives here.
(function(){
  'use strict';
  function init(){
    if(window.NEWSROOM_RIGHT_PANEL_INITIALIZED)return;
    const body=document.body;
    const panel=document.querySelector('body.alt-editor-layout .context');
    if(!panel)return;
    const existing=panel.querySelector('.nr-right-panel-control');
    const control=existing||document.createElement('div');
    control.className='nr-right-panel-control';
    const toggle=control.querySelector('#nrRightPanelToggle')||document.createElement('button');
    toggle.type='button';
    toggle.id='nrRightPanelToggle';
    toggle.className='nr-right-toggle';
    toggle.setAttribute('aria-controls','nrArticleSettingsPanel');
    panel.id='nrArticleSettingsPanel';
    const heading=panel.querySelector(':scope > .panel > .panel-head h3');
    let title=control.querySelector('.nr-right-panel-title');
    if(!title){title=document.createElement('strong');title.className='nr-right-panel-title';title.textContent=heading?.textContent?.trim()||'Article Settings'}
    let railLabel=toggle.querySelector('.nr-right-panel-rail-label');
    if(!railLabel){railLabel=document.createElement('span');railLabel.className='nr-right-panel-rail-label';railLabel.textContent='Article Settings';railLabel.setAttribute('aria-hidden','true')}
    toggle.append(railLabel);
    control.replaceChildren(toggle,title);
    if(!existing)panel.prepend(control);
    window.NEWSROOM_RIGHT_PANEL_INITIALIZED=true;
    let stored=null;
    try{stored=localStorage.getItem('newsroom:right-panel-collapsed')}catch(e){}
    const firstVisitCollapsed=window.matchMedia('(max-width:1024px)').matches;
    // Mirror the left CMS sidebar's expand/collapse icon convention.
    // The preview includes Lucide; static SVG fallback still works if CDN is offline.
    const svg=(minimized)=>minimized
      ?'<i data-lucide="panel-right-open"></i>'
      :'<i data-lucide="panel-right-close"></i>';
    const fallback=(minimized)=>minimized
      ?'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/><path d="m11 10 2 2-2 2"/></svg>'
      :'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M15 3v18"/><path d="m10 10-2 2 2 2"/></svg>';
    const workspace=document.querySelector('.workspace');
    const nav=document.querySelector('.cms-nav-drawer');
    function syncCanvas(){
      if(!workspace)return;
      const mobile=window.matchMedia('(max-width:1024px)').matches;
      const left=mobile?24:(body.classList.contains('cms-sidebar-collapsed')?64:236)+24;
      const right=(mobile?56:(body.classList.contains('nr-right-collapsed')?56:390))+(mobile?12:24);
      // Inline !important overrides the several legacy responsive CSS blocks.
      workspace.style.setProperty('padding-left',left+'px','important');
      workspace.style.setProperty('padding-right',right+'px','important');
      workspace.style.setProperty('width','100%','important');
      workspace.style.setProperty('max-width','none','important');
      workspace.style.setProperty('grid-template-columns','minmax(0,1fr)','important');
      const canvas=workspace.querySelector(':scope > section');
      const paper=canvas?.querySelector(':scope > .paper');
      [canvas,paper].filter(Boolean).forEach(el=>{
        el.style.setProperty('width','100%','important');
        el.style.setProperty('min-width','0','important');
        el.style.setProperty('max-width','none','important');
        el.style.setProperty('margin-left','0','important');
        el.style.setProperty('margin-right','0','important');
      });
    }
    function setCollapsed(next,save){
      body.classList.toggle('nr-right-collapsed',next);
      body.classList.remove('settings-drawer-open','focus');
      const backdrop=document.getElementById('settingsDrawerBackdrop');
      if(backdrop)backdrop.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded',String(!next));
      toggle.setAttribute('aria-label',next?'Buka Article Settings':'Minimize Article Settings');
      toggle.title=next?'Buka Article Settings':'Minimize Article Settings';
      // Keep label inside the button, so the whole 56px rail is one hit target.
      toggle.innerHTML=window.lucide?svg(next):fallback(next);
      toggle.append(railLabel);
      if(window.lucide)window.lucide.createIcons({nodes:[toggle]});
      if(save){try{localStorage.setItem('newsroom:right-panel-collapsed',next?'1':'0')}catch(e){}}
      syncCanvas();
      window.dispatchEvent(new Event('resize'));
    }
    toggle.addEventListener('click',()=>setCollapsed(!body.classList.contains('nr-right-collapsed'),true));
    setCollapsed(stored===null?firstVisitCollapsed:stored==='1',false);
    // The left sidebar controller changes a body class. Recalculate both
    // horizontal gutters whenever either sidebar toggles or viewport changes.
    new MutationObserver(syncCanvas).observe(body,{attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',syncCanvas,{passive:true});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&window.matchMedia('(max-width:1024px)').matches&&!body.classList.contains('nr-right-collapsed')&&!e.target.closest('.modal.open,.popup.open')){
        setCollapsed(true,true);toggle.focus();
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
// NEWSROOM_COLLAPSIBLE_RIGHT_PANEL_END
