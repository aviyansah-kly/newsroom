const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 try{
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#nrRightPanelToggle',{state:'visible',timeout:15000});
  for(const width of [1440,1280,1024,768,620,390]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(200);
    const layout=await page.evaluate(()=>{
      const rect=sel=>document.querySelector(sel)?.getBoundingClientRect();
      const top=rect('.topbar'),save=rect('#saveStatus'),text=rect('#saveStatusTitle');
      const workspace=rect('.workspace'),paper=rect('.workspace>section>.paper');
      return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
       topbarWidth:top?.width,saveWidth:save?.width,saveTextWidth:text?.width,
       saveTextVisible:!!text&&getComputedStyle(document.querySelector('#saveStatusTitle')).fontSize!=='0px'&&text.width>0,
       writingWidth:paper?.width,canvasWidth:workspace?.width,
       leftPadding:getComputedStyle(document.querySelector('.workspace')).paddingLeft,
       rightPadding:getComputedStyle(document.querySelector('.workspace')).paddingRight};
    });
    if(layout.scrollWidth>width+3)throw Error('Horizontal overflow '+JSON.stringify(layout));
    if(!layout.saveTextVisible)throw Error('Autosave label clipped/hidden '+JSON.stringify(layout));
    if(!layout.writingWidth||layout.writingWidth<90)throw Error('Writing area unavailable '+JSON.stringify(layout));
    if(width===390&&(layout.leftPadding!=='12px'||layout.rightPadding!=='62px'))throw Error('Phone gutters wrong '+JSON.stringify(layout));
    console.log('VIEWPORT',JSON.stringify(layout));
  }
  await page.setViewportSize({width:1440,height:900});
  const getWidth=()=>page.locator('.alt-writing-card').evaluate(el=>el.getBoundingClientRect().width);
  const before=await getWidth();
  await page.locator('#nrRightPanelToggle').click();
  await page.waitForTimeout(250);
  const right=await getWidth();
  if(right<=before+140)throw Error('Writing card did not grow after right rail collapse');
  await page.locator('#cmsNavClose').click();
  await page.waitForTimeout(250);
  const both=await getWidth();
  if(both<=right+70)throw Error('Writing card did not grow after left rail collapse');
  if(errors.length)throw Error('Browser errors: '+errors.join('; '));
  console.log('PASS: responsive autosave and writing surface across six viewport widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
