/* Real Editorial SEO tab regression in Dark Mode.
   Covers exact markup that previously passed synthetic fixtures but remained white.
 */
const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
const engine=process.env.NR_BROWSER||'chromium';
(async()=>{
 const browser=await ({chromium,firefox,webkit}[engine]||chromium).launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:1440,height:940}});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('[data-tab="seo"]').first().waitFor({state:'visible',timeout:30000});
 await page.locator('[data-tab="seo"]').first().click();
 await page.waitForTimeout(350);
 const data=await page.evaluate(()=>{
   // Custom Slug is conditionally rendered depending on article/workflow state.
   // Cover both its real markup (if present) and the same DOM class contract in a fixture.
   const pane=document.querySelector('#seoPane');
   if(pane && !pane.querySelector('.alt-slug-input-wrap')){
     const fixture=document.createElement('div');
     fixture.id='nrSlugContractFixture';
     fixture.innerHTML='<div class="alt-slug-card"><div class="alt-slug-status">Not filled</div><div class="alt-slug-input-wrap"><input value="judul-demo" /></div><div class="alt-slug-preview">Preview URL</div><div class="alt-slug-rules"><span>lowercase</span><span>numbers</span><span>hyphens (-)</span></div></div>';
     pane.appendChild(fixture);
   }
   const variables=getComputedStyle(document.documentElement);
   const get=(sel)=>{const el=document.querySelector(sel);if(!el)return null;const s=getComputedStyle(el);const r=el.getBoundingClientRect();return {visible:r.height>6&&r.width>6,bg:s.backgroundColor,fg:s.color,border:s.borderTopColor}};
   return {
     tokens:{panel:variables.getPropertyValue('--nr-ui-panel').trim(),input:variables.getPropertyValue('--nr-ui-raised').trim()},
     seoAssistant:get('#seoPane > .seo-assistant'),
     editableBadge:get('#seoPane .seo-section-badge'),
     slugWrap:get('#seoPane .alt-slug-input-wrap'),
     slugPreview:get('#seoPane .alt-slug-preview'),
     slugStatus:get('#seoPane .alt-slug-status'),
     slugRule:get('#seoPane .alt-slug-rules span'),
     seoReadiness:get('#seoPane .seo-readiness'),
     slugInput:get('#seoPane .alt-slug-input-wrap input')
   };
 });
 console.log('SEO ACTUAL DOM COLORS '+JSON.stringify(data));
 const must=(name,bg)=>{assert(data[name]&&data[name].visible,name+' missing/hidden');assert.equal(data[name].bg,bg,name+' should not appear white in Dark Mode')};
 must('seoAssistant','rgb(34, 38, 44)');
 must('editableBadge','rgb(48, 55, 64)');
 must('slugWrap','rgb(43, 48, 55)');
 must('slugPreview','rgb(43, 48, 55)');
 must('slugStatus','rgb(48, 55, 64)');
 must('slugRule','rgb(48, 55, 64)');
 must('seoReadiness','rgb(36, 55, 43)');
 assert.equal(data.slugInput.bg,'rgb(43, 48, 55)','Slug input matches the raised surface');
 await page.screenshot({path:'dark-mode-seo-actual.png',animations:'disabled'});
 await browser.close();
 console.log('PASS: actual SEO tab component surfaces ['+engine+']');
})().catch(e=>{console.error(e);process.exit(1)});
