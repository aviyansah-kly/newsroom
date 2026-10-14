/* Newsroom Review → Perbaiki target feedback (Dark Mode only).
 * Canonical field target by validation row label, not legacy substring parsing
 * that missed "Short Desc". No content/status/backend changes. Capturing listener
 * coordinates one navigation and prevents duplicate legacy click handlers.
 */
(function(){
  "use strict";
  let current=null;
  const remove=()=>{
    if(!current)return;
    current.classList.remove('nr-review-focus-target');
    current.removeAttribute('data-nr-review-focus');
    current=null;
  };
  const $=selector=>document.querySelector(selector);
  function resolve(label){
    const text=label.trim().toLowerCase();
    if(/^(judul artikel|article title)/.test(text))return {key:'title',selector:'#title'};
    if(/short desc|ringkasan|dek|deskripsi singkat/.test(text))return {key:'dek',selector:'#dek'};
    if(/headline/.test(text))return {key:'headline',selector:'.headline-drop'};
    if(/seo keyword/.test(text))return {key:'seo',selector:'#seoKeyword',tab:'seo'};
    if(/reporter/.test(text))return {key:'reporter',selector:'[data-team-role="reporter"] .team-add-trigger',tab:'info'};
    if(/^editor\b/.test(text))return {key:'editor',selector:'[data-team-role="editor"] .team-add-trigger',tab:'info'};
    if(/konten artikel|article content/.test(text))return {key:'content',selector:'.alt-block-list .alt-content-card[data-type="text"], .alt-editor-section .alt-add-menu'};
    const match=text.match(/image\s+(\d+)\s+[—–-]\s+(.+)/);
    if(match){
      const index=Math.max(0,Number(match[1])-1);
      const part=match[2];
      const field=/photographer/.test(part)?'.v64-image-photographer':
        /photo source/.test(part)?'.v64-image-source':
        /short description/.test(part)?'.v64-image-desc':'.v64-image-title';
      return {key:'image',get:()=>document.querySelectorAll('.alt-content-card[data-type="image"]')[index]?.querySelector(field)};
    }
    return null; // preserve original behavior for unknown validation entries
  }
  function navigate(item){
    const tab=item.tab?document.querySelector('[data-tab="'+item.tab+'"]'):null;
    if(tab)tab.click();
    window.setTimeout(()=>{
      let target=typeof item.get==='function'?item.get():$(item.selector);
      if(item.key==='content'){
        const empty=target?.matches('.alt-content-card[data-type="text"]');
        if(!empty)target=$('.alt-editor-section .alt-add-menu')||$('.alt-editor-section');
      }
      if(!target)return;
      remove();
      target.classList.add('nr-review-focus-target');
      target.dataset.nrReviewFocus=item.key;
      const focusable=target.matches('input,textarea,select,button,[contenteditable="true"]')?
        target:target.querySelector('input,textarea,select,button,[contenteditable="true"]');
      target.scrollIntoView({block:'center',behavior:'smooth'});
      if(focusable?.focus)focusable.focus({preventScroll:true});
      // Keep outline visible until an actual edit; never remove merely on focus.
      current=target;
    },280);
  }
  document.addEventListener('click',e=>{
    if(document.documentElement.dataset.theme!=='dark')return;
    const button=e.target.closest('#altValidationList .alt-validation-row.warn button');
    if(!button)return;
    const row=button.closest('.alt-validation-row');
    const item=resolve(row?.querySelector('strong')?.textContent||'');
    if(!item)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const close=$('#altValidationClose');
    if(close)close.click();
    navigate(item);
  },true);
  function acknowledge(e){
    if(!e.isTrusted||!current)return;
    if(e.target===current||current.contains(e.target))remove();
  }
  document.addEventListener('input',acknowledge,true);
  document.addEventListener('change',acknowledge,true);
})();
