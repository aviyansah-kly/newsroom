/* Newsroom Editorial reusable control regression.
 * Run with node tests/editorial-reusable-controls.cjs (Playwright installed).
 */
const assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const engine=process.env.NR_BROWSER||'chromium';
(async()=>{
 const browser=await ({chromium,firefox,webkit}[engine]||chromium).launch({
  headless:true,args:engine==='chromium'?['--no-sandbox']:[]
 });
 try{
  for(const mode of ['light','dark']){
   const page=await browser.newPage({viewport:{width:1550,height:950}});
   await page.addInitScript(theme=>localStorage.setItem('newsroom:appearance',theme),mode);
   await page.goto(process.env.NR_BASE_URL||'http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
   await page.locator('#nrKeywordInput').waitFor({state:'attached',timeout:20000});
   const overview=await page.evaluate(()=>{
    const byId=id=>document.querySelectorAll('#'+id).length;
    const initiative=document.getElementById('contentInitiative');
    return {
      options:[...initiative.options].map(o=>o.value),
      selectClass:initiative.closest('.field')?.className,
      tagField:!!document.querySelector('#altEditorialTagsSection .tag-wrap'),
      keywordField:!!document.querySelector('#nr-editorial-keywords .tag-wrap'),
      keywordInput:byId('nrKeywordInput'),tagInput:byId('tagInput'),
      keywordList:byId('nrKeywordList'),tagList:byId('tagList'),
      keywordAI:!!document.querySelector('#nr-editorial-keywords .alt-tag-ai'),
      initiativeAI:!!document.querySelector('#nr-initiative-reused-field button'),
      sameCatalog:typeof window.newsroomTagCatalog==='function'
    };
   });
   assert.deepEqual(overview.options,['','Pilkada Serentak','Predictive Calendar']);
   assert.ok(overview.selectClass.includes('field'));
   assert.ok(overview.tagField&&overview.keywordField);
   for(const key of ['keywordInput','tagInput','keywordList','tagList'])assert.equal(overview[key],1,key);
   assert.ok(overview.keywordAI&&overview.initiativeAI,'per-field AI Suggestions buttons');
   assert.ok(overview.sameCatalog,'original Tags catalog exposed');
   await page.locator('#contentInitiative').selectOption('Pilkada Serentak');
   assert.equal(await page.locator('#contentInitiative').inputValue(),'Pilkada Serentak');
   const originalTags=await page.locator('#tagList .tag-chip').count();
   const keywordInput=page.locator('#nrKeywordInput');
   await keywordInput.fill('Energi');
   const option=page.locator('#nrKeywordSuggestions [data-add="Energi"]');
   await option.waitFor({state:'visible',timeout:7000});
   await option.click();
   assert.ok(await page.locator('#nrKeywordList .tag-chip').count()>=1);
   assert.equal(await page.locator('#tagList .tag-chip').count(),originalTags,
    'Keywords must not change Tags');
   const chip=page.locator('#nrKeywordList .tag-chip').filter({hasText:'Energi'});
   await chip.locator('button').click();
   assert.equal(await page.locator('#nrKeywordList .tag-chip').filter({hasText:'Energi'}).count(),0);
   const native=await page.locator('#altEditorialTagsSection .tag-wrap').evaluate(el=>{
    const st=getComputedStyle(el);return {radius:st.borderRadius};
   });
   const reused=await page.locator('#nr-editorial-keywords .tag-wrap').evaluate(el=>{
    const st=getComputedStyle(el);return {radius:st.borderRadius,visible:el.getBoundingClientRect().width>0};
   });
   assert.ok(reused.visible);
   assert.equal(reused.radius,native.radius,'Tags/Keywords share component radius');
   console.log(mode,engine,'Editorial controls OK');
   await page.close();
  }
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exit(1)});