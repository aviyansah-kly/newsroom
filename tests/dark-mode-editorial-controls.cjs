/* Dark Mode Editorial Team + Add Content interaction regression.
 * Screenshots and computed-style assertions in both viewport sizes.
 * Run: NR_BASE_URL=http://127.0.0.1:8765 node tests/dark-mode-editorial-controls.cjs
 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.NR_BASE_URL||'http://127.0.0.1:8765/';
const out=process.env.NR_EDITORIAL_QA_REPORT||'/tmp/newsroom-editorial-controls-qa.json';
const shots=process.env.NR_EDITORIAL_QA_SCREENSHOTS||'';
const report={commit:process.env.GITHUB_SHA||'local',scenes:[],failures:[]};
function assert(condition,msg){if(!condition)report.failures.push(msg)}
function colors(value){const m=String(value).match(/rgba?\(([^)]+)\)/);return m?m[1].split(/[, /]+/).filter(Boolean).map(Number):[]}
const light=rgb=>{const v=colors(rgb);return v.length>=3&&Math.min(...v.slice(0,3))>217&&(v[3]===undefined||v[3]>.5)}
const luma=rgb=>{const v=colors(rgb);if(v.length<3)return 0;return (v[0]*.2126+v[1]*.7152+v[2]*.0722)}
async function auditBox(locator,name,expected){
 const actual=await locator.evaluate(el=>{
   const s=getComputedStyle(el);
   return {bg:s.backgroundColor,border:s.borderColor,color:s.color,font:s.fontSize,shadow:s.boxShadow,display:s.display};
 });
 report.scenes.push({name,actual});
 if(expected==='dark')assert(!light(actual.bg),name+': light background '+actual.bg);
 if(expected==='readable')assert(luma(actual.color)>140,name+': low contrast label '+actual.color);
 return actual;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const viewport of [{label:'desktop',width:1480,height:980},{label:'mobile',width:390,height:844}]){
   const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
   await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
   page.on('pageerror',e=>report.failures.push('JS ERROR '+e.message));
   await page.goto(new URL('index.html',base).href,{waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForTimeout(1600);
   assert(await page.evaluate(()=>document.documentElement.dataset.theme)==='dark',viewport.label+' theme must be dark');
   const pane=page.locator('#infoPane');
   const tab=page.locator('[data-tab="info"]').first();
   await tab.evaluate(el=>el.click());
   for(const role of ['reporter','editor']){
     const group=pane.locator('[data-team-role="'+role+'"]');
     await group.waitFor({state:'attached',timeout:8000});
     const opener=group.locator('[data-team-add]');
     await opener.evaluate(el=>el.click());
     const panel=group.locator('[data-team-add-panel]');
     await panel.waitFor({state:'visible',timeout:4000});
     const search=group.locator('.team-search-wrap');
     const input=group.locator('[data-team-search]');
     const cancel=group.locator('[data-team-cancel]');
     const list=group.locator('[data-team-suggestions]');
     const suggestion=group.locator('.team-suggestion').first();
     await auditBox(panel,viewport.label+' '+role+' add-panel','dark');
     await auditBox(search,viewport.label+' '+role+' search','dark');
     await auditBox(input,viewport.label+' '+role+' input','dark');
     await auditBox(cancel,viewport.label+' '+role+' cancel','dark');
     await auditBox(list,viewport.label+' '+role+' suggestions','dark');
     if(await suggestion.count()){
       await auditBox(suggestion,viewport.label+' '+role+' suggestion','dark');
       await auditBox(suggestion.locator('strong').first(),viewport.label+' '+role+' name','readable');
       const before=await group.locator('.team-member').count();
       await suggestion.evaluate(el=>el.click());
       const after=await group.locator('.team-member').count();
       assert(after===before+1,role+': selecting suggestion must add member');
       const remove=group.locator('.team-member').last().locator('.team-remove');
       await remove.evaluate(el=>el.click());
       assert(await group.locator('.team-member').count()===before,role+': remove selected member');
     }else report.failures.push(role+' suggestion did not render');
     await opener.evaluate(el=>el.click());
     await input.fill(role==='editor'?'Hasmi':'Nadia');
     await page.waitForTimeout(90);
     assert(await list.locator('.team-suggestion').count()>0,role+': search suggestions must work');
     await input.press('Escape');
     assert(await panel.evaluate(el=>el.hidden),role+': Escape should close panel');
   }
   const menu=page.locator('.alt-editor-section .alt-add-menu').first();
   await menu.waitFor({state:'attached',timeout:10000});
   await auditBox(menu,viewport.label+' Add Content wrapper','dark');
   const tiles=menu.locator('button[data-alt-add]');
   assert(await tiles.count()===6,viewport.label+' Add Content must have 6 types');
   for(let i=0;i<await tiles.count();i++){
     const tile=tiles.nth(i);
     await auditBox(tile,viewport.label+' tile '+i,'dark');
     await auditBox(tile.locator('strong').first(),viewport.label+' tile '+i+' title','readable');
     await auditBox(tile.locator('.alt-add-icon').first(),viewport.label+' tile '+i+' icon','dark');
   }
   const iconBg=await tiles.first().locator('.alt-add-icon').evaluate(el=>getComputedStyle(el).backgroundColor);
   for(let i=1;i<await tiles.count();i++){
     const bg=await tiles.nth(i).locator('.alt-add-icon').evaluate(el=>getComputedStyle(el).backgroundColor);
     assert(bg===iconBg,viewport.label+': inconsistent Add Content icon surface');
   }
   // Create one temporary Text Block in this isolated browser context.
   // No CMS save or publish action is invoked.
   const oldBlocks=await page.locator('.alt-content-card[data-type="text"]').count();
   await page.locator('.alt-editor-section .alt-add-menu [data-alt-add="text"]').first().evaluate(el=>el.click());
   await page.waitForTimeout(160);
   const newBlocks=await page.locator('.alt-content-card[data-type="text"]').count();
   assert(newBlocks>oldBlocks,viewport.label+': Add Content Text must insert block');
   if(newBlocks>oldBlocks){
     const block=page.locator('.alt-content-card[data-type="text"]').last();
     const heading=block.locator('.alt-content-card-title strong').first();
     const badge=block.locator('.alt-content-card-title .icon').first();
     if(await heading.count())await auditBox(heading,viewport.label+' Text Block title','readable');
     if(await badge.count()){
       const st=await auditBox(badge,viewport.label+' Text Block icon','dark');
       assert(st.bg===iconBg,viewport.label+': Text Block and Add Content icon boxes must share design token');
     }
   }
   if(shots){fs.mkdirSync(shots,{recursive:true});await page.screenshot({path:path.join(shots,viewport.label+'-team-and-content-dark.png'),fullPage:true,animations:'disabled'});}
   await page.close();
  }
 }finally{await browser.close()}
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2));
 console.log('EDITORIAL_CONTROL_QA',JSON.stringify({checks:report.scenes.length,failures:report.failures}));
 if(report.failures.length)process.exitCode=1;
})().catch(e=>{report.failures.push('Fatal QA error: '+String(e.stack||e));fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2));console.error(e.stack||e);process.exitCode=1});
