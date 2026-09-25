const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#altValidationModal',{state:'attached',timeout:15000});
  await page.locator('#publishBtn').click();
  const modal=page.locator('#altValidationModal');
  await modal.waitFor({state:'visible'});
  if(await modal.getAttribute('aria-hidden')!=='false')throw Error('Visible dialog must be accessible');
  if(!await page.locator('body').evaluate(el=>el.classList.contains('nr-review-scroll-lock')))
    throw Error('Background body is not scroll locked');
  if(await page.locator('#altValidationList .alt-validation-row:not(.warn)').count())
    throw Error('Ready rows should only appear in collapsed details');
  const details=page.locator('#altValidationReady');
  if(!await details.count())throw Error('Ready section missing');
  const action=page.locator('#altValidationAction');
  if(await page.locator('#altValidationList .alt-validation-row.warn').count()&&await action.isEnabled())
    throw Error('Publish must be disabled when required items are missing');
  const body=await page.locator('#altValidationModal .modal-body').evaluate(el=>({overflow:getComputedStyle(el).overflowY,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
  if(body.overflow!=='auto')throw Error('Dialog must use its own scroll region '+JSON.stringify(body));
  await page.locator('#altValidationClose').click();
  if(await modal.isVisible())throw Error('Close button did not close the dialog');
  if(await page.locator('body').evaluate(el=>el.classList.contains('nr-review-scroll-lock')))
    throw Error('Background scroll lock not restored on close');
  await page.locator('#publishBtn').click();
  await modal.waitFor({state:'visible'});
  await page.keyboard.press('Escape');
  if(await modal.isVisible())throw Error('Escape did not close review modal');
  await page.setViewportSize({width:390,height:740});
  await page.locator('#publishBtn').click();
  await modal.waitFor({state:'visible'});
  const metrics=await modal.locator('.alt-validation-card').evaluate(el=>({height:el.getBoundingClientRect().height,viewport:innerHeight}));
  if(metrics.height>metrics.viewport)throw Error('Review modal overflows narrow viewport '+JSON.stringify(metrics));
  await page.locator('#altValidationBack').click();
  if(errors.length)throw Error('Browser exceptions: '+errors.join('; '));
  console.log('PASS: issues-first review, disabled publish, independent scroll, Escape and mobile layout');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
