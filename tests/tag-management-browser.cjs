const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 async function verify(theme,width){
  const context=await browser.newContext({viewport:{width,height:900}});
  await context.route(/^https:\/\/(unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//,route=>route.abort());
  await context.addInitScript(()=>{window.lucide={createIcons(){}}});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(theme+'/'+width+': '+e.message));
  await page.goto('http://127.0.0.1:8765/tags.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  await page.locator('#tagRows tr').first().waitFor({timeout:15000});
  assert.equal(await page.locator('#tagRows tr').count(),12);
  const initial=page.locator('#tagRows tr').filter({hasText:'Harga BBM'});
  await initial.getByRole('button',{name:'Merge'}).click();
  const debugState=await page.evaluate(()=>({classes:document.querySelector('#mergeTagModal').className,aria:document.querySelector('#mergeTagModal').getAttribute('aria-hidden'),display:getComputedStyle(document.querySelector('#mergeTagModal')).display,onclick:typeof document.querySelector('.merge-tag').onclick}));
  console.log('Merge modal state',JSON.stringify(debugState),'Page errors:',errors.join(' | '));
  assert.equal(await page.locator('#mergeTagModal').isVisible(),true);
  assert.equal(await page.locator('#mergeConfirm').isDisabled(),true);
  await page.locator('#mergeTargetSearch').fill('Harga BBM');
  assert.equal(await page.locator('#mergeTargetResults [role=option]').count(),0,'source excluded from targets');
  await page.locator('#mergeTargetSearch').fill('Migas');
  await page.locator('#mergeTargetResults [role=option]').first().click();
  assert.equal(await page.locator('#mergeConfirm').isEnabled(),true);
  assert.match(await page.locator('#mergeTargetSummary').textContent(),/Migas/);
  fs.mkdirSync('qa-screenshots/tags',{recursive:true});
  await page.screenshot({path:'qa-screenshots/tags/merge-'+theme+'-'+width+'.png',fullPage:true});
  await page.locator('#mergeConfirm').click();
  assert.equal(await page.locator('#tagRows tr').count(),11,'source removed after merge');
  assert.equal(await page.locator('#tagRows tr').filter({hasText:'Harga BBM'}).count(),0,'source tag absent');
  const dest=page.locator('#tagRows tr').filter({hasText:'Migas'});
  assert.match(await dest.textContent(),/350 articles/,'usage combined');
  await dest.getByRole('button',{name:'Edit Topic'}).click();
  assert.equal(await page.locator('#topicEditorModal').isVisible(),true);
  await page.locator('#topicTitle').fill('Migas Indonesia');
  await page.locator('#topicIntro').fill('Berita dan perkembangan sektor migas.');
  await page.locator('#topicBody').fill('Kumpulan konten utama dan konteks editorial.');
  await page.locator('#topicSeoTitle').fill('Migas Terbaru');
  await page.locator('#topicSeoDescription').fill('Informasi tentang industri migas terkini.');
  await page.screenshot({path:'qa-screenshots/tags/topic-'+theme+'-'+width+'.png',fullPage:true});
  await page.locator('#topicEditorForm button[type=submit]').click();
  console.log('Topic submit state',JSON.stringify(await page.evaluate(()=>({valid:document.querySelector('#topicEditorForm').checkValidity(),open:document.querySelector('#topicEditorModal').classList.contains('open'),error:document.querySelector('#topicError').textContent,hidden:document.querySelector('#topicError').hidden,topic:document.querySelector('#topicTitle').value,desc:document.querySelector('#topicIntro').value}))),errors.join(' | '));
  assert.equal(await page.locator('#topicEditorModal').isVisible(),false);
  await dest.getByRole('button',{name:'Edit Topic'}).click();
  assert.equal(await page.locator('#topicTitle').inputValue(),'Migas Indonesia','topic saved and reloaded');
  assert.equal(await page.locator('#topicBody').inputValue(),'Kumpulan konten utama dan konteks editorial.');
  await page.locator('#topicDialogClose').click();
  await dest.locator('[data-toggle=topic]').click();
  assert.equal(await dest.getByRole('button',{name:'Edit Topic'}).count(),0,'Topic edit hidden when inactive');
  await dest.locator('[data-toggle=topic]').click();
  assert.equal(await dest.getByRole('button',{name:'Edit Topic'}).count(),1,'Topic edit appears on activation');
  await page.locator('#addTagBtn').click();
  assert.equal(await page.locator('#tagModal').isVisible(),true,'existing add modal still works');
  await page.locator('#modalCancel').click();
  if(theme==='dark'){
    await page.locator('#mergeTargetSearch').count();
    await dest.getByRole('button',{name:'Merge'}).click();
    const bg=await page.locator('.tag-workflow-dialog').first().evaluate(node=>getComputedStyle(node).backgroundColor);
    assert.notEqual(bg,'rgb(255, 255, 255)','dark dialog must not be white');
    await page.locator('#mergeCancel').click();
  }
  await context.close();
 }
 try{
  for(const theme of ['light','dark'])for(const width of [1440,390])await verify(theme,width);
  assert.deepEqual(errors,[]);
  console.log('PASS: Merge Tag, Topic editor, controls, responsive and theme flows');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});