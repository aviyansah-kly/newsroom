/* Newsroom unified Insert Link — functional UI prototype with dummy AI suggestions.
 * Delegated capture routes Classic/Block/mini editor link buttons to one dialog.
 * It deliberately does not modify the approved Text toolbar DOM/CSS geometry. */
(function(){
  'use strict';
  const TRIGGER='#linkTool,[data-classic-command="link"],[data-v16-cmd="link"],[data-mini-cmd="createLink"]';
  const DEMO=[
    {id:'demo-01',title:'Harga Minyak Dunia dan Dampaknya terhadap Ekonomi Indonesia',category:'Bisnis',description:'Latar belakang harga minyak, subsidi, dan dampak ke masyarakat.',url:'https://www.liputan6.com/bisnis/read/demo-001/harga-minyak-dunia'},
    {id:'demo-02',title:'Perkembangan Terbaru Timnas Indonesia Jelang Pertandingan',category:'Bola',description:'Konteks tim, jadwal, pemain, dan persiapan pertandingan.',url:'https://www.liputan6.com/bola/read/demo-002/perkembangan-timnas-indonesia'},
    {id:'demo-03',title:'Penjelasan Pemerintah Mengenai Kebijakan Ekonomi Terbaru',category:'News',description:'Ringkasan kebijakan dan pernyataan terkait isu publik.',url:'https://www.liputan6.com/news/read/demo-003/kebijakan-ekonomi-terbaru'},
    {id:'demo-04',title:'Tips Mengelola Keuangan dan Investasi bagi Pemula',category:'Bisnis',description:'Panduan keuangan pribadi, saham, dan reksa dana.',url:'https://www.liputan6.com/bisnis/read/demo-004/tips-keuangan-investasi'},
    {id:'demo-05',title:'Tren Teknologi dan Penggunaan AI di Indonesia',category:'Tekno',description:'AI, inovasi digital, dan penggunaan teknologi sehari-hari.',url:'https://www.liputan6.com/tekno/read/demo-005/tren-ai-indonesia'},
    {id:'demo-06',title:'Informasi Cuaca dan Peringatan Bencana Terkini',category:'News',description:'Prakiraan cuaca dan informasi kesiapsiagaan.',url:'https://www.liputan6.com/news/read/demo-006/cuaca-bencana-terkini'}
  ];
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let dialog,overlay,source=null,previousFocus=null,lastMiniSelection=null,selectedDemo=null,aiGenerated=false,mode='internal';
  const el=id=>document.getElementById(id);
  const visible=()=>overlay&&!overlay.hidden;
  const editor=()=>window.sixdeskTiptap;
  function normalize(value){
    const text=value.trim();
    if(!text)return null;
    let url;
    try{url=new URL(/^[a-z][a-z\d+.-]*:/i.test(text)?text:'https://'+text)}catch(e){return null}
    if(!['https:','http:'].includes(url.protocol)||!url.hostname.includes('.'))return null;
    return url.toString();
  }
  function isInternal(url){try{return /(^|\.)liputan6\.com$/i.test(new URL(url).hostname)}catch(e){return false}}
  function takeSelection(trigger){
    const mini=trigger.closest('.alt-content-card')?.querySelector('.alt-mini-editor');
    if(mini){
      const range=lastMiniSelection&&mini.contains(lastMiniSelection.commonAncestorContainer)
        ?lastMiniSelection.cloneRange()
        :null;
      return {kind:'mini',mini,range,text:range?.toString().trim()||''};
    }
    const ed=editor();
    if(ed){
      const sel=ed.state.selection;
      const attrs=ed.getAttributes('link')||{};
      return {kind:'tiptap',from:sel.from,to:sel.to,text:ed.state.doc.textBetween(sel.from,sel.to,' ').trim(),href:attrs.href||'',target:attrs.target||'',rel:attrs.rel||''};
    }
    return {kind:'none',text:''};
  }
  function markup(){return `
  <section class="nr-link-dialog" role="dialog" aria-modal="true" aria-labelledby="nrLinkTitle" aria-describedby="nrLinkDescription">
    <div class="nr-link-top"><div class="nr-link-title-wrap"><span class="nr-link-title-icon"><i data-lucide="link-2"></i></span><div><h2 id="nrLinkTitle">Insert Link</h2><p id="nrLinkDescription">Tambahkan internal atau external link pada teks artikel.</p></div></div><button type="button" class="nr-link-close" id="nrLinkClose" aria-label="Tutup dialog"><i data-lucide="x"></i></button></div>
    <div class="nr-link-scroll">
      <div class="nr-link-context"><span class="nr-link-context-icon"><i data-lucide="text-select"></i></span><div class="nr-link-context-copy"><div class="nr-link-eyebrow">Teks yang dipilih</div><p id="nrLinkSelection">Belum ada teks dipilih — isi teks tautan di bawah.</p></div></div>
      <div class="nr-link-tabs" role="tablist" aria-label="Jenis tautan">
        <button type="button" role="tab" aria-selected="true" aria-controls="nrLinkInternal" id="nrLinkTabInternal" data-nr-link-mode="internal"><i data-lucide="newspaper"></i> Internal Link</button>
        <button type="button" role="tab" aria-selected="false" aria-controls="nrLinkExternal" id="nrLinkTabExternal" data-nr-link-mode="external"><i data-lucide="external-link"></i> External Link</button>
      </div>
      <div class="nr-link-field nr-link-text-first"><label for="nrLinkText">Teks tautan</label><input type="text" id="nrLinkText" maxlength="250" placeholder="Teks yang tampil di artikel"></div>
      <div id="nrLinkInternal" class="nr-link-pane" role="tabpanel" aria-labelledby="nrLinkTabInternal">
        <div class="nr-link-field"><label for="nrLinkSearch"><span>Cari artikel Liputan6</span><span class="nr-link-label-hint">Internal link</span></label>
          <div class="nr-link-search-row"><div class="nr-link-search"><span class="nr-link-search-icon"><i data-lucide="search"></i></span><input type="search" id="nrLinkSearch" autocomplete="off" placeholder="Cari judul, topik, atau keyword…"></div><button type="button" class="nr-link-action ai" id="nrLinkAi" aria-busy="false"><i data-lucide="sparkles"></i><span id="nrLinkAiLabel">Saran AI</span></button></div>
          <div class="nr-link-ai-flow" aria-hidden="true"><span><i data-lucide="text-select"></i> baca konteks</span><i data-lucide="chevron-right"></i><span><i data-lucide="sparkles"></i> rekomendasi</span><i data-lucide="chevron-right"></i><span><i data-lucide="mouse-pointer-click"></i> pilih artikel</span></div>
          <p class="nr-link-helper" id="nrLinkSearchHelp">Cari manual atau gunakan Saran AI untuk rekomendasi berdasarkan teks yang dipilih. Data masih dummy untuk preview flow.</p>
        </div>
        <div class="nr-link-suggestion-head"><strong id="nrLinkResultHeading">Contoh artikel</strong><span class="nr-link-demo-badge" id="nrLinkDemoBadge">DEMO DATA</span></div>
        <div id="nrLinkResults" class="nr-link-results" role="listbox" aria-label="Pilihan artikel internal"></div>
        <div class="nr-link-chosen" id="nrLinkChosen" hidden><i data-lucide="circle-check"></i><span class="nr-link-chosen-copy"><strong id="nrLinkChosenText"></strong><small id="nrLinkChosenUrl"></small></span></div>
      </div>
      <div id="nrLinkExternal" class="nr-link-pane" role="tabpanel" aria-labelledby="nrLinkTabExternal" hidden>
        <div class="nr-link-field"><label for="nrLinkExternalUrl">URL tujuan</label><input type="url" id="nrLinkExternalUrl" placeholder="https://contoh.com/artikel" autocomplete="url"><small>Gunakan URL lengkap. Hanya HTTP atau HTTPS yang didukung.</small></div>
      </div>
      <div class="nr-link-options">
        <label class="nr-link-option"><input type="checkbox" id="nrLinkNofollow"><span>Nofollow<small>Gunakan untuk link berbayar, tidak tepercaya, atau yang tidak ingin di-endorse.</small></span></label>
        <label class="nr-link-option"><input type="checkbox" id="nrLinkNewTab"><span>Buka di tab baru<small>Cocok untuk sumber eksternal agar artikel tetap terbuka.</small></span></label>
      </div>
      <div class="nr-link-error" role="alert" id="nrLinkError" hidden></div>
    </div>
    <div class="nr-link-foot"><span class="nr-link-foot-note" id="nrLinkFootNote">Pilih artikel internal untuk mengisi URL otomatis.</span><div class="nr-link-foot-actions"><button type="button" id="nrLinkCancel" class="nr-link-quiet">Batal</button><button type="button" id="nrLinkApply" class="nr-link-primary" disabled>Terapkan Link</button></div></div>
  </section>`;}
  function renderResults(){
    if(!dialog)return;
    const query=el('nrLinkSearch').value.trim().toLocaleLowerCase('id-ID');
    let results=DEMO;
    if(aiGenerated){
      const selected=(source?.text||el('nrLinkSearch').value||'').toLocaleLowerCase('id-ID').split(/\W+/).filter(w=>w.length>=3);
      const scored=DEMO.map((item,i)=>{
        const hay=(item.title+' '+item.description+' '+item.category).toLocaleLowerCase('id-ID');
        return {item,score:selected.reduce((n,word)=>n+(hay.includes(word)?2:0),0),index:i};
      }).sort((a,b)=>b.score-a.score||a.index-b.index);
      results=scored.slice(0,3).map(x=>x.item);
      el('nrLinkResultHeading').textContent='Rekomendasi AI untuk teks ini';
      el('nrLinkSearchHelp').textContent='Simulasi saran AI berdasarkan teks yang dipilih. Konten dan URL hanya contoh, belum terhubung ke artikel asli.';
      el('nrLinkDemoBadge').textContent='AI DEMO';
    }else{
      if(query)results=DEMO.filter(item=>(item.title+' '+item.description+' '+item.category).toLocaleLowerCase('id-ID').includes(query));
      el('nrLinkResultHeading').textContent=query?'Hasil pencarian':'Contoh artikel';
      if(!query)results=results.slice(0,3);
      el('nrLinkSearchHelp').textContent='Pencarian menggunakan data dummy untuk preview. Klik Saran AI untuk simulasi rekomendasi.';
      el('nrLinkDemoBadge').textContent='DEMO DATA';
    }
    const list=el('nrLinkResults');
    const contextWord=(source?.text||el('nrLinkSearch').value||'topik artikel').trim().split(/\s+/).slice(0,4).join(' ');
    list.innerHTML=results.length?results.map(item=>`<button type="button" class="nr-link-result" role="option" data-article-id="${esc(item.id)}" aria-selected="${item.id===selectedDemo?.id}">
      <span class="nr-link-result-text">
        <span class="nr-link-result-meta"><span class="nr-link-result-category">${esc(item.category)}</span>${aiGenerated?'<small class="nr-link-result-reason">Relevan dengan “'+esc(contextWord)+'”</small>':''}</span>
        <strong>${esc(item.title)}</strong>
        <small>${esc(item.description)}</small>
        <small class="nr-link-result-url">${esc(item.url.replace(/^https?:\/\/(www\.)?/,'').replace(/\/read\//,' / '))}</small>
      </span>
      <span class="nr-link-result-side">${item.id===selectedDemo?.id?'<i data-lucide="check"></i>':'<i data-lucide="chevron-right"></i>'}</span>
    </button>`).join(''):'<div class="nr-link-empty">Belum ada artikel yang cocok dalam data contoh. Coba kata kunci lain atau gunakan Saran AI.</div>';
    if(window.lucide)window.lucide.createIcons({nodes:[list]});
  }
  function showError(message){
    const box=el('nrLinkError');box.textContent=message||'';box.hidden=!message;
  }
  function sync(){
    const target=mode==='internal'?selectedDemo?.url:normalize(el('nrLinkExternalUrl').value);
    el('nrLinkApply').disabled=!(target&&el('nrLinkText').value.trim());
    el('nrLinkChosen').hidden=!selectedDemo||mode!=='internal';
    if(selectedDemo&&mode==='internal'){
      el('nrLinkChosenText').textContent='Artikel dipilih: '+selectedDemo.title;
      el('nrLinkChosenUrl').textContent=selectedDemo.url;
    }
    el('nrLinkFootNote').textContent=mode==='internal'?'Pilih satu artikel internal, lalu Terapkan Link.':'URL eksternal diperiksa sebelum diterapkan.';
    showError('');
  }
  function setMode(next){
    mode=next;
    for(const tab of overlay.querySelectorAll('[data-nr-link-mode]'))tab.setAttribute('aria-selected',String(tab.dataset.nrLinkMode===next));
    el('nrLinkInternal').hidden=next!=='internal';el('nrLinkExternal').hidden=next!=='external';
    if(next==='internal'){el('nrLinkNewTab').checked=false;el('nrLinkNofollow').checked=false}
    else{el('nrLinkNewTab').checked=true;el('nrLinkNofollow').checked=false}
    sync();
  }
  function open(trigger){
    if(!overlay)return;
    previousFocus=trigger;
    source=takeSelection(trigger);
    selectedDemo=null;aiGenerated=false;
    el('nrLinkSearch').value='';
    el('nrLinkExternalUrl').value=source.href||'';
    el('nrLinkText').value=source.text||'';
    el('nrLinkSelection').textContent=source.text?'“'+source.text+'”':'Belum ada teks dipilih — isi teks tautan di bawah.';
    mode='internal';
    // Editing an existing external link opens the relevant tab immediately.
    if(source.href&&!isInternal(source.href))mode='external';
    if(source.href&&isInternal(source.href)){
      selectedDemo=DEMO.find(item=>item.url===source.href)||null;
      if(!selectedDemo){mode='external';el('nrLinkExternalUrl').value=source.href}
    }
    el('nrLinkNofollow').checked=/\bnofollow\b/.test(source.rel||'');
    el('nrLinkNewTab').checked=mode==='external'||source.target==='_blank';
    for(const tab of overlay.querySelectorAll('[data-nr-link-mode]'))tab.setAttribute('aria-selected',String(tab.dataset.nrLinkMode===mode));
    el('nrLinkInternal').hidden=mode!=='internal';el('nrLinkExternal').hidden=mode!=='external';
    document.querySelectorAll('.popup.open').forEach(p=>p.classList.remove('open'));
    renderResults();sync();overlay.hidden=false;
    document.body.classList.add('nr-link-dialog-open');
    if(window.lucide)window.lucide.createIcons({nodes:[overlay]});
    (mode==='internal'?el('nrLinkSearch'):el('nrLinkExternalUrl')).focus();
  }
  function close(){
    if(!visible())return;
    overlay.hidden=true;
    document.body.classList.remove('nr-link-dialog-open');
    source=null;selectedDemo=null;aiGenerated=false;
    previousFocus?.focus?.({preventScroll:true});
  }
  function apply(){
    if(!source)return;
    const text=el('nrLinkText').value.trim();
    const href=mode==='internal'?selectedDemo?.url:normalize(el('nrLinkExternalUrl').value);
    if(!text){showError('Isi teks tautan terlebih dahulu.');el('nrLinkText').focus();return}
    if(!href){showError(mode==='internal'?'Pilih artikel internal terlebih dahulu.':'Masukkan URL HTTP/HTTPS yang valid.');return}
    if(mode==='internal'&&!isInternal(href)){showError('Internal link harus mengarah ke Liputan6.');return}
    const attrs={href,target:el('nrLinkNewTab').checked?'_blank':null,rel:[el('nrLinkNofollow').checked?'nofollow':'',el('nrLinkNewTab').checked?'noopener noreferrer':''].filter(Boolean).join(' ')||null};
    if(source.kind==='tiptap'){
      const ed=editor();if(!ed){showError('Editor belum siap. Coba beberapa saat lagi.');return}
      const from=Math.min(source.from,ed.state.doc.content.size),to=Math.min(source.to,ed.state.doc.content.size);
      try{
        if(source.text&&text===source.text){
          ed.chain().focus().setTextSelection({from,to}).extendMarkRange('link').setLink(attrs).run();
        }else{
          ed.chain().focus().insertContentAt({from,to},{type:'text',text,marks:[{type:'link',attrs}]}).run();
        }
      }catch(e){showError('Tautan belum dapat diterapkan. Coba pilih ulang teks.');return}
    }else if(source.kind==='mini'){
      const mini=source.mini;if(!mini?.isConnected){showError('Content block sudah berubah. Pilih ulang teks.');return}
      const range=source.range&&mini.contains(source.range.commonAncestorContainer)?source.range:document.createRange();
      if(!source.range){range.selectNodeContents(mini);range.collapse(false)}
      const a=document.createElement('a');
      a.textContent=text;a.href=href;
      if(attrs.target)a.target=attrs.target;
      if(attrs.rel)a.rel=attrs.rel;
      range.deleteContents();range.insertNode(a);
      const next=document.createRange();next.setStartAfter(a);next.collapse(true);
      const selection=window.getSelection();selection.removeAllRanges();selection.addRange(next);
      mini.dispatchEvent(new Event('input',{bubbles:true}));
      mini.focus();
    }else{showError('Pilih area Content Text terlebih dahulu.');return}
    close();
  }
  function init(){
    if(el('nrLinkOverlay'))return;
    overlay=document.createElement('div');overlay.className='nr-link-overlay';overlay.id='nrLinkOverlay';overlay.hidden=true;
    overlay.innerHTML=markup();document.body.appendChild(overlay);
    dialog=overlay.querySelector('.nr-link-dialog');
    overlay.addEventListener('click',event=>{if(event.target===overlay)close()});
    el('nrLinkClose').addEventListener('click',close);
    el('nrLinkCancel').addEventListener('click',close);
    el('nrLinkApply').addEventListener('click',apply);
    overlay.querySelectorAll('[data-nr-link-mode]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.nrLinkMode)));
    el('nrLinkSearch').addEventListener('input',()=>{aiGenerated=false;selectedDemo=null;renderResults();sync()});
    el('nrLinkAi').addEventListener('click',()=>{
      const button=el('nrLinkAi'),label=el('nrLinkAiLabel');
      if(button.getAttribute('aria-busy')==='true')return;
      button.setAttribute('aria-busy','true');button.disabled=true;
      label.textContent='Menganalisis…';
      el('nrLinkResultHeading').textContent='Mencari artikel relevan…';
      el('nrLinkResults').innerHTML='<div class="nr-link-empty">AI membaca konteks teks dan mencari kandidat internal link…</div>';
      window.setTimeout(()=>{
        aiGenerated=true;selectedDemo=null;button.disabled=false;button.setAttribute('aria-busy','false');label.textContent='Saran AI';
        renderResults();sync();
      },520);
    });
    el('nrLinkResults').addEventListener('click',event=>{
      const choice=event.target.closest('[data-article-id]');if(!choice)return;
      selectedDemo=DEMO.find(item=>item.id===choice.dataset.articleId)||null;
      if(!source.text&&selectedDemo)el('nrLinkText').value=selectedDemo.title;
      renderResults();sync();
    });
    for(const id of ['nrLinkText','nrLinkExternalUrl'])el(id).addEventListener('input',sync);
    overlay.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();return}
      if(event.key!=='Tab')return;
      const items=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(item=>item.getClientRects().length);
      if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    });
  }
  // Capture before button focus moves the current contenteditable selection.
  document.addEventListener('pointerdown',event=>{
    if(event.target.closest(TRIGGER)){
      const selection=window.getSelection();
      if(selection?.rangeCount){
        const range=selection.getRangeAt(0);
        if(range.commonAncestorContainer.parentElement?.closest('.alt-mini-editor'))lastMiniSelection=range.cloneRange();
      }
    }else if(event.target.closest('.alt-mini-editor')){
      lastMiniSelection=null;
    }
  },true);
  // Intercept the old inline toolbar's direct mousedown popup handler.
  document.addEventListener('mousedown',event=>{
    if(!event.target.closest(TRIGGER))return;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);
  document.addEventListener('click',event=>{
    const trigger=event.target.closest(TRIGGER);
    if(!trigger)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!overlay)init();
    open(trigger);
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&visible()){event.preventDefault();event.stopImmediatePropagation();close()}
  },true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
