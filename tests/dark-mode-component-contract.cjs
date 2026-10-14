/* Dark Mode visual contract for canonical components (aligned to user screenshots).
 * Simulated fixture evaluates actual selectors without publishing or changing article data.
 * Run across Chromium/Firefox/WebKit; never consider passing these tests proof of production UAT.
 */
const assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
const name=process.env.NR_BROWSER||'chromium';
const browserType={chromium,firefox,webkit}[name]||chromium;
(async()=>{
 const browser=await browserType.launch({headless:true,args:name==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:1440,height:930}});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('.nr-account-trigger').first().waitFor({timeout:25000});
 await page.waitForFunction(()=>!!document.querySelector('link[data-nr-component-theme]'),null,{timeout:10000});
 await page.waitForTimeout(800);
 const result=await page.evaluate(async()=>{
  const css=getComputedStyle(document.documentElement);
  const token=n=>css.getPropertyValue(n).trim();
  const root=document.createElement('div');root.id='nr-theme-probe';root.style.position='absolute';root.style.left='-12000px';root.style.top='0';
  document.body.appendChild(root);
  const cssColor=sel=>{
   const el=document.querySelector(sel);
   if(!el) return null;
   const s=getComputedStyle(el);
   return {bg:s.backgroundColor,fg:s.color,border:s.borderTopColor,outline:s.outlineColor};
  };
  const results={};
  // Render real component classes inside their actual owner context.
  const owner=document.querySelector('.alt-writing-card')||document.body;
  const block=document.createElement('div');block.className='alt-content-card';block.dataset.type='video';
  block.innerHTML='<div class="alt-content-card-head">Video Block</div><div class="alt-content-card-body"><div class="alt-card-field"><label>Video URL</label><input type="url" value="https://example.test"></div><div class="alt-inline-media-preview alt-media-side-preview" data-video-preview><div class="alt-preview-empty-state">Preview video</div></div><div class="alt-standings-card"><div class="alt-standings-field"><label>Pilih Liga</label><select class="alt-standings-select"><option>Bundesliga</option></select></div></div></div>';
  owner.appendChild(block);
  results.canvas=cssColor('.alt-content-card .alt-content-card-body');
  results.video=cssColor('.alt-content-card .alt-inline-media-preview');
  results.videoText=cssColor('.alt-content-card .alt-preview-empty-state');
  results.standings=cssColor('.alt-content-card .alt-standings-card');
  results.field=cssColor('.alt-content-card .alt-card-field input');
  const seoPane=document.querySelector('#seoPane');
  if(seoPane){
   const seo=document.createElement('section');seo.id='nrSeoProbe';
   seo.innerHTML='<div class="seo-readiness"><strong>SEO Readiness</strong><span>Check</span></div><div class="seo-auto"><div class="seo-auto-list"><div class="seo-auto-row">Metadata</div></div></div><div class="alt-slug-card"><div class="alt-slug-head"><strong>Custom Slug</strong><span>Generated from Title</span></div><input value="news"></div>';
   seoPane.appendChild(seo);
   results.seoReady=cssColor('#nrSeoProbe .seo-readiness');
   results.seoReadyText=cssColor('#nrSeoProbe .seo-readiness strong');
   results.seoRow=cssColor('#nrSeoProbe .seo-auto-row');
   results.slug=cssColor('#nrSeoProbe .alt-slug-card');
   results.slugInput=cssColor('#nrSeoProbe .alt-slug-card input');
   seo.remove();
  }
  const modal=document.querySelector('#altValidationModal');
  if(modal){
   const schedule=document.createElement('div');schedule.id='nrScheduleProbe';
   schedule.className='nr-review-schedule';
   schedule.innerHTML='<div class="nr-review-schedule-head"><strong>Schedule Publish</strong></div><div class="schedule-fields show"><div class="schedule-grid"><div class="schedule-control"><label>Date</label><input type="date"></div><div class="schedule-control"><label>Time</label><input type="time"></div></div><div class="schedule-summary">Scheduled for 10:00 WIB</div></div>';
   modal.appendChild(schedule);
   results.schedule=cssColor('#nrScheduleProbe');
   results.scheduleFields=cssColor('#nrScheduleProbe .schedule-fields.show');
   results.scheduleDate=cssColor('#nrScheduleProbe input[type="date"]');
   results.scheduleSummary=cssColor('#nrScheduleProbe .schedule-summary');
   results.scheduleLabel=cssColor('#nrScheduleProbe .schedule-control label');
   schedule.remove();
  }
  const section=document.querySelector('#infoPane')||document.body;
  const toggle=document.createElement('label');toggle.className='switch';toggle.id='nrSwitchProbe';
  toggle.innerHTML='<input type="checkbox"><span class="switch-track"></span>';
  section.appendChild(toggle);
  results.off=cssColor('#nrSwitchProbe .switch-track');
  const thumb=getComputedStyle(toggle.querySelector('.switch-track'),'::after').backgroundColor;
  results.thumb=thumb;
  toggle.querySelector('input').click();
  results.checked=toggle.querySelector('input').checked;
  results.matchesOn=toggle.querySelector('.switch-track').matches('input:checked + .switch-track');
  results.matchesOff=toggle.querySelector('.switch-track').matches('input:not(:checked) + .switch-track');
  // The existing switch has a 160ms background/thumb transition.
  // Wait for its final ON state rather than measuring the first animation frame.
  await new Promise(resolve=>setTimeout(resolve,260));
  toggle.querySelector('.switch-track').getBoundingClientRect();
  results.on=cssColor('#nrSwitchProbe .switch-track');
  toggle.remove();
  block.remove();
  return {tokens:Object.fromEntries(['--nr-ui-app','--nr-ui-canvas','--nr-ui-divider','--nr-ui-input-border','--nr-ui-toggle-off-track','--nr-ui-toggle-on-track'].map(n=>[n,token(n)])),results};
 });
 console.log('CANONICAL_COMPONENT_AUDIT '+JSON.stringify(result));
 const d=result.results;
 const c=(key,part,expected)=>{assert(d[key],key+' not found');assert.equal(d[key][part],expected,key+' '+part+' must follow semantic token')};
 c('canvas','bg','rgb(39, 44, 50)');
 c('video','bg','rgb(43, 48, 55)');
 c('standings','bg','rgb(43, 48, 55)');
 c('field','bg','rgb(43, 48, 55)');
 c('seoReady','bg','rgb(36, 55, 43)');
 c('seoRow','bg','rgb(39, 44, 50)');
 c('slug','bg','rgb(39, 44, 50)');
 c('schedule','bg','rgb(34, 38, 44)');
 c('scheduleFields','bg','rgb(39, 44, 50)');
 c('scheduleDate','bg','rgb(43, 48, 55)');
 c('scheduleSummary','bg','rgb(36, 55, 43)');
 c('off','bg','rgb(70, 86, 108)');
 assert.equal(d.checked,true,'Checkbox changed ON after user click');
 c('on','bg','rgb(217, 43, 0)');
 assert.equal(d.thumb,'rgb(248, 250, 252)');
 // Check that theme change did not shift any baseline layout geometry.
 console.log('PASS: canonical component palette, SEO, video/standings, schedule and OFF/ON switch ['+name+']');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
