const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('#nrLinkOverlay',{state:'attached',timeout:15000});
    await page.waitForFunction(()=>!!window.sixdeskTiptap,{timeout:35000});
    const open=()=>page.evaluate(()=>document.querySelector('#linkTool')?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
    await open();
    await page.locator('#nrLinkOverlay').waitFor({state:'visible'});
    if(await page.locator('#nrLinkResults').isVisible())throw Error('Results must start hidden');
    if(await page.locator('#nrLinkApply').isEnabled())throw Error('Insert Link must start disabled without URL/text');
    if(await page.locator('#linkPopup.open').count())throw Error('Legacy popup must remain closed');

    // Direct URL is the primary flow, with no AI required.
    await page.locator('#nrLinkText').fill('Berita terkait');
    await page.locator('#nrLinkInternalUrl').fill('https://www.liputan6.com/news/read/demo-003/kebijakan-ekonomi-terbaru');
    if(!await page.locator('#nrLinkApply').isEnabled())throw Error('Valid Liputan6 URL should enable insertion');
    await page.locator('#nrLinkApply').click();
    await page.locator('#nrLinkOverlay').waitFor({state:'hidden'});
    const editor=page.locator('#tiptap-editor .tiptap-editor');
    if(!await editor.locator('a[href*="demo-003"]').count())throw Error('Direct internal URL not inserted');

    // AI recommendations are optional and only visible after requesting them.
    await open();await page.locator('#nrLinkOverlay').waitFor({state:'visible'});
    await page.locator('#nrLinkAi').click();
    await page.waitForFunction(()=>document.getElementById('nrLinkAi')?.getAttribute('aria-busy')==='false');
    if(!await page.locator('#nrLinkSuggestions').isVisible())throw Error('AI results did not appear');
    if(await page.locator('#nrLinkResults [data-article-id]').count()!==3)throw Error('Expected three demo AI suggestions');
    await page.locator('#nrLinkResults [data-article-id]').first().click();
    if(!await page.locator('#nrLinkInternalUrl').inputValue())throw Error('Suggestion did not populate URL');
    if(!await page.locator('#nrLinkText').inputValue())throw Error('Suggestion did not populate empty display text');

    // External link options are isolated to the external tab.
    await page.locator('#nrLinkTabExternal').click();
    if(!await page.locator('#nrLinkOptions').isVisible())throw Error('External options must be visible');
    await page.locator('#nrLinkExternalUrl').fill('https://example.com/news');
    await page.locator('#nrLinkText').fill('Sumber berita');
    await page.locator('#nrLinkNofollow').check();
    await page.locator('#nrLinkApply').click();
    const a=await editor.locator('a[href="https://example.com/news"]').first().evaluate(e=>({rel:e.rel,target:e.target,text:e.textContent}));
    if(a.target!=='_blank'||!a.rel.includes('nofollow')||a.text!=='Sumber berita')throw Error('External link attributes incorrect');

    await open();await page.locator('#nrLinkClose').click();
    if(await page.locator('#nrLinkOverlay').isVisible())throw Error('Dialog failed to close');
    if(errors.length)throw Error('Browser errors: '+errors.join('; '));
    console.log('PASS: direct internal URL, optional AI, external options, shared dialog and close');
  }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
