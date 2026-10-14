/*
 * Test REAL Cloudflare Workers rendering, not a local copy of this repository.
 * Opens SEO, Review & Publish schedule and checks actual CSS computed values.
 * Does not submit/publish articles or edit persisted data.
 */
const {chromium}=require('playwright');
const base=process.env.NR_LIVE_BASE||'https://newsroom.avi-yansah.workers.dev/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:940}});
 const errors=[];const failedAssets=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400 && /(theme|newsroom|\.css)/.test(r.url()))failedAssets.push({url:r.url(),status:r.status()})});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#publishBtn').waitFor({state:'visible',timeout:45000});
 await page.waitForTimeout(800);
 const results=[];
 async function inspect(label,selectors){
   const state=await page.evaluate((selectors)=>{
     const m={};
     selectors.forEach(selector=>{
       const e=document.querySelector(selector);
       if(!e){m[selector]={exists:false};return}
       const c=getComputedStyle(e),r=e.getBoundingClientRect();
       m[selector]={exists:true,visible:c.display!=='none' && c.visibility!=='hidden' && r.height>5 && r.width>5,
         bg:c.backgroundColor,fg:c.color,border:c.borderTopColor,borderBottom:c.borderBottomColor};
     });
     const all=[],brightBorders=[];
     document.querySelectorAll('body *').forEach(e=>{
       const c=getComputedStyle(e),r=e.getBoundingClientRect();
       if(!r.width||!r.height||c.display==='none'||c.visibility==='hidden'||Number(c.opacity)<.05||r.top>950||r.bottom<0) return;
       for(const side of ['Top','Bottom','Left','Right']){
         if(parseFloat(c['border'+side+'Width'])<1)continue;
         const v=(c['border'+side+'Color'].match(/[0-9.]+/g)||[]).slice(0,3).map(Number);
         if(v.length===3 && Math.min(...v)>170 && r.width>75 && r.height>20){
           const n=typeof e.className==='string'?e.className.split(/\\s+/).slice(0,3).join('.'):'';
           brightBorders.push({sel:e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+'.'+n,side,color:c['border'+side+'Color']});
         }
       }
       const rgb=(c.backgroundColor.match(/[0-9.]+/g)||[]).slice(0,4).map(Number);
       if(rgb.length<3 || Math.min(...rgb.slice(0,3))<217 || (rgb.length===4&&rgb[3]<.75))return;
       if(r.width<35||r.height<16)return;
       const classes=typeof e.className==='string'?e.className.split(/\s+/).slice(0,3).join('.'):'';
       all.push({sel:e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+'.'+classes,
         bg:c.backgroundColor,wh:[Math.round(r.width),Math.round(r.height)],
         txt:(e.textContent||'').trim().slice(0,32)});
     });
     return {computed:m,whiteSurfaces:all.slice(0,90),brightBorders:brightBorders.slice(0,75)};
   },selectors);
   results.push({label,...state});
   console.log('LIVE_UI_AUDIT '+JSON.stringify({label,...state}));
 }
 const start=await page.evaluate(()=>{
   let s=getComputedStyle(document.documentElement);
   return {theme:document.documentElement.dataset.theme,versionCSS:[...document.querySelectorAll('link[rel=stylesheet]')].filter(l=>/theme|dark/.test(l.href)).map(l=>l.href),
     versionVars:{panel:s.getPropertyValue('--nr-ui-panel').trim(),toggleOff:s.getPropertyValue('--nr-ui-toggle-off-track').trim()}};
 });
 console.log('LIVE_BOOTSTRAP '+JSON.stringify(start));
 await inspect('EDITOR INITIAL',['.alt-writing-card','.alt-content-card .alt-inline-media-preview','.alt-content-card .alt-standings-card','.switch input + .switch-track']);
 // Actual SEO panel is hidden until selected; previous QA never opened it.
 const seo=page.locator('[data-tab="seo"]').first();
 if(await seo.count()) await seo.click({timeout:9000});
 await page.waitForTimeout(350);
 await inspect('SEO ACTUAL',['#seoPane','#seoPane .seo-readiness','#seoPane .seo-auto','#seoPane .seo-auto-row','#seoPane .alt-slug-card','#seoPane .alt-slug-card input']);
 // Review & Publish is modal; schedule form does not render until toggled.
 await page.locator('#publishBtn').click({timeout:9000});
 await page.waitForTimeout(250);
 await inspect('REVIEW MODAL OPEN',['#altValidationModal .alt-validation-card','#altValidationModal .nr-review-schedule','#altValidationModal .schedule-fields','#altValidationModal .switch input + .switch-track']);
 const switchEl=page.locator('#publishScheduleToggle');
 if(await switchEl.count() && !await switchEl.isChecked()) await switchEl.check({force:true,timeout:9000});
 await page.waitForTimeout(350);
 await inspect('SCHEDULE EXPANDED',['#altValidationModal .schedule-fields.show','#altValidationModal #publishDate','#altValidationModal #publishTime','#altValidationModal .schedule-summary','#altValidationModal .nr-review-schedule']);
 await page.screenshot({path:'live-newsroom-dark-publish.png',animations:'disabled'});
 // Simulate exact dynamically inserted Video, Embed and Standings markup in writing card.
 const insertion=await page.evaluate(()=>{
   const owner=document.querySelector('.alt-writing-card');if(!owner)return false;
   const container=document.createElement('div');container.id='nr-live-audit-fixture';container.innerHTML=
     '<div class="alt-content-card" data-type="video"><div class="alt-content-card-body"><div class="alt-card-field"><label>Video URL</label><input></div><div class="alt-inline-media-preview alt-media-side-preview"><div class="alt-preview-empty-state">Preview video tampil di sini</div></div></div></div>'+
     '<div class="alt-content-card" data-type="embed"><div class="alt-content-card-body"><div class="alt-inline-media-preview alt-media-side-preview"><div class="alt-preview-empty-state">Preview embed tampil di sini</div></div></div></div>'+
     '<div class="alt-content-card" data-type="standings"><div class="alt-content-card-body"><div class="alt-standings-card"><div class="alt-standings-field"><select class="alt-standings-select"><option>— Pilih liga —</option></select></div></div></div></div>';
   owner.appendChild(container);
   return true;
 });
 if(insertion){
   // Audit component computed styles even when modal still overlays them.
   await inspect('DYNAMIC MEDIA FIXTURE',['#nr-live-audit-fixture [data-type="video"] .alt-inline-media-preview','#nr-live-audit-fixture [data-type="embed"] .alt-inline-media-preview','#nr-live-audit-fixture [data-type="standings"] .alt-standings-card','#nr-live-audit-fixture .alt-card-field input']);
 }
 console.log('LIVE_SCRIPT_ERRORS '+JSON.stringify(errors.slice(0,12)));
 console.log('LIVE_FAILED_ASSETS '+JSON.stringify(failedAssets.slice(0,12)));
 await browser.close();
 if(start.theme!=='dark') throw Error('Actual live did not activate Dark Mode');
 if(!start.versionVars.panel) throw Error('Canonical theme CSS was not activated on actual Cloudflare live');
 if(failedAssets.length) throw Error('Live theme asset network failures');
 const failures=results.filter(s=>s.whiteSurfaces.length>0).map(s=>({state:s.label,boxes:s.whiteSurfaces.slice(0,12)}));
 if(failures.length){
  console.error('LIVE_VISUAL_DEFECTS '+JSON.stringify(failures));
  if(process.env.NR_LIVE_REPORT_ONLY==='1'){
    console.log('REPORT ONLY: this PR is not yet deployed; defects are expected until post-merge release.');
    return;
  }
  process.exit(1);
 }
 console.log('PASS: live Cloudflare actual visible states have no near-white CMS UI surfaces');
})().catch(e=>{console.error('LIVE_CHECK_FAILURE',e.stack||e);process.exit(1)});
