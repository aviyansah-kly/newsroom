/* Newsroom Editor — Recipe Schema / Summary / FAQ (isolated demo).
 * Never sends data to an AI service or publishes schema; local draft only.
 */
(function () {
  'use strict';
  function init() {
    const paper=document.querySelector('body.alt-editor-layout .workspace > section > .paper');
    if (!paper || document.getElementById('nrEditorialEnrichment')) return;
    // Keep local prototype enrichment distinct between article records.
    const storyId=document.querySelector('.story-id')?.textContent?.trim()||location.pathname;
    const KEY='newsroom:editor-enrichment:v1:'+storyId;
    const root=document.createElement('div');
    root.id='nrEditorialEnrichment';
    root.className='nr-editor-enrichment';
    root.innerHTML=
      '<section class="nr-enrich-card" id="nrRecipeCard">'+
        '<div class="nr-enrich-head"><div class="nr-enrich-heading"><span class="nr-enrich-heading-icon"><i data-lucide="chef-hat"></i></span><div><h2>Recipe Schema</h2><p>Structured data untuk artikel resep.</p></div></div>'+
          '<label class="nr-enrich-enable"><input type="checkbox" id="nrRecipeEnabled"><span>Enable</span></label></div>'+
        '<div class="nr-enrich-body" id="nrRecipeBody" hidden>'+
          '<div class="nr-enrich-toolbar"><div class="nr-enrich-modes" role="group" aria-label="Recipe Mode"><button type="button" class="nr-btn is-selected" data-recipe-mode="single" aria-pressed="true">Single</button><button type="button" class="nr-btn" data-recipe-mode="listicle" aria-pressed="false">Listicle</button></div><span class="nr-enrich-type">schema.org/Recipe</span><button type="button" class="nr-btn nr-btn-primary" id="nrRecipeGenerate"><i data-lucide="braces"></i><span>Generate Schema</span></button></div>'+
          '<div class="nr-enrich-schema-base"><label class="nr-enrich-field"><span>@context</span><input type="text" value="https://schema.org" readonly aria-label="Schema Context"></label><label class="nr-enrich-field"><span>@type</span><input type="text" value="Recipe" readonly aria-label="Schema Type"></label></div>'+
          '<div id="nrRecipeItems" class="nr-enrich-items"></div>'+
          '<button type="button" id="nrAddRecipe" class="nr-btn nr-enrich-add" hidden><i data-lucide="plus"></i><span>Add Recipe</span></button>'+
          '<div class="nr-enrich-output" id="nrRecipeOutput" hidden><div class="nr-enrich-output-head"><strong>JSON-LD Preview</strong><button class="nr-btn" type="button" id="nrRecipeCopy"><i data-lucide="copy"></i><span>Copy</span></button></div><pre id="nrRecipeJSON" tabindex="0"></pre></div>'+
          '<div class="nr-enrich-notice" id="nrRecipeFeedback" role="status" aria-live="polite">Schema is not published from this prototype.</div>'+
        '</div>'+
      '</section>'+
      '<section class="nr-enrich-card" id="nrSummaryCard">'+
        '<div class="nr-enrich-head"><div class="nr-enrich-heading"><span class="nr-enrich-heading-icon"><i data-lucide="file-text"></i></span><div><h2>Summary <span class="nr-enrich-optional">Optional</span></h2><p>Ringkasan artikel dalam poin-poin.</p></div></div><label class="nr-enrich-enable"><input type="checkbox" id="nrSummaryEnabled" aria-controls="nrSummaryBody"><span>Enable</span></label></div>'+
        '<div class="nr-enrich-body" id="nrSummaryBody" hidden><div class="nr-enrich-toolbar"><span class="nr-enrich-type">Poin ringkasan artikel</span><button type="button" class="nr-btn nr-enrich-ai" data-generate="summary"><i data-lucide="sparkles"></i><span>Generate AI</span></button></div><div id="nrSummaryItems" class="nr-enrich-point-list"></div><button type="button" class="nr-btn nr-enrich-add" id="nrSummaryAdd"><i data-lucide="plus"></i><span>Add Point</span></button><div class="nr-enrich-suggestion" id="nrSummarySuggestion" hidden><div class="nr-enrich-suggest-head"><strong>AI Demo Suggestion</strong><button type="button" class="nr-btn" id="nrSummaryApply">Use Suggestions</button></div><div id="nrSummaryDraft" class="nr-enrich-point-preview"></div></div><p class="nr-enrich-assist">Demo AI mengambil poin dari artikel. Periksa saran sebelum digunakan.</p><span class="nr-enrich-live" id="nrSummaryFeedback" role="status" aria-live="polite"></span></div>'+
      '</section>'+
      '<section class="nr-enrich-card" id="nrFaqCard">'+
        '<div class="nr-enrich-head"><div class="nr-enrich-heading"><span class="nr-enrich-heading-icon"><i data-lucide="messages-square"></i></span><div><h2>FAQ <span class="nr-enrich-optional">Optional</span></h2><p>Pertanyaan dan jawaban untuk pembaca.</p></div></div><label class="nr-enrich-enable"><input type="checkbox" id="nrFaqEnabled" aria-controls="nrFaqBody"><span>Enable</span></label></div>'+
        '<div class="nr-enrich-body" id="nrFaqBody" hidden><div class="nr-enrich-toolbar"><span class="nr-enrich-type">Question &amp; Answer</span><button type="button" class="nr-btn nr-enrich-ai" data-generate="faq"><i data-lucide="sparkles"></i><span>Generate AI</span></button></div><div id="nrFaqItems" class="nr-enrich-faq-list"></div><button type="button" id="nrFaqAdd" class="nr-btn nr-enrich-add"><i data-lucide="plus"></i><span>Add Question</span></button>'+
          '<div class="nr-enrich-suggestion" id="nrFaqSuggestion" hidden><div class="nr-enrich-suggest-head"><strong>AI Demo Suggestion</strong><button type="button" class="nr-btn" id="nrFaqApply">Use Suggestions</button></div><div id="nrFaqDraft"></div></div>'+
          '<p class="nr-enrich-assist">FAQ bersifat opsional. Tinjau semua jawaban sebelum digunakan.</p><span class="nr-enrich-live" id="nrFaqFeedback" role="status" aria-live="polite"></span></div>'+
      '</section>';
    paper.appendChild(root);
    const q=sel=>root.querySelector(sel);
    const qa=sel=>[...root.querySelectorAll(sel)];
    let recipeMode='single',faqDraft=[],summarySuggestions=[];
    let recipeCount=0,faqCount=0,summaryCount=0;
    const icons=node=>{if(window.lucide?.createIcons)window.lucide.createIcons({nodes:[node]});};
    const docTitle=()=>document.getElementById('title')?.value.trim()||'';
    const docDek=()=>document.getElementById('dek')?.value.trim()||'';
    function excerpt(){
      const rich=document.querySelector('#tiptap-editor .tiptap-editor, #tiptap-editor [contenteditable="true"]');
      const raw=(rich?.innerText||'').replace(/\s+/g,' ').trim();
      return raw.length>35?raw.slice(0,850):'';
    }
    function field(name,label,options){
      const wrap=document.createElement('label');wrap.className='nr-enrich-field';
      const span=document.createElement('span');span.textContent=label;wrap.appendChild(span);
      const input=document.createElement(options?.multiline?'textarea':'input');
      input.dataset.recipeField=name;
      if(options?.multiline)input.rows=3;
      else input.type=options?.type||'text';
      input.placeholder=options?.placeholder||'';
      if(options?.type==='number'){input.min='0';input.step='1';}
      wrap.appendChild(input);
      return wrap;
    }
    function newRecipe(data) {
      const card=document.createElement('div');card.className='nr-enrich-recipe-item';
      card.dataset.recipeItem=String(++recipeCount);
      const header=document.createElement('div');header.className='nr-enrich-item-head';
      const title=document.createElement('strong');title.className='nr-enrich-recipe-name';header.appendChild(title);
      const remove=document.createElement('button');remove.type='button';remove.className='nr-btn nr-enrich-remove';remove.dataset.removeRecipe='';remove.textContent='Remove';header.appendChild(remove);card.appendChild(header);
      const grid=document.createElement('div');grid.className='nr-enrich-field-grid';
      const defs=[
        ['name','Name',{placeholder:'Nama resep'}],['image','Image URL',{type:'url',placeholder:'https://…'}],
        ['category','Recipe Category',{placeholder:'Main course, dessert, dll.'}],['cuisine','Recipe Cuisine',{placeholder:'Indonesian'}],
        ['keywords','Keywords',{placeholder:'Pisahkan dengan koma'}],['yield','Recipe Yield',{placeholder:'4 porsi'}],
        ['datePublished','Date Published',{type:'date'}],
        ['description','Description',{multiline:true,placeholder:'Deskripsi resep'}],
        ['prep','Prep Time (Minutes)',{type:'number',placeholder:'15'}],['cook','Cook Time (Minutes)',{type:'number',placeholder:'30'}],
        ['total','Total Time (ISO 8601)',{placeholder:'PT45M (opsional, dihitung otomatis jika kosong)'}]
      ];
      function renderFields(definitions,target){
        definitions.forEach(([key,label,opts])=>{
          const box=field(key,label,opts);
          if(opts.multiline)box.classList.add('nr-enrich-field-wide');
          const input=box.querySelector('input,textarea');
          input.value=data?.[key]||'';
          target.appendChild(box);
        });
      }
      renderFields(defs,grid);
      const basicHead=document.createElement('div');
      basicHead.className='nr-enrich-basic-head';
      const basicTitle=document.createElement('strong');basicTitle.textContent='Recipe Details';
      const basicGenerate=document.createElement('button');basicGenerate.type='button';
      basicGenerate.className='nr-btn nr-enrich-ai nr-enrich-section-generate';
      basicGenerate.dataset.recipeGenerate='details';
      basicGenerate.innerHTML='<i data-lucide="sparkles"></i><span>Generate AI</span>';
      basicHead.append(basicTitle,basicGenerate);
      const basicBody=document.createElement('div');basicBody.className='nr-enrich-basic-body';
      basicBody.appendChild(grid);
      card.append(basicHead,basicBody);
      function detailGroup(title,fields,openByDefault=false){
        const details=document.createElement('details');
        details.className='nr-enrich-details';
        const heading=document.createElement('summary');
        const headingText=document.createElement('span');headingText.textContent=title;
        const chevron=document.createElement('i');
        chevron.dataset.lucide='chevron-down';
        chevron.className='nr-enrich-chevron';
        chevron.setAttribute('aria-hidden','true');
        heading.append(headingText,chevron);
        details.appendChild(heading);
        const generate=document.createElement('button');generate.type='button';
        generate.className='nr-btn nr-enrich-ai nr-enrich-section-generate';
        generate.dataset.recipeGenerate=title==='Recipe Ingredients'?'ingredients':
          title==='Recipe Instructions'?'instructions':title==='Aggregate Rating'?'rating':
          title==='Nutrition'?'nutrition':'author';
        generate.innerHTML='<i data-lucide="sparkles"></i><span>Generate AI</span>';
        generate.setAttribute('aria-label','Generate AI Demo for '+title);
        details.appendChild(generate);
        const body=document.createElement('div');body.className='nr-enrich-details-body';
        const inner=document.createElement('div');inner.className='nr-enrich-field-grid';
        renderFields(fields,inner);body.appendChild(inner);
        details.appendChild(body);
        details.open=openByDefault||fields.some(([key])=>Boolean(data?.[key]));
        card.appendChild(details);return body;
      }
      const authorBody=detailGroup('Author',[
        ['authorName','Author Name',{placeholder:'Nama penulis resep'}]
      ]);
      const authorNote=document.createElement('p');authorNote.className='nr-enrich-group-note';
      authorNote.textContent='@type: Person';authorBody.prepend(authorNote);
      const ratingBody=detailGroup('Aggregate Rating',[
        ['ratingValue','Rating Value',{type:'number',placeholder:'4.5'}],
        ['reviewCount','Review Count',{type:'number',placeholder:'12'}],
        ['bestRating','Best Rating',{type:'number',placeholder:'5'}],
        ['worstRating','Worst Rating',{type:'number',placeholder:'1'}]
      ]);
      const ratingNote=document.createElement('p');ratingNote.className='nr-enrich-group-note';
      ratingNote.textContent='@type: AggregateRating. Isi hanya rating yang telah diverifikasi.';ratingBody.prepend(ratingNote);
      const nutritionBody=detailGroup('Nutrition',[
        ['servingSize','Serving Size',{placeholder:'1 porsi'}],
        ['calories','Calories',{placeholder:'200 calories'}],
        ['fatContent','Fat Content',{placeholder:'10 g'}]
      ]);
      const nutritionNote=document.createElement('p');nutritionNote.className='nr-enrich-group-note';
      nutritionNote.textContent='@type: NutritionInformation';nutritionBody.prepend(nutritionNote);
      const ingredientsBody=detailGroup('Recipe Ingredients',[
        ['ingredients','Ingredients (One Per Line)',{multiline:true,placeholder:'Satu bahan per baris (atau tambahkan per item di bawah)'}]
      ],true);
      const ingredientList=document.createElement('div');
      ingredientList.className='nr-enrich-ingredient-list';ingredientList.dataset.ingredientList='';
      ingredientsBody.appendChild(ingredientList);
      (Array.isArray(data?.ingredientRows)?data.ingredientRows:[]).forEach(value=>newIngredientRow(ingredientList,value));
      const ingredientAdd=document.createElement('button');
      ingredientAdd.type='button';ingredientAdd.className='nr-btn nr-enrich-add';
      ingredientAdd.dataset.addIngredient='';ingredientAdd.textContent='Add Ingredient';
      ingredientsBody.appendChild(ingredientAdd);
      detailGroup('Recipe Instructions',[
        ['instructions','Instructions (One Step Per Line)',{multiline:true,placeholder:'Satu langkah per baris'}]
      ],true);
      q('#nrRecipeItems').appendChild(card);
      icons(card);
      updateRecipeLabels();return card;
    }
    function newIngredientRow(list,value=''){
      const row=document.createElement('div');row.className='nr-enrich-ingredient-row';
      const input=document.createElement('input');input.type='text';
      input.dataset.recipeIngredient='';input.value=value;
      input.placeholder='Nama dan takaran bahan';input.setAttribute('aria-label','Recipe Ingredient');
      const remove=document.createElement('button');remove.type='button';
      remove.className='nr-btn nr-enrich-remove';remove.dataset.removeIngredient='';
      remove.setAttribute('aria-label','Remove Ingredient');remove.textContent='Remove';
      row.append(input,remove);list.appendChild(row);return input;
    }
    function updateRecipeLabels(){
      const items=qa('[data-recipe-item]');
      items.forEach((card,i)=>{
        card.querySelector('.nr-enrich-recipe-name').textContent=recipeMode==='single'?'Recipe':'Recipe '+(i+1);
        card.querySelector('[data-remove-recipe]').hidden=recipeMode==='single' || items.length===1;
      });
    }
    function getRecipes(){
      return qa('[data-recipe-item]').map(card=>{
        const obj={};card.querySelectorAll('[data-recipe-field]').forEach(el=>obj[el.dataset.recipeField]=el.value.trim());
        obj.ingredientRows=[...card.querySelectorAll('[data-recipe-ingredient]')].map(el=>el.value.trim()).filter(Boolean);
        return obj;
      });
    }
    function setMode(mode){
      recipeMode=mode==='listicle'?'listicle':'single';
      qa('[data-recipe-mode]').forEach(btn=>{
        const active=btn.dataset.recipeMode===recipeMode;
        btn.classList.toggle('is-selected',active);btn.setAttribute('aria-pressed',String(active));
      });
      q('#nrAddRecipe').hidden=recipeMode!=='listicle';
      if(recipeMode==='single')qa('[data-recipe-item]').slice(1).forEach(el=>el.remove());
      if(!q('[data-recipe-item]'))newRecipe();
      updateRecipeLabels();
      q('#nrRecipeOutput').hidden=true;
      save();
    }
    function newSummaryPoint(value=''){
      const item=document.createElement('div');
      item.className='nr-enrich-point-item';item.dataset.summaryItem=String(++summaryCount);
      const head=document.createElement('div');head.className='nr-enrich-item-head';
      const title=document.createElement('strong');title.className='nr-enrich-point-label';
      const remove=document.createElement('button');remove.type='button';
      remove.className='nr-btn nr-enrich-remove';
      remove.dataset.removeSummary='';remove.textContent='Remove';
      head.append(title,remove);
      const fieldWrap=document.createElement('label');fieldWrap.className='nr-enrich-field';
      const input=document.createElement('textarea');input.rows=2;
      input.dataset.summaryPoint='';input.value=value;input.placeholder='Tulis poin ringkasan…';
      fieldWrap.appendChild(input);
      item.append(head,fieldWrap);q('#nrSummaryItems').appendChild(item);
      updateSummaryLabels();return item;
    }
    function updateSummaryLabels(){
      qa('[data-summary-item]').forEach((item,i)=>{
        item.querySelector('.nr-enrich-point-label').textContent='Point '+(i+1);
        item.querySelector('[data-summary-point]').setAttribute('aria-label','Summary Point '+(i+1));
      });
    }
    function getSummaryPoints(){
      return qa('[data-summary-point]').map(el=>el.value.trim());
    }
    function newFaq(data){
      const card=document.createElement('div');card.className='nr-enrich-faq-item';card.dataset.faqItem=String(++faqCount);
      const head=document.createElement('div');head.className='nr-enrich-item-head';
      const title=document.createElement('strong');title.className='nr-enrich-faq-label';head.appendChild(title);
      const remove=document.createElement('button');remove.type='button';remove.className='nr-btn nr-enrich-remove';
      remove.dataset.removeFaq='';remove.textContent='Remove';head.appendChild(remove);card.appendChild(head);
      for(const [key,label,placeholder] of [['question','Question','Tulis pertanyaan…'],['answer','Answer','Tulis jawaban…']]){
        const wrap=field(key,label,{multiline:key==='answer',placeholder});
        wrap.querySelector('input,textarea').dataset.faqField=key;
        wrap.querySelector('input,textarea').removeAttribute('data-recipe-field');
        if(key==='answer')wrap.querySelector('textarea').rows=3;
        wrap.querySelector('input,textarea').value=data?.[key]||'';
        card.appendChild(wrap);
      }
      q('#nrFaqItems').appendChild(card);updateFaqLabels();return card;
    }
    function updateFaqLabels(){
      qa('[data-faq-item]').forEach((card,i)=>card.querySelector('.nr-enrich-faq-label').textContent='Question '+(i+1));
    }
    function getFAQs(){return qa('[data-faq-item]').map(card=>({
      question:card.querySelector('[data-faq-field="question"]').value.trim(),
      answer:card.querySelector('[data-faq-field="answer"]').value.trim()
    }));}
    function getData(){return {
      recipeEnabled:q('#nrRecipeEnabled').checked,recipeMode,recipes:getRecipes(),
      summaryEnabled:q('#nrSummaryEnabled').checked,summaryPoints:getSummaryPoints(),
      summary:getSummaryPoints().filter(Boolean).join('\n'),
      faqEnabled:q('#nrFaqEnabled').checked,faqs:getFAQs()
    };}
    function save(){
      try{localStorage.setItem(KEY,JSON.stringify(getData()));}catch(err){}
    }
    let existing={};
    try{existing=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(err){}
    (Array.isArray(existing.recipes)&&existing.recipes.length?existing.recipes:[{}]).forEach(newRecipe);
    // Migrate the legacy free-form Summary draft without silently discarding editor input.
    const storedPoints=Array.isArray(existing.summaryPoints)
      ?existing.summaryPoints
      :(typeof existing.summary==='string' && existing.summary.trim()
        ?existing.summary.split('\n').map(s=>s.trim()).filter(Boolean):[]);
    storedPoints.forEach(value=>newSummaryPoint(value));
    (Array.isArray(existing.faqs)?existing.faqs:[]).forEach(newFaq);
    q('#nrRecipeEnabled').checked=!!existing.recipeEnabled;
    q('#nrSummaryEnabled').checked=typeof existing.summaryEnabled==='boolean'?existing.summaryEnabled:storedPoints.length>0;
    q('#nrFaqEnabled').checked=typeof existing.faqEnabled==='boolean'?existing.faqEnabled:!!existing.faqs?.length;
    function syncEnabledPanels(){
      for(const [checkbox,body] of [['#nrRecipeEnabled','#nrRecipeBody'],['#nrSummaryEnabled','#nrSummaryBody'],['#nrFaqEnabled','#nrFaqBody']]){
        const enabled=q(checkbox).checked;
        q(body).hidden=!enabled;
        q(checkbox).setAttribute('aria-expanded',String(enabled));
      }
    }
    syncEnabledPanels();
    setMode(existing.recipeMode);
    root.addEventListener('input',event=>{
      if(event.target.matches('input,textarea')){save();q('#nrRecipeOutput').hidden=true;}
    });
    root.addEventListener('change',event=>{
      if(['nrRecipeEnabled','nrSummaryEnabled','nrFaqEnabled'].includes(event.target.id)){
        syncEnabledPanels();
        if(event.target.id==='nrSummaryEnabled' && event.target.checked && !qa('[data-summary-item]').length)newSummaryPoint();
      }
      if(event.target.matches('input,textarea'))save();
    });
    root.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button||!root.contains(button))return;
      if(button.dataset.recipeMode){setMode(button.dataset.recipeMode);return;}
      if(button.id==='nrAddRecipe'){newRecipe({});save();return;}
      if(button.hasAttribute('data-add-ingredient')){
        const list=button.closest('[data-recipe-item]')?.querySelector('[data-ingredient-list]');
        if(list){const input=newIngredientRow(list);input.focus();save();}
        return;
      }
      if(button.hasAttribute('data-remove-ingredient')){
        button.closest('.nr-enrich-ingredient-row')?.remove();save();return;
      }
      if(button.hasAttribute('data-remove-recipe')){
        if(qa('[data-recipe-item]').length<=1)return;
        button.closest('[data-recipe-item]')?.remove();updateRecipeLabels();save();return;
      }
      if(button.id==='nrSummaryAdd'){newSummaryPoint();save();return;}
      if(button.hasAttribute('data-remove-summary')){
        button.closest('[data-summary-item]')?.remove();updateSummaryLabels();save();return;
      }
      if(button.id==='nrFaqAdd'){newFaq({});save();return;}
      if(button.hasAttribute('data-remove-faq')){
        button.closest('[data-faq-item]')?.remove();updateFaqLabels();save();return;
      }
      if(button.hasAttribute('data-recipe-generate')){
        suggestRecipeSection(button);return;
      }
      if(button.hasAttribute('data-recipe-apply')){
        const panel=button.closest('.nr-enrich-suggestion');
        const card=button.closest('[data-recipe-item]');
        const fields=panel?.recipeSuggestions||{};
        if(!card||!Object.keys(fields).length)return;
        for(const [fieldName,value] of Object.entries(fields)){
          const input=card.querySelector('[data-recipe-field="'+fieldName+'"]');
          if(input)input.value=value;
        }
        panel.hidden=true;save();q('#nrRecipeOutput').hidden=true;
        q('#nrRecipeFeedback').textContent='AI Demo suggestions applied. Check recipe facts before use.';
        return;
      }
      if(button.id==='nrRecipeGenerate'){generateRecipe();return;}
      if(button.id==='nrRecipeCopy'){
        const value=q('#nrRecipeJSON').textContent||'';
        if(!value)return;
        if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(
          ()=>q('#nrRecipeFeedback').textContent='JSON-LD copied (preview only).',
          ()=>q('#nrRecipeFeedback').textContent='Copy unavailable. Select the JSON text.'
        );
        else q('#nrRecipeFeedback').textContent='Select the JSON text to copy.';
        return;
      }
      if(button.dataset.generate==='summary'){suggestSummary();return;}
      if(button.dataset.generate==='faq'){suggestFAQ();return;}
      if(button.id==='nrSummaryApply'){
        if(!q('#nrSummaryEnabled').checked)return;
        for(const value of summarySuggestions)newSummaryPoint(value);
        q('#nrSummarySuggestion').hidden=true;
        save();q('#nrSummaryFeedback').textContent='Summary points added. Review before use.';return;
      }
      if(button.id==='nrFaqApply'){
        faqDraft.forEach(item=>newFaq(item));q('#nrFaqSuggestion').hidden=true;
        save();q('#nrFaqFeedback').textContent='FAQ suggestions added. Review before use.';return;
      }
    });
    // Scoped preview-only suggestions: no network calls, no data invented for
    // ratings, nutrition, authors or recipe steps that are absent in the article.
    function structuredLines(kind){
      const rich=document.querySelector('#tiptap-editor .tiptap-editor, #tiptap-editor [contenteditable="true"]');
      const lines=(rich?.innerText||'').split(/\n/).map(x=>x.trim()).filter(Boolean);
      const heading=kind==='ingredients'
        ?/^(?:bahan(?:-bahan)?|ingredients|komposisi)\s*:?$/i
        :/^(?:cara membuat|cara memasak|langkah(?:-langkah)?(?: pembuatan)?|instructions)\s*:?$/i;
      const stop=/^(?:bahan(?:-bahan)?|ingredients|komposisi|cara membuat|cara memasak|langkah(?:-langkah)?(?: pembuatan)?|instructions|tips|nutrition|informasi gizi)\s*:?$/i;
      const picked=[];let inside=false;
      for(const line of lines){
        if(heading.test(line)){inside=true;continue;}
        if(!inside)continue;
        if(stop.test(line))break;
        const clean=line.replace(/^(?:[-•*]|\d+[.)])\s*/,'').trim();
        if(clean.length>2 && clean.length<=300)picked.push(clean);
        if(picked.length>=10)break;
      }
      return picked;
    }
    function suggestRecipeSection(button){
      if(!q('#nrRecipeEnabled').checked)return;
      const card=button.closest('[data-recipe-item]');
      if(!card)return;
      const kind=button.dataset.recipeGenerate;
      const container=kind==='details'?card.querySelector('.nr-enrich-basic-body'):
        button.closest('.nr-enrich-details')?.querySelector('.nr-enrich-details-body');
      if(!container)return;
      container.querySelector('.nr-enrich-suggestion[data-recipe-preview]')?.remove();
      const suggestions={};
      if(kind==='details'){
        if(docTitle())suggestions.name=docTitle();
        if(docDek())suggestions.description=docDek();
      }else if(kind==='ingredients'||kind==='instructions'){
        const lines=structuredLines(kind);
        if(lines.length)suggestions[kind]=lines.join('\n');
      }
      const preview=document.createElement('div');
      preview.className='nr-enrich-suggestion';preview.dataset.recipePreview='';
      const header=document.createElement('div');header.className='nr-enrich-suggest-head';
      const heading=document.createElement('strong');heading.textContent='AI Demo Suggestion';
      header.appendChild(heading);preview.appendChild(header);
      const keys=Object.keys(suggestions);
      if(keys.length){
        for(const key of keys){
          const p=document.createElement('p');p.className='nr-enrich-preview-row';
          p.textContent=(key==='name'?'Name':key==='description'?'Description':
            key==='ingredients'?'Recipe Ingredients':'Recipe Instructions')+': '+suggestions[key];
          preview.appendChild(p);
        }
        const apply=document.createElement('button');apply.type='button';
        apply.className='nr-btn nr-enrich-apply';apply.dataset.recipeApply='';
        apply.textContent='Use Suggestions';header.appendChild(apply);
        preview.recipeSuggestions=suggestions;
      }else{
        const note=document.createElement('p');
        note.textContent=kind==='author'?'Nama penulis tidak dapat dipastikan dari artikel. Isi manual.':
          kind==='rating'?'Rating dan jumlah ulasan harus berasal dari data terverifikasi. Isi manual.':
          kind==='nutrition'?'Informasi gizi memerlukan data terverifikasi. Isi manual.':
          'Tidak ditemukan informasi '+(kind==='ingredients'?'bahan':'langkah resep')+
          ' yang terstruktur dalam artikel. Isi manual.';
        preview.appendChild(note);
      }
      container.appendChild(preview);
    }
    function schemaRecipe(r){
      const result={'@type':'Recipe',name:r.name};
      if(r.image)result.image=r.image;
      if(r.category)result.recipeCategory=r.category;
      if(r.cuisine)result.recipeCuisine=r.cuisine;
      if(r.keywords)result.keywords=r.keywords;
      if(r.yield)result.recipeYield=r.yield;
      if(r.datePublished)result.datePublished=r.datePublished;
      if(r.description)result.description=r.description;
      if(r.authorName)result.author={'@type':'Person',name:r.authorName};
      if(r.ratingValue){
        const rating={'@type':'AggregateRating',ratingValue:Number(r.ratingValue)};
        for(const [schemaKey,key] of [['reviewCount','reviewCount'],['bestRating','bestRating'],['worstRating','worstRating']]){
          if(r[key])rating[schemaKey]=Number(r[key]);
        }
        result.aggregateRating=rating;
      }
      if(r.servingSize||r.calories||r.fatContent){
        const nutrition={'@type':'NutritionInformation'};
        if(r.servingSize)nutrition.servingSize=r.servingSize;
        if(r.calories)nutrition.calories=r.calories;
        if(r.fatContent)nutrition.fatContent=r.fatContent;
        result.nutrition=nutrition;
      }
      for(const [key,value] of [['prepTime',r.prep],['cookTime',r.cook]]){
        if(value){const n=Number(value);if(Number.isFinite(n)&&n>=0)result[key]='PT'+Math.round(n)+'M';}
      }
      if(r.total)result.totalTime=r.total;
      else if(r.prep&&r.cook)result.totalTime='PT'+Math.round(Number(r.prep)+Number(r.cook))+'M';
      result.recipeIngredient=[...(r.ingredients||'').split('\n'),...(r.ingredientRows||[])].map(x=>x.trim()).filter(Boolean);
      result.recipeInstructions=(r.instructions||'').split('\n').map(x=>x.trim()).filter(Boolean).map(text=>({'@type':'HowToStep',text}));
      return result;
    }
    function generateRecipe(){
      const recipes=getRecipes(),feedback=q('#nrRecipeFeedback');
      if(!recipes.every(r=>r.name && (r.ingredients || (r.ingredientRows||[]).some(Boolean)) && r.instructions)){
        feedback.textContent='Lengkapi Name, Ingredients, dan Instructions untuk setiap resep.';
        q('#nrRecipeOutput').hidden=true;return;
      }
      if(recipes.some(r=>r.total && !/^P(?=.*\d)[0-9DTHMS]+$/i.test(r.total))){
        feedback.textContent='Total Time harus dalam format durasi ISO 8601, misalnya PT45M.';
        q('#nrRecipeOutput').hidden=true;return;
      }
      if(recipes.some(r=>r.image && !/^https:\/\/\S+$/i.test(r.image))){
        feedback.textContent='Image URL harus berupa tautan HTTPS yang valid.';
        q('#nrRecipeOutput').hidden=true;return;
      }
      const array=recipes.map(schemaRecipe);
      const result=recipeMode==='listicle'?{'@context':'https://schema.org','@graph':array}:{'@context':'https://schema.org',...array[0]};
      q('#nrRecipeJSON').textContent=JSON.stringify(result,null,2);
      q('#nrRecipeOutput').hidden=false;
      feedback.textContent='JSON-LD preview generated. Belum dipublikasikan ke CMS.';
    }
    function suggestSummary(){
      if(!q('#nrSummaryEnabled').checked)return;
      const source=(docDek()+' '+excerpt()).replace(/\s+/g,' ').trim();
      if(source.length<25){
        q('#nrSummaryFeedback').textContent='Isi Short Desc atau konten artikel sebelum Generate AI.';
        q('#nrSummarySuggestion').hidden=true;return;
      }
      // Extract available sentences verbatim; do not invent facts or overwrite existing points.
      summarySuggestions=(source.match(/[^.!?]+[.!?]?/g)||[]).map(v=>v.trim())
        .filter(v=>v.length>=20).slice(0,3);
      if(!summarySuggestions.length)summarySuggestions=[source.slice(0,320)];
      q('#nrSummaryDraft').replaceChildren();
      summarySuggestions.forEach((value,i)=>{
        const row=document.createElement('p');row.textContent='Point '+(i+1)+': '+value;
        q('#nrSummaryDraft').appendChild(row);
      });
      q('#nrSummarySuggestion').hidden=false;
      q('#nrSummaryFeedback').textContent='AI Demo: saran diambil dari teks artikel. Klik Use Suggestions untuk menambah poin.';
    }
    function suggestFAQ(){
      const title=docTitle(),dek=docDek(),content=excerpt();
      if(!title || (dek||content).length<25){
        q('#nrFaqFeedback').textContent='Isi judul dan Short Desc atau konten artikel sebelum Generate AI.';
        q('#nrFaqSuggestion').hidden=true;return;
      }
      faqDraft=[{question:'Apa informasi utama yang disampaikan artikel ini?',answer:(dek||content).slice(0,420)}];
      if(content.length>60&&content.toLowerCase()!==(dek||'').toLowerCase()){
        faqDraft.push({question:'Apa konteks tambahan yang dijelaskan dalam artikel?',answer:content.slice(0,420)});
      }
      q('#nrFaqDraft').replaceChildren();
      faqDraft.forEach((item,i)=>{
        const box=document.createElement('div');box.className='nr-enrich-faq-preview';
        const strong=document.createElement('strong');strong.textContent=(i+1)+'. '+item.question;
        const p=document.createElement('p');p.textContent=item.answer;
        box.append(strong,p);q('#nrFaqDraft').appendChild(box);
      });
      q('#nrFaqSuggestion').hidden=false;
      q('#nrFaqFeedback').textContent='Simulasi AI: jawaban disusun dari teks yang tersedia, bukan AI live.';
    }
    icons(root);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();