// NEWSROOM_COLLAPSIBLE_RIGHT_PANEL_START
// One persistent panel-rail toggle replaces the duplicate header drawer + Focus Mode.
(function(){
  'use strict';
  function init(){
    const panel=document.querySelector('body.alt-editor-layout .context');
    if(!panel||panel.querySelector('.nr-right-panel-control'))return;
    const body=document.body;
    const control=document.createElement('div');
    control.className='nr-right-panel-control';
    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.id='nrRightPanelToggle';
    toggle.className='nr-right-toggle';
    toggle.setAttribute('aria-controls','nrArticleSettingsPanel');
    panel.id='nrArticleSettingsPanel';
    const title=document.createElement('strong');
    title.className='nr-right-panel-title';
    title.textContent=panel.querySelector(':scope > .panel > .panel-head h3')?.textContent?.trim()||'Article Settings';
    control.append(toggle,title);
    panel.prepend(control);
    let stored=null;
    try{stored=localStorage.getItem('newsroom:right-panel-collapsed')}catch(e){}
    // Narrow screens start with writing space; users can expand without a
    // disappearing header control. Explicit saved preference takes priority.
    const collapsed=stored===null?window.matchMedia('(max-width:1024px)').matches:stored==='1';
    const icon=(name)=>{toggle.innerHTML='<i data-lucide="'+name+'"></i>';if(window.lucide)window.lucide.createIcons({nodes:[toggle]})};
    function setCollapsed(next,persist){
      body.classList.toggle('nr-right-collapsed',next);
      // Old drawer script must not leave its mobile backdrop/body lock active.
      body.classList.remove('settings-drawer-open','focus');
      const backdrop=document.getElementById('settingsDrawerBackdrop');
      if(backdrop)backdrop.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded',String(!next));
      toggle.setAttribute('aria-label',next?'Buka Article Settings':'Minimize Article Settings');
      toggle.title=next?'Buka Article Settings':'Minimize Article Settings';
      icon(next?'panel-right-open':'panel-right-close');
      if(persist){try{localStorage.setItem('newsroom:right-panel-collapsed',next?'1':'0')}catch(e){}}
      // Keep the active Editorial / SEO / Validasi tab and all form values.
      window.dispatchEvent(new Event('resize'));
    }
    toggle.addEventListener('click',()=>setCollapsed(!body.classList.contains('nr-right-collapsed'),true));
    setCollapsed(collapsed,false);
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
