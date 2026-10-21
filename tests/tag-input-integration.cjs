/* Newsroom TagInput Phase 3 integration (isolated browser, no publish). */
const assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const driver={chromium,firefox,webkit}[process.env.NR_BROWSER||'chromium'];
const base=process.env.NR_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await driver.launch({headless:true,args:process.env.NR_BROWSER==='chromium'?['--no-sandbox']:[]});
 try{
 for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width:1480,height:950}});
  await page.addInitScript(value=>sessionStorage.clear()||localStorage.setItem('newsroom:appearance',value),theme);
  const uncaught=[];
  page.on('pageerror',error=>uncaught.push(error.message));
  await page.goto(new URL('index.html',base).href,{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#nrKeywordInput').waitFor({state:'attached',timeout:20000});
  const loaded=await page.evaluate(()=>({
   model:typeof window.NewsroomTagInputModel?.create==='function',
   modelScripts:document.querySelectorAll('script[data-nr-tag-input-model]').length,
   keywordScripts:document.querySelectorAll('script[data-nr-editorial-reusable]').length,
   css:getComputedStyle(document.querySelector('#nr-editorial-keywords .tag-wrap')).borderRadius,
   tagsRadius:getComputedStyle(document.querySelector('#altEditorialTagsSection .tag-wrap')).borderRadius,
   options:[...document.querySelector('#contentInitiative').options].map(x=>x.value)
  }));
  assert.equal(loaded.model,true);
  assert.equal(loaded.modelScripts,1);
  assert.equal(loaded.keywordScripts,1);
  assert.equal(loaded.css,loaded.tagsRadius,'Keywords and Tags must share visual component radius');
  assert.deepEqual(loaded.options,['','Pilkada Serentak','Predictive Calendar']);
  const initialTags=await page.locator('#tagList .tag-chip').count();
  const keywordInput=page.locator('#nrKeywordInput');
  const initialKeywordCount=await page.locator('#nrKeywordList .tag-chip').count();
  // Search results are shared with the original Tags data source.
  await keywordInput.fill('Ener');
  await page.locator('#nrKeywordSuggestions [data-add="Energi"]').waitFor({state:'visible',timeout:7000});
  await page.locator('#nrKeywordSuggestions [data-add="Energi"]').click();
  assert.equal(await page.locator('#nrKeywordList .tag-chip').count(),initialKeywordCount+1);
  assert.equal(await page.locator('#tagList .tag-chip').count(),initialTags,'Keywords cannot mutate original Tags');
  // Remove added chip; SEO focus field and Tags remain isolated.
  const added=page.locator('#nrKeywordList .tag-chip').filter({hasText:'Energi'});
  await added.locator('button').click();
  assert.equal(await added.count(),0);
  // Model syncing a changed SEO primary focus into the first Keywords chip.
  const seo=page.locator('#seoKeyword');
  await page.locator('.context [data-tab="seo"]').first().evaluate(el=>el.click());
  await seo.waitFor({state:'visible',timeout:5000});
  await seo.fill('Testing Primary Keyword');
  await page.locator('.context [data-tab="info"]').first().evaluate(el=>el.click());
  assert.equal(await page.locator('#nrKeywordList .tag-chip').first().innerText().then(x=>x.trim()),'Testing Primary Keyword');
  assert.equal(await page.locator('#tagList .tag-chip').count(),initialTags);
  await page.locator('#contentInitiative').selectOption('Predictive Calendar');
  assert.equal(await page.locator('#contentInitiative').inputValue(),'Predictive Calendar');
  assert.deepEqual(uncaught,[],'No new uncaught JS errors');
  console.log('PASS phase3 '+theme+' components loaded, UI parity, Keywords changes, Tags isolation, SEO primary sync');
  await page.close();
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error.stack||error);process.exit(1)});