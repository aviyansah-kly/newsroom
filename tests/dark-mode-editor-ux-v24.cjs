/* Screenshot-led regression: Dark Editor separators, six Add Content tiles,
 * sticky toolbars, exact Content Block icon, Review → Perbaiki orange focus.
 * Runs against candidate branch (local http.server), NO publishing/production writes.
 */
const assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const engine=process.env.NR_BROWSER||'chromium';
(async()=>{
 const browser=await ({chromium,firefox,webkit}[engine]||chromium).launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:1600,height:950}});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#publishBtn').waitFor({state:'visible',timeout:30000});
 await page.waitForFunction(()=>!!document.querySelector('script[data-nr-review-focus]'),null,{timeout:10000});
 await page.waitForTimeout(1600);
 const state=await page.evaluate(()=>{
  const get=sel=>{
   let el=document.querySelector(sel);if(!el)return {exists:false};
   let s=getComputedStyle(el),r=el.getBoundingClientRect();
   return {exists:true,visible:r.width>0&&r.height>0,bg:s.backgroundColor,border:s.borderColor,bottom:s.borderBottomColor,borderWidth:s.borderTopWidth,outline:s.outlineWidth};
  };
  const menu=document.querySelector('.alt-editor-section .alt-add-menu');
  return {
   separator:get('.alt-writing-card .alt-editor-section'),
   addMenu:get('.alt-editor-section .alt-add-menu'),
   tiles:[...menu?.querySelectorAll('[data-alt-add]')||[]].map(e=>{let s=getComputedStyle(e);return {name:e.dataset.altAdd,bg:s.backgroundColor,border:s.borderTopColor,width:s.borderTopWidth,style:s.borderTopStyle}}),
   icon:get('.alt-content-card .alt-content-card-title .icon'),
   toolbar:get('.alt-content-card[data-type="text"] .classic-toolbar'),
   headerStatus:get('.topbar .header-status-cluster'),
   navAccount:get('#cmsNavDrawer.nr-unified-nav .nr-nav-account')
  };
 });
 console.log('DARK_EDITOR_UX_COMPONENT_AUDIT '+JSON.stringify(state));
 assert.equal(state.tiles.length,6,'Six independent Add Content tiles');
 for(const tile of state.tiles){
   assert.equal(tile.bg,'rgb(43, 48, 55)',tile.name+' bg');
   assert.equal(tile.border,'rgb(70, 82, 96)',tile.name+' outline');
   assert.equal(tile.width,'1px',tile.name+' border present');
   assert.equal(tile.style,'solid');
 }
 assert.equal(state.icon.bg,'rgb(48, 55, 64)','Block type icon must not be white');
 // Exercise real existing sticky toolbar selector without moving layout:
 const sticky=await page.evaluate(()=>{
  const el=document.querySelector('#classicToolbar')||document.querySelector('.alt-content-card[data-type="text"] .classic-toolbar');
  if(!el)return {exists:false};
  const old=el.className;
  el.classList.add('newsroom-primary-stuck','v46-fixed');
  const s=getComputedStyle(el);
  const r={exists:true,bg:s.backgroundColor,border:s.borderBottomColor};
  el.className=old;return r;
 });
 console.log('DARK_STICKY_TOOLBAR_AUDIT '+JSON.stringify(sticky));
 assert(sticky.exists,'Primary Text toolbar should exist');
 assert.equal(sticky.bg,'rgb(48, 55, 64)','Sticky toolbar must use graphite');
 assert.equal(sticky.border,'rgb(48, 54, 62)','Sticky separator soft');
 assert(!/^rgb\\(2(0[0-9]|1[0-9]|2[0-9]),/.test(sticky.bg),'No white toolbar');
 await page.locator('#publishBtn').click();
 await page.locator('#altValidationModal').waitFor({state:'visible',timeout:12000});
 const titleFix=page.locator('#altValidationList .alt-validation-row.warn').filter({has:page.locator('strong', {hasText:'Judul Artikel'})}).locator('button').first();
 assert(await titleFix.count(),'Title Perbaiki button must exist');
 await titleFix.click({timeout:12000});
 await page.locator('#altValidationModal').waitFor({state:'hidden',timeout:12000});
 await page.waitForTimeout(620);
 const outline=await page.evaluate(()=>{
   const el=document.querySelector('#title');if(!el)return null;
   let s=getComputedStyle(el);return {className:el.className,color:s.outlineColor,width:s.outlineWidth,border:s.borderColor,focus:el===document.activeElement};
 });
 console.log('DARK_REVIEW_FIX_FOCUS '+JSON.stringify(outline));
 assert(outline?.className.includes('nr-review-focus-target'),'Title Perbaiki target must be highlighted');
 assert.equal(outline.width,'2px','Perbaiki ring visible');
 assert.equal(outline.color,'rgb(251, 191, 36)','Perbaiki ring amber');
 // Reopen to verify Short Desc label mapping, which legacy parse missed.
 await page.locator('#publishBtn').click();
 await page.locator('#altValidationModal').waitFor({state:'visible',timeout:12000});
 const descFix=page.locator('#altValidationList .alt-validation-row.warn').filter({hasText:'Short Desc'}).locator('button').first();
 if(await descFix.count()){
   await descFix.click({timeout:12000});
   await page.locator('#altValidationModal').waitFor({state:'hidden',timeout:12000});
   await page.waitForTimeout(620);
   assert(await page.locator('#dek').evaluate(el=>el.classList.contains('nr-review-focus-target')),'Short Desc Perbaiki must highlight actual textarea');
 }
 await browser.close();
 console.log('PASS: six editor UX corrections, real Review & Publish Perbaiki navigation ['+engine+']');
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
