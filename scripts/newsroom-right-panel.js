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
    const svg=(minimized)=>minimized
      ?'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m11 10 2 2-2 2"/></svg>'
      :'<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 10-2 2 2 2"/></svg>';
    function setCollapsed(next,save){
      body.classList.toggle('nr-right-collapsed',next);
      body.classList.remove('settings-drawer-open','focus');
      const backdrop=document.getElementById('settingsDrawerBackdrop');
      if(backdrop)backdrop.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded',String(!next));
      toggle.setAttribute('aria-label',next?'Buka Article Settings':'Minimize Article Settings');
      toggle.title=next?'Buka Article Settings':'Minimize Article Settings';
      // Keep label inside the button, so the whole 56px rail is one hit target.
      toggle.innerHTML=svg(next);
      toggle.append(railLabel);
      if(save){try{localStorage.setItem('newsroom:right-panel-collapsed',next?'1':'0')}catch(e){}}
      window.dispatchEvent(new Event('resize'));
    }
    toggle.addEventListener('click',()=>setCollapsed(!body.classList.contains('nr-right-collapsed'),true));
    setCollapsed(stored===null?firstVisitCollapsed:stored==='1',false);
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
