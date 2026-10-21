/* Diagnostic only: computes real selectors/styles. Never writes CMS data. */
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(1200);
  const inspect=async stage=>page.evaluate(stage=>{
   const targets=['Judul Page Berikutnya','Tambahkan Image','Pilih image dari gallery','Pilih image dari galeri','Normal','Large','Sangat Besar'];
   const all=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0 && targets.some(t=>(e.textContent||'').trim().toLowerCase().includes(t.toLowerCase()))).slice(0,40);
   const describe=e=>{const s=getComputedStyle(e);return {tag:e.tagName,id:e.id,cls:String(e.className||'').slice(0,120),color:s.color,bg:s.backgroundColor,visible:!!e.getClientRects().length,outer:e.outerHTML.slice(0,320)}};
   return {stage,theme:document.documentElement.dataset.theme,found:all.map(e=>({text:e.textContent.trim().slice(0,100),path:[e,e.parentElement,e.parentElement?.parentElement].filter(Boolean).map(describe)})),
    popovers:[...document.querySelectorAll('[role="menu"],[role="listbox"],[class*="font"],[class*="size"]')].filter(e=>e.getClientRects().length).slice(-25).map(describe)};
  },stage);
  console.log('DARK_TARGET_INITIAL '+JSON.stringify(await inspect('initial')));
  const sizeTrigger=page.locator('button').filter({hasText:/^(T|Font Size|Ukuran Font)$/i}).first();
  if(await sizeTrigger.count()){await sizeTrigger.click({timeout:2500}).catch(()=>{});console.log('DARK_TARGET_MENU '+JSON.stringify(await inspect('menu')))}
  // Inspect editor's content-type DOM targets; no content mutation.
  console.log('DARK_TARGET_EDITOR '+JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.alt-content-card')].slice(0,20).map(e=>({type:e.dataset.type,classes:e.className,html:e.outerHTML.slice(0,700)})))));
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
