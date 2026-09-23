/* Newsroom shared shell account control.
   Prototype identity ONLY: product auth must supply window.NEWSROOM_AUTH_USER
   {name, role, email} before this script executes. Do not infer login from article owner. */
(function(){
  'use strict';
  function resolveUser(){
    const input=window.NEWSROOM_AUTH_USER;
    if(input&&typeof input.name==='string'&&input.name.trim()){
      return {name:input.name.trim(),role:String(input.role||'User'),email:String(input.email||''),demo:false};
    }
    return {name:'Avi Yansah',role:'Editor',email:'',demo:true};
  }
  function initials(name){
    return name.trim().split(/\s+/).slice(0,2).map(s=>s.charAt(0).toUpperCase()).join('')||'ED';
  }
  function buildAccount(container){
    if(!container)return;
    const legacy=container.querySelector('#cmsSidebarAgent,.nr-nav-item');
    if(legacy)legacy.remove();
    if(container.querySelector('.nr-account'))return;
    const user=resolveUser();
    // The previous AI placement is intentionally vacated; the working editor AI
    // entry point remains in its existing rail until the global AI UX is approved.
    const root=document.createElement('div');
    root.className='nr-account';
    const trigger=document.createElement('button');
    trigger.type='button';trigger.className='nr-account-trigger';
    trigger.setAttribute('aria-haspopup','true');trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-label','Akun: '+user.name+', '+user.role);
    trigger.title=user.name+' — '+user.role;
    const avatar=document.createElement('span');avatar.className='nr-account-avatar';avatar.textContent=initials(user.name);
    const copy=document.createElement('span');copy.className='nr-account-copy';
    const name=document.createElement('span');name.className='nr-account-name';name.textContent=user.name;
    const role=document.createElement('span');role.className='nr-account-role';role.textContent=user.role;
    copy.append(name,role);
    const chevron=document.createElement('span');chevron.className='nr-account-chevron';
    chevron.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';
    trigger.append(avatar,copy,chevron);
    const pop=document.createElement('div');pop.className='nr-account-popover';pop.hidden=true;
    pop.setAttribute('role','region');pop.setAttribute('aria-label','Informasi akun');
    const popName=document.createElement('strong');popName.textContent=user.name;
    const popRole=document.createElement('span');popRole.textContent=user.role;
    pop.append(popName,popRole);
    if(user.email){const email=document.createElement('span');email.textContent=user.email;pop.append(email)}
    // Preview-only account menu. Show the intended information architecture,
    // but keep all destination actions disabled until CMS integration is ready.
    const menu=document.createElement('div');menu.className='nr-account-menu';
    const actions=[
      {label:'Profil Saya',icon:'user-round'},
      {label:'Pengaturan Akun',icon:'settings'},
      {label:'Logout',icon:'log-out',danger:true}
    ];
    const icons={
      'user-round':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      'settings':'<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06-1.87 1.87-.06-.06A1.7 1.7 0 0 0 16 18.4a1.7 1.7 0 0 0-1 1.56V21h-3v-1.04A1.7 1.7 0 0 0 11 18.4a1.7 1.7 0 0 0-1.87.34l-.06.06L7.2 16.93l.06-.06A1.7 1.7 0 0 0 7.6 15 1.7 1.7 0 0 0 6.04 14H5v-3h1.04A1.7 1.7 0 0 0 7.6 10a1.7 1.7 0 0 0-.34-1.87L7.2 8.07 9.07 6.2l.06.06A1.7 1.7 0 0 0 11 6.6a1.7 1.7 0 0 0 1-1.56V4h3v1.04a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06L19.8 8.07l-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1H22v3h-1.04A1.7 1.7 0 0 0 19.4 15Z" transform="translate(-1 -0.5) scale(0.98)"/>',
      'log-out':'<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>'
    };
    actions.forEach(action=>{
      const button=document.createElement('button');
      button.type='button';button.className='nr-account-menu-item'+(action.danger?' nr-account-menu-danger':'');
      button.disabled=true;button.title='Segera hadir';button.setAttribute('aria-label',action.label+' (segera hadir)');
      button.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[action.icon]+'</svg>';
      const label=document.createElement('span');label.textContent=action.label;button.append(label);menu.append(button);
    });
    pop.append(menu);
    const close=()=>{pop.hidden=true;trigger.setAttribute('aria-expanded','false')};
    trigger.addEventListener('click',()=>{
      const next=pop.hidden;
      document.querySelectorAll('.nr-account-popover').forEach(p=>p.hidden=true);
      document.querySelectorAll('.nr-account-trigger').forEach(b=>b.setAttribute('aria-expanded','false'));
      pop.hidden=!next;trigger.setAttribute('aria-expanded',String(next));
    });
    document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden){close();trigger.focus()}});
    root.append(trigger,pop);container.append(root);
  }
  function init(){
    const editor=document.querySelector('#cmsNavDrawer');
    if(editor){
      let bottom=editor.querySelector('.cms-nav-bottom');
      if(!bottom){bottom=document.createElement('div');bottom.className='cms-nav-bottom';editor.append(bottom)}
      buildAccount(bottom);
      // Legacy sidebar initialization may run shortly after DOM is ready.
      const watcher=new MutationObserver(()=>buildAccount(bottom));
      watcher.observe(bottom,{childList:true});
    }
    document.querySelectorAll('.nr-sidebar-bottom').forEach(buildAccount);
    // Standard pages previously put a duplicate account chip in the header.
    // The shared sidebar account now owns that information.
    document.querySelectorAll('.nr-topbar > .nr-user').forEach(el=>el.remove());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
