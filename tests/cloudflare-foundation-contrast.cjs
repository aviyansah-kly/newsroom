/* Confirm resolving the missing foundation CSS does not overwrite Dark Mode UI.
 * Browser-only regression; no live deploy or content writes.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.NR_BASE_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport});
   await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
   await page.goto(new URL('index.html',base).href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForTimeout(500);
   const capture=()=>page.evaluate(()=>{
     const selectors=['body','.topbar','.alt-writing-card','#seoPane','#infoPane','.alt-add-menu','.seo-auto-row'];
     const fields=['backgroundColor','color','borderTopColor','fontSize'];
     const props=['--nr-ui-panel','--nr-ui-text','--ds-color-text','--ds-color-surface','--ds-action-neutral-bg'];
     const computed=getComputedStyle(document.documentElement);
     return {theme:document.documentElement.dataset.theme,
       props:Object.fromEntries(props.map(p=>[p,computed.getPropertyValue(p).trim()])),
       elements:Object.fromEntries(selectors.map(sel=>{
         const e=document.querySelector(sel);if(!e)return [sel,null];
         const css=getComputedStyle(e);return [sel,Object.fromEntries(fields.map(f=>[f,css[f]]))];
       }))
     };
   });
   const before=await capture();
   const response=await page.evaluate(()=>new Promise(resolve=>{
     const link=document.createElement('link');
     link.rel='stylesheet';link.href='/design-system/foundations/tokens.css';
     link.onload=()=>resolve(true);link.onerror=()=>resolve(false);
     document.head.append(link);
   }));
   assert.equal(response,true,'foundation CSS must load via allowlist');
   const after=await capture();
   assert.deepEqual(after,before,'adding foundation CSS must not override visible Dark Mode components');
   await page.close();
  }
  console.log('PASS: foundation CSS loads and Dark Mode component style remains unchanged');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
