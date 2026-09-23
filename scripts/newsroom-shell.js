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
    return {name:'Editor Demo',role:'Editor',email:'',demo:true};
  }
  function initials(name){
    return name.trim().split(/\s+/).slice(0,2).map(s=>s.charAt(0).toUpperCase()).join('')||'ED';
  }
  function buildAccount(container){
    if(!container||container.querySelector('.nr-account'))return;
    const user=resolveUser();
    // The previous AI placement is intentionally vacated; the working editor AI
    // entry point remains in its existing rail until the global AI UX is approved.
    const legacy=container.querySelector('#cmsSidebarAgent,.nr-nav-item');
    if(legacy)legacy.remove();
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
    if(user.demo){const note=document.createElement('small');note.textContent='Identitas contoh untuk preview. Data login sebenarnya akan ditampilkan setelah integrasi autentikasi CMS.';pop.append(note)}
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
