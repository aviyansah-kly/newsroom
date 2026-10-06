/* Article listing settings: accessible, intentionally preview-only interactions.
   One source of state per article; enabled indicators always mirror the menu. */
(function(){
  'use strict';
  const ICON={
    distribution:'send',headline_home:'panel-top',headline_tv:'monitor-play',
    pin_home:'pin',pin_tv:'pin',curated:'badge-check',exclude:'ban',
    adult:'shield-alert',ads_desktop:'monitor',ads_mobile:'smartphone'
  };
  const LABEL={
    distribution:'Distribution',headline_home:'Headline Home',headline_tv:'Headline TV',
    pin_home:'Pin Home',pin_tv:'Pin TV',curated:'Curated',exclude:'Exclude',
    adult:'Adult Content',ads_desktop:'Ads Desktop',ads_mobile:'Ads Mobile'
  };
  const SECTION={
    workflow:['WORKFLOW'],
    placement:['PLACEMENT'],ads:['ADS & CONTENT'],technical:['TOOLS']
  };
  const ROWS=[...document.querySelectorAll('.article-row')];
  if(!ROWS.length)return;
  function esc(text){return String(text).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));}
  function ico(name){return '<i data-lucide="'+name+'"></i>';}
  function notify(message){
    let box=document.querySelector('#nrEditorialNotice');
    if(!box){box=document.createElement('div');box.id='nrEditorialNotice';box.className='nr-editorial-feedback';box.hidden=true;box.setAttribute('role','status');document.body.append(box)}
    box.textContent=message;box.hidden=false;
    clearTimeout(notify.timer);notify.timer=setTimeout(()=>box.hidden=true,4700);
  }
  function button(key,icon,label,opts={}){
    const action=opts.action?' data-action="'+key+'"':' data-setting="'+key+'"';
    return '<button class="nr-menu-button" type="button"'+action+' aria-pressed="false"'+(opts.disabled?' disabled title="Tersedia setelah integrasi CMS"':'')+'>'+
      '<span class="nr-menu-button-label">'+ico(icon)+'<span>'+esc(label)+'</span></span>'+
      '<span class="nr-menu-button-mark">'+ico('check')+'</span></button>';
  }
  function disclosure(key,icon,label,children){
    return '<button class="nr-menu-disclosure" type="button" data-section="'+key+'" aria-expanded="false" aria-controls="nropts-'+key+'-'+disclosure.index+'">'+
      '<span class="nr-menu-button-label">'+ico(icon)+'<span>'+esc(label)+'</span></span>'+ico('chevron-right')+'</button>'+
      '<div class="nr-menu-options" id="nropts-'+key+'-'+(disclosure.index++)+'">'+children+'</div>';
  }
  function getInitial(row){
    const settings=new Set();
    row.querySelectorAll('.article-setting-chip').forEach(chip=>{
      const t=(chip.getAttribute('title')||chip.getAttribute('aria-label')||chip.textContent||'').toLowerCase();
      if(t.includes('curated'))settings.add('curated');
      if(t.includes('headline'))settings.add(t.includes('tv')?'headline_tv':'headline_home');
      if(t.includes('pin'))settings.add(t.includes('tv')?'pin_tv':'pin_home');
      if(t.includes('distribut'))settings.add('distribution');
      if(t.includes('ads desktop'))settings.add('ads_desktop');
      if(t.includes('ads mobile'))settings.add('ads_mobile');
      if(t.includes('exclude'))settings.add('exclude');
      if(t.includes('adult'))settings.add('adult');
    });
    return settings;
  }
  function renderIndicators(row,settings){
    const meta=row.querySelector('.article-meta');
    if(!meta)return;
    let cluster=row.querySelector('.article-setting-chips');
    if(!cluster){cluster=document.createElement('div');cluster.className='article-setting-chips';meta.after(cluster)}
    cluster.replaceChildren();
    if(!settings.size){cluster.hidden=true;return}
    cluster.hidden=false;
    const caption=document.createElement('span');caption.className='article-setting-caption';caption.textContent='Active:';cluster.append(caption);
    for(const k of settings){
      if(!ICON[k])continue;
      const chip=document.createElement('span');chip.className='article-setting-chip';
      chip.setAttribute('role','img');chip.setAttribute('aria-label',LABEL[k]+' active');chip.title=LABEL[k]+' · Active';
      chip.innerHTML=ico(ICON[k]);cluster.append(chip);
    }
    if(window.lucide?.createIcons)window.lucide.createIcons();
  }
  function syncMenu(menu,settings){
    menu.querySelectorAll('[data-setting]').forEach(b=>{
      const active=settings.has(b.dataset.setting);
      b.classList.toggle('is-active',active);
      b.setAttribute('aria-pressed',String(active));
    });
  }
  function activate(row,menu,settings,key){
    if(settings.has(key)){settings.delete(key)}else{
      if(key==='headline_home')settings.delete('headline_tv');
      if(key==='headline_tv')settings.delete('headline_home');
      if(key==='pin_home')settings.delete('pin_tv');
      if(key==='pin_tv')settings.delete('pin_home');
      settings.add(key);
    }
    syncMenu(menu,settings);renderIndicators(row,settings);
    notify(LABEL[key]+(settings.has(key)?' aktif':' nonaktif')+' pada preview. Belum tersimpan ke CMS.');
  }
  function menuMarkup(row,index){
    disclosure.index=index*100;
    const published=row.dataset.status==='published';
    return [
      '<section class="nr-menu-section"><div class="nr-menu-section-label">Workflow</div>',
      button('url','external-link','Open URL',{action:true,disabled:!published}),
      button('publish','globe',''+(published?'Unpublish':'Publish'),{action:true}),
      button('distribution','send','Distribution'),
      '</section>',
      '<section class="nr-menu-section"><div class="nr-menu-section-label">Placement</div>',
      disclosure('headline','panel-top','Headline',button('headline_home','home','Homepage')+button('headline_tv','tv','TV')),
      disclosure('pin','pin','Pin Article',button('pin_home','home','Homepage')+button('pin_tv','tv','TV')),
      button('curated','badge-check','Curated'),
      button('exclude','ban','Exclude'),
      '</section>',
      '<section class="nr-menu-section"><div class="nr-menu-section-label">Ads & Content</div>',
      disclosure('ads','badge-dollar-sign','Monetization',
        button('ads_desktop','monitor','Ads Desktop')+button('ads_mobile','smartphone','Ads Mobile')+
        button('adult','shield-alert','Adult Content')),
      '</section>',
      '<section class="nr-menu-section"><div class="nr-menu-section-label">Technical</div>',
      disclosure('technical','wrench','Advanced tools',
        button('feedback','message-square','Feedback',{action:true})+
        button('varnish','refresh-cw','Bypass Varnish',{action:true})+
        button('google','search-check','Google Testing Tools',{action:true})),
      '</section>',
      '<p class="nr-menu-note">Simulasi pengaturan · belum tersimpan ke server</p>'
    ].join('');
  }
  ROWS.forEach((row,index)=>{
    const menu=row.querySelector('.article-row-menu');
    if(!menu)return;
    const settings=getInitial(row);
    menu.classList.add('nr-editorial-menu');
    menu.innerHTML=menuMarkup(row,index);
    const updated=row.querySelector('.article-updated-cell strong');
    const timestamp=row.dataset.updated;
    if(updated&&timestamp){
      const [yr,mo,dy]=(timestamp.split('T')[0]||'').split('-').map(Number);
      if(yr&&mo&&dy)updated.textContent=String(dy).padStart(2,'0')+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]+' '+yr;
    }
    renderIndicators(row,settings);
    syncMenu(menu,settings);
    menu.addEventListener('click',function(e){
      const trigger=e.target.closest('button');
      if(!trigger || !menu.contains(trigger) || trigger.disabled)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      if(trigger.hasAttribute('data-setting')){
        activate(row,menu,settings,trigger.dataset.setting);
        return;
      }
      if(trigger.hasAttribute('data-section')){
        const options=trigger.nextElementSibling;
        const isOpen=trigger.getAttribute('aria-expanded')==='true';
        menu.querySelectorAll('.nr-menu-disclosure').forEach(b=>{b.setAttribute('aria-expanded','false');b.nextElementSibling?.classList.remove('open')});
        if(!isOpen){trigger.setAttribute('aria-expanded','true');options?.classList.add('open')}
        return;
      }
      const a=trigger.dataset.action;
      const title=row.querySelector('.article-title')?.textContent?.trim()||'artikel';
      if(a==='url'){notify('Link artikel live belum tersedia dalam data prototipe.');return}
      if(a==='publish'){notify((row.dataset.status==='published'?'Unpublish':'Publish')+' memerlukan konfirmasi, izin editorial, dan koneksi backend. Tidak ada perubahan status pada preview.');return}
      if(a==='feedback'){notify('Feedback: fitur catatan/penilaian editor memerlukan modul CMS.');return}
      if(a==='varnish'){notify('Bypass Varnish memerlukan izin dan integrasi cache server. Tidak dieksekusi.');return}
      if(a==='google'){notify('Google Testing Tools memerlukan URL artikel live.');return}
    });
  });
  if(window.lucide?.createIcons)window.lucide.createIcons();
})();
