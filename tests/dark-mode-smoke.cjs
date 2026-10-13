/* Dark Mode smoke test for preview branch; does not publish or modify CMS data. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base='http://127.0.0.1:8765/';
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const theme=()=>page.evaluate(()=>document.documentElement.getAttribute('data-theme'));
  const bg=()=>page.evaluate(()=>getComputedStyle(document.body).backgroundColor);
  const menu=()=>page.locator('.nr-account-trigger').first();
  async function choose(value){
    if(!await page.locator('.nr-account-popover:not([hidden])').count())await menu().click();
    const control=page.locator('[data-nr-appearance-option="'+value+'"]').first();
    await control.waitFor({state:'visible',timeout:18000});
    await control.click();
    assert.equal(await control.getAttribute('aria-checked'),'true','Selected radio state');
  }
  async function visit(path){
    await page.goto(base+path,{waitUntil:'domcontentloaded',timeout:45000});
    await page.locator('[data-nr-appearance-option="light"]').first().waitFor({state:'attached',timeout:20000});
  }
  await visit('dashboard.html');
  assert.equal(await theme(),'light','First run must preserve Light Mode');
  const pre=await bg();
  await choose('dark');
  assert.equal(await theme(),'dark');
  const darkBg=await bg();
  assert.equal(darkBg,'rgb(23, 25, 29)','Dark background');
  assert.notEqual(pre,darkBg,'Light and Dark background should differ');
  await visit('articles.html');
  assert.equal(await theme(),'dark','Dark preference persists across Articles');
  await visit('tags.html');
  assert.equal(await theme(),'dark','Dark preference persists across Tags');
  await choose('light');
  assert.equal(await theme(),'light','Light preference works');
  await choose('system');
  assert.equal(await theme(),'light','System follows OS light');
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForTimeout(150);
  assert.equal(await theme(),'dark','System follows OS dark');
  await page.emulateMedia({colorScheme:'light'});
  await page.waitForTimeout(150);
  assert.equal(await theme(),'light','System responds to light change');
  await choose('dark');
  await visit('index.html');
  assert.equal(await theme(),'dark','Editor inherits theme preference');
  assert(await page.locator('.nr-account-trigger').count(),'Editor shares SidebarAccount');
  const title=page.locator('#title');
  if(await title.count()){
    const value=await title.inputValue().catch(()=>null);
    await choose('light');
    assert.equal(await theme(),'light');
    assert.equal(await title.inputValue().catch(()=>null),value,'Theme changes cannot rewrite article title');
    await choose('dark');
  }
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  // Theme controller must not inject a standalone toolbar toggle.
  assert.equal(await page.locator('.topbar [data-nr-appearance-option]').count(),0);
  assert.equal(await theme(),'dark','Dark theme on mobile viewport');
  await browser.close();
  console.log('PASS: Light default, Dark persistent, System reactive, Editor switch, content intact, mobile theme');
  console.log('Unrelated page script errors (first five):',errors.slice(0,5));
})().catch(err=>{console.error(err);process.exit(1)});
