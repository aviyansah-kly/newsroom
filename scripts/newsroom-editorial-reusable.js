/* Reuse existing Newsroom editorial form control DOM & styling. */
(function(){
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const clean=value=>String(value||'').replace(/\s+/g,' ').trim();
  const OPTIONS=['Pilkada Serentak','Predictive Calendar'];
  const MAX=5;
  const get=(key,fallback)=>{try{const item=sessionStorage.getItem(key);return item===null?fallback:JSON.parse(item)}catch{return fallback}};
  const put=(key,value)=>{try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}};
  function catalogue(){
    // The existing Editor defines the Tags directory as a global lexical binding.
    try{if(typeof tagSuggestions!=='undefined'&&Array.isArray(tagSuggestions))return tagSuggestions.slice()}catch{}
    return [...document.querySelectorAll('#tagSuggestions [data-add]')].map(item=>item.dataset.add);
  }
  function initiativeFrom(typeField){
    // Exact Article Type markup: .field > label + select, with the same class names.
    const copy=typeField.cloneNode(true);
    copy.id='nr-initiative-reused-field';
    copy.classList.remove('alt-article-type-field');
    copy.querySelectorAll('.setting-help,.alt-inline-help,.alt-ai-hint').forEach(n=>n.remove());
    const select=$('select',copy);
    if(!select)return null;
    copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    select.id='contentInitiative';
    select.name='contentInitiative';
    select.replaceChildren(new Option('Pilih Content Initiative',''),...OPTIONS.map(v=>new Option(v,v)));
    const label=$('label',copy);
    if(label){label.textContent='Content Initiative';label.htmlFor=select.id}
    const current=get('nr:content-initiative','');
    select.value=OPTIONS.includes(current)?current:'';
    select.addEventListener('change',()=>put('nr:content-initiative',select.value));
    const buttons=[...copy.querySelectorAll('button')];
    let ai=buttons.find(button=>clean(button.textContent).includes('AI Suggestions'));
    buttons.forEach(button=>{if(button!==ai)button.remove()});
    if(!ai){
      const sample=typeField.querySelector('button')||$('#altEditorialTagsSection .alt-tag-ai');
      if(sample){
        ai=sample.cloneNode(true);
        const head=document.createElement('div');
        head.className='nr-reused-field-heading';
        label?.parentElement.insertBefore(head,label);
        if(label)head.append(label);
        head.append(ai);
      }
    }
    if(ai){
      ai.removeAttribute('id');ai.removeAttribute('data-nr-ai-field');ai.type='button';
      ai.onclick=event=>{
        event.preventDefault();event.stopImmediatePropagation();
        const text=clean(($('#title')?.value||'')+' '+($('#dek')?.value||'')).toLowerCase();
        const found=/pilkada|kepala daerah/.test(text)?OPTIONS[0]:/predictive|kalender|calendar|prediksi/.test(text)?OPTIONS[1]:'';
        if(found){select.value=found;select.dispatchEvent(new Event('change',{bubbles:true}))}
        else select.focus();
      };
    }
    typeField.insertAdjacentElement('afterend',copy);
    return copy;
  }
  function keywordsFrom(tagField,initiative){
    // Clone exactly the Tags field DOM and styles. Never duplicate its IDs or
    // listeners: Keywords has isolated state, while Tags keeps its handlers.
    const copy=tagField.cloneNode(true);
    copy.id='nr-editorial-keywords';
    copy.classList.add('nr-reused-tags-field','newsroom-tag-lookup');
    copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    const chips=$('.tag-list',copy);
    const input=$('.newsroom-tag-search input',copy);
    const menu=$('.newsroom-tag-results',copy);
    if(!chips||!input||!menu)return null;
    chips.id='nrKeywordList';chips.replaceChildren();
    input.id='nrKeywordInput';input.type='search';input.placeholder='Search keywords…';
    input.setAttribute('autocomplete','off');
    input.setAttribute('aria-label','Search Keywords');
    menu.id='nrKeywordSuggestions';menu.replaceChildren();
    menu.classList.remove('has-results','is-empty');
    const label=$('label',copy);
    if(label){label.textContent='Keywords';label.htmlFor=input.id}
    copy.querySelectorAll('.alt-tag-head strong').forEach(el=>el.textContent='Keywords');
    copy.querySelectorAll('.alt-tag-hint').forEach(el=>el.textContent='Search and select existing keywords.');
    copy.querySelectorAll('.nr-tag-feedback').forEach(el=>el.remove());
    copy.querySelectorAll('.alt-ai-tag-suggestions').forEach(el=>{el.replaceChildren();el.classList.remove('open')});
    const source=$('#seoKeyword');
    let values=get('nr:editorial-keywords',[]);
    values=Array.isArray(values)?values.map(clean).filter(Boolean).slice(0,MAX):[];
    if(!values.length&&source?.value.trim())values=[source.value.trim()];
    const feedback=document.createElement('div');
    feedback.className='nr-tag-feedback';feedback.id='nrKeywordsFeedback';
    feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    $('.tag-wrap',copy).insertAdjacentElement('afterend',feedback);
    input.setAttribute('aria-describedby',feedback.id);
    function status(message,warning=false){
      feedback.textContent=message;
      feedback.classList.toggle('is-warning',warning);
    }
    function sync(){
      put('nr:editorial-keywords',values);
      const first=values[0]||'';
      if(source&&source.value!==first){
        source.value=first;
        source.dispatchEvent(new Event('input',{bubbles:true}));
        source.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }
    function draw(){
      chips.replaceChildren();
      values.forEach((value,index)=>{
        const chip=document.createElement('span');chip.className='tag-chip';
        const label=document.createElement('span');label.textContent=value;
        const button=document.createElement('button');button.type='button';
        button.setAttribute('aria-label','Hapus keyword '+value);
        const icon=document.createElement('i');icon.setAttribute('data-lucide','x');
        button.append(icon);
        button.onclick=()=>{values.splice(index,1);draw();suggest();sync()};
        chip.append(label,button);chips.append(chip);
      });
      status(values.length+' of '+MAX+' keywords added.');
      if(window.lucide)window.lucide.createIcons();
    }
    function add(value){
      const next=clean(value);
      if(!next)return false;
      if(values.some(item=>item.toLowerCase()===next.toLowerCase())){
        status('This keyword has already been added.',true);return false;
      }
      if(values.length>=MAX){status('Maximum '+MAX+' keywords allowed.',true);return false}
      values.push(next);input.value='';draw();suggest();sync();return true;
    }
    function suggest(){
      const query=clean(input.value).toLowerCase();
      menu.replaceChildren();menu.classList.remove('has-results','is-empty');
      if(!query)return;
      const results=catalogue().filter(value=>value.toLowerCase().includes(query)&&
        !values.some(v=>v.toLowerCase()===value.toLowerCase())).slice(0,8);
      if(!results.length||values.length>=MAX){
        const empty=document.createElement('div');empty.className='newsroom-tag-empty';
        empty.textContent=values.length>=MAX?'Maximum 5 keywords allowed.':'Keyword tidak ditemukan';
        menu.append(empty);menu.classList.add('is-empty');return;
      }
      for(const item of results){
        const button=document.createElement('button');button.type='button';
        button.className='newsroom-tag-result';button.dataset.add=item;
        const text=document.createElement('span');text.textContent=item;
        const icon=document.createElement('span');icon.className='newsroom-tag-result-icon';
        const plus=document.createElement('i');plus.setAttribute('data-lucide','plus');
        icon.append(plus);button.append(text,icon);
        button.onclick=()=>{add(item);input.focus()};
        menu.append(button);
      }
      menu.classList.add('has-results');
      if(window.lucide)window.lucide.createIcons();
    }
    input.addEventListener('input',suggest);
    input.addEventListener('keydown',event=>{
      if(event.key==='Enter'){
        event.preventDefault();
        const first=menu.querySelector('[data-add]');
        if(first)first.click();
        else status('Select a suggested keyword from the list.',true);
      }else if(event.key==='Escape'){input.value='';suggest()}
    });
    const ai=$('.alt-tag-ai',copy);
    if(ai){
      ai.onclick=event=>{
        event.preventDefault();event.stopImmediatePropagation();
        const body=clean(($('#title')?.value||'')+' '+($('#dek')?.value||'')).toLowerCase();
        const matches=catalogue().filter(value=>body.includes(value.toLowerCase())&&!values.includes(value));
        if(!matches.length){input.focus();status('No matching keyword suggestions yet.',true);return}
        matches.slice(0,MAX-values.length).forEach(add);
        copy.classList.add('ai-suggested-field');
        setTimeout(()=>copy.classList.remove('ai-suggested-field'),1600);
      };
    }
    if(source)source.addEventListener('input',()=>{
      const next=clean(source.value);
      if(next===(values[0]||''))return;
      if(values.length)values[0]=next;
      else if(next)values.push(next);
      values=values.filter(Boolean);
      draw();put('nr:editorial-keywords',values);
    });
    initiative.insertAdjacentElement('afterend',copy);
    draw();return copy;
  }
  function init(){
    const pane=$('#infoPane'),type=$('#articleType')?.closest('.field');
    const tags=$('#tagInput')?.closest('.field');
    if(!pane||!type||!tags||!pane.contains(type)||!pane.contains(tags))return false;
    pane.querySelector('#nr-editorial-initiative')?.remove();
    pane.querySelector('#nr-editorial-keywords:not(.nr-reused-tags-field)')?.remove();
    const initiative=$('#nr-initiative-reused-field')||initiativeFrom(type);
    if(!initiative)return false;
    if(!$('#nr-editorial-keywords'))keywordsFrom(tags,initiative);
    return !!$('#nr-editorial-keywords');
  }
  function boot(){
    if(init())return;
    let attempts=0;
    const retry=setInterval(()=>{if(init()||++attempts>30)clearInterval(retry)},200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();