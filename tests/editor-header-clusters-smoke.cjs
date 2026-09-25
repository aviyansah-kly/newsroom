const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.header-identity-cluster',{timeout:15000});
  await page.waitForSelector('.header-status-cluster');
  await page.waitForSelector('.header-actions-cluster');
  await page.waitForSelector('.header-publish-cluster');
  if(await page.locator('.header-identity-cluster .brand').count()!==1)throw Error('Brand missing from identity');
  if(await page.locator('.header-status-cluster #saveStatus').count()!==1)throw Error('Save status missing');
  if(await page.locator('.header-actions-cluster #saveDraftBtn').count()!==1)throw Error('Save Draft missing');
  if(await page.locator('.header-publish-cluster #publishBtn').count()!==1)throw Error('Publish missing');

  // Saving is local browser storage; never imply successful server sync.
  await page.evaluate(()=>{
    const status=document.getElementById('saveStatus');
    status.classList.remove('saving','error');status.classList.add('saved');status.dataset.saveMode='local';
  });
  await page.waitForFunction(()=>document.getElementById('saveStatusTitle').textContent==='Tersimpan lokal');
  await page.context().setOffline(true);
  await page.waitForFunction(()=>document.getElementById('saveStatusTitle').textContent==='Offline · Lokal');
  await page.context().setOffline(false);
  await page.waitForFunction(()=>document.getElementById('saveStatusTitle').textContent==='Tersimpan lokal');
  await page.evaluate(()=>document.getElementById('saveStatus').dataset.saveMode='memory');
  await page.waitForFunction(()=>document.getElementById('saveStatusTitle').textContent==='Tidak aman');
  await page.evaluate(()=>{
    const status=document.getElementById('saveStatus');
    status.classList.remove('saved','saving');status.classList.add('error');
  });
  await page.waitForFunction(()=>document.getElementById('saveStatusTitle').textContent==='Gagal simpan');

  for(const width of [1440,1280,1024,768,620,390]){
   await page.setViewportSize({width,height:900});
   await page.waitForTimeout(150);
   const metrics=await page.evaluate(()=>{
     const status=document.getElementById('saveStatusTitle');
     return {screen:innerWidth,scroll:document.documentElement.scrollWidth,
       statusVisible:status.getBoundingClientRect().width>0&&getComputedStyle(status).fontSize!=='0px',
       publishVisible:document.getElementById('publishBtn').getBoundingClientRect().width>0};
   });
   if(metrics.scroll>width+3)throw Error('Overflow: '+JSON.stringify(metrics));
   if(!metrics.statusVisible||!metrics.publishVisible)throw Error('Critical header item hidden: '+JSON.stringify(metrics));
   console.log('WIDTH',JSON.stringify(metrics));
  }
  if(errors.length)throw Error('Page errors '+errors.join('; '));
  console.log('PASS: four header clusters, offline/local/memory/error states, six responsive widths');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
