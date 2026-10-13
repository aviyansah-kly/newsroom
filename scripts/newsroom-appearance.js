/* Newsroom Appearance Controller — V1, progressive enhancement.
 * No article/editor state writes and no mutations outside account menu + html data-theme.
 * Loaded by the existing shared shell on the feature branch.
 */
(function () {
  'use strict';
  var STORAGE_KEY='newsroom:appearance';
  var choices=[
    {value:'light',label:'Terang',icon:'sun'},
    {value:'dark',label:'Gelap',icon:'moon'},
    {value:'system',label:'Ikuti Sistem',icon:'monitor'}
  ];
  var icons={
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    monitor:'<rect width="18" height="13" x="3" y="3" rx="2"/><path d="M8 21h8m-4-5v5"/>',
    check:'<path d="m20 6-11 11-5-5"/>'
  };
  var media=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
  function preference(){
    try {var stored=window.localStorage.getItem(STORAGE_KEY);return ['light','dark','system'].includes(stored)?stored:'light';}
    catch(e){return 'light';}
  }
  function resolved(value){
    return value==='system'?(media&&media.matches?'dark':'light'):value;
  }
  function svg(icon){
    return '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[icon]+'</svg>';
  }
  function syncControls(){
    var selected=preference();
    document.querySelectorAll('[data-nr-appearance-option]').forEach(function(button){
      var active=button.getAttribute('data-nr-appearance-option')===selected;
      button.setAttribute('aria-checked',String(active));
      var check=button.querySelector('.nr-appearance-check');
      if(check)check.hidden=!active;
    });
  }
  function apply(){
    var value=preference();
    var mode=resolved(value);
    document.documentElement.setAttribute('data-theme',mode);
    syncControls();
    document.dispatchEvent(new CustomEvent('newsroom:appearance-changed',{detail:{preference:value,theme:mode}}));
  }
  function select(value){
    if(!choices.some(function(choice){return choice.value===value}))return;
    try{window.localStorage.setItem(STORAGE_KEY,value)}catch(e){}
    apply();
  }
  function build(menu){
    if(menu.querySelector('[data-nr-appearance]'))return;
    var section=document.createElement('div');
    section.className='nr-appearance';
    section.setAttribute('data-nr-appearance','');
    var title=document.createElement('div');
    title.className='nr-appearance-title';
    title.textContent='Tampilan';
    section.appendChild(title);
    var group=document.createElement('div');
    group.className='nr-appearance-options';
    group.setAttribute('role','radiogroup');
    group.setAttribute('aria-label','Tampilan Newsroom');
    choices.forEach(function(choice){
      var button=document.createElement('button');
      button.type='button';
      button.className='nr-appearance-option';
      button.setAttribute('role','radio');
      button.setAttribute('data-nr-appearance-option',choice.value);
      button.setAttribute('aria-checked','false');
      button.innerHTML=svg(choice.icon);
      var label=document.createElement('span');
      label.className='nr-appearance-label';
      label.textContent=choice.label;
      button.appendChild(label);
      var check=document.createElement('span');
      check.className='nr-appearance-check';
      check.innerHTML=svg('check');
      check.hidden=true;
      button.appendChild(check);
      button.addEventListener('click',function(){select(choice.value)});
      button.addEventListener('keydown',function(event){
        var current=choices.findIndex(function(item){return item.value===choice.value});
        var next=(event.key==='ArrowDown'||event.key==='ArrowRight')?(current+1)%choices.length:
          (event.key==='ArrowUp'||event.key==='ArrowLeft')?(current+choices.length-1)%choices.length:-1;
        if(next>=0){
          event.preventDefault();
          var value=choices[next].value;
          select(value);
          var nextButton=group.querySelector('[data-nr-appearance-option="'+value+'"]');
          if(nextButton)nextButton.focus();
        }
      });
      group.appendChild(button);
    });
    section.appendChild(group);
    var logout=menu.querySelector('.nr-account-menu-danger');
    menu.insertBefore(section,logout||null);
    syncControls();
  }
  function mount(){
    document.querySelectorAll('.nr-account-menu').forEach(build);
  }
  function init(){
    mount();
    var pending=false;
    var observer=new MutationObserver(function(){
      if(pending)return;
      pending=true;
      window.requestAnimationFrame(function(){pending=false;mount()});
    });
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(media){
    if(media.addEventListener)media.addEventListener('change',function(){if(preference()==='system')apply()});
    else if(media.addListener)media.addListener(function(){if(preference()==='system')apply()});
  }
  window.addEventListener('storage',function(event){
    if(event.key===STORAGE_KEY || event.key===null)apply();
  });
  apply();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
