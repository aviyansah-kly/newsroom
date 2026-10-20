/* Newsroom Design System Phase 1+2 baseline parity.
 * Compare the unmodified main checkout against refactor checkout served
 * independently. Only compare UI styles; no draft/save/publish operations.
 * Usage:
 * NR_BASELINE_URL=http://127.0.0.1:8765/
 * NR_CANDIDATE_URL=http://127.0.0.1:8766/
 * node tests/design-system-parity.cjs
 */
const { chromium, firefox, webkit }=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const engine=process.env.NR_BROWSER||'chromium';
const baseline=process.env.NR_BASELINE_URL||'http://127.0.0.1:8765/';
const candidate=process.env.NR_CANDIDATE_URL||'http://127.0.0.1:8766/';
const reportFile=process.env.NR_DS_REPORT||'/tmp/newsroom-design-system-parity.json';
const tokenFile=path.join(__dirname,'..','styles','newsroom-theme-tokens.css');
const tokens=[...new Set([...fs.readFileSync(tokenFile,'utf8').matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]))];
const targets={
  'dashboard.html':['body','.nr-topbar','.nr-sidebar','.nr-nav-item','.dashboard-quick','.dashboard-open','.nr-account-trigger'],
  'articles.html':['body','.nr-topbar','.nr-sidebar','.article-shell','.article-toolbar','.article-row','.article-list','.article-preview-btn','.nr-account-trigger'],
  'tags.html':['body','.nr-topbar','.nr-sidebar','.tag-table','.tag-search input','.nr-modal-card','.nr-account-trigger'],
  'index.html':['body','.topbar','.context','.alt-writing-card','#seoPane','.seo-auto','.seo-auto-status.seo-icon-slot','#infoPane','#nrScheduleProbe','#nrScheduleProbe input[type="date"]','#nrScheduleProbe .schedule-summary','.alt-add-menu','.alt-add-icon','.team-add-panel','.team-search-wrap','.nr-account-trigger']
};
const fields=['backgroundColor','color','borderTopColor','borderRightColor','borderBottomColor','borderLeftColor','borderRadius','fontSize','fontWeight','boxShadow','display'];
const report={engine,baseline,candidate,tokenCount:tokens.length,routes:[],differences:[],errors:[]};
async function capture(browser,url,route,theme,viewport){
 const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(mode=>{try{localStorage.setItem('newsroom:appearance',mode)}catch(e){}},theme);
 await page.goto(new URL(route,url).href,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(1200);
 const actual=await page.evaluate(({tokens,selectors,fields})=>{
  // Reproduce the existing Dark Mode contract's Schedule Publish fixture in
  // BOTH checkouts, to determine whether its failed assertion predates V3.
  const modal=document.querySelector('#altValidationModal');
  if(modal){
    const probe=document.createElement('div');
    probe.id='nrScheduleProbe';
    probe.className='nr-review-schedule';
    probe.innerHTML='<div class="nr-review-schedule-head"><strong>Schedule Publish</strong></div><div class="schedule-fields show"><div class="schedule-grid"><div class="schedule-control"><label>Date</label><input type="date"></div><div class="schedule-control"><label>Time</label><input type="time"></div></div><div class="schedule-summary">Scheduled for 10:00 WIB</div></div>';
    modal.appendChild(probe);
  }
  const root=getComputedStyle(document.documentElement);
  const props=Object.fromEntries(tokens.map(key=>[key,root.getPropertyValue(key).trim()]));
  const style={};
  for(const selector of selectors){
   const e=document.querySelector(selector);
   if(!e){style[selector]=null;continue;}
   const computed=getComputedStyle(e);
   style[selector]=Object.fromEntries(fields.map(field=>[field,computed[field]]));
  }
  const sheets=[...document.querySelectorAll('link[rel=stylesheet]')].map(el=>el.getAttribute('href')||'');
  return {theme:document.documentElement.dataset.theme,props,style,sheets,
    popupManager:typeof window.sixdeskCloseWorkspacePopups};
 },{tokens,selectors:targets[route],fields});
 await page.close();
 return {...actual,errors};
}
(async()=>{
 const browser=await ({chromium,firefox,webkit}[engine]||chromium).launch({
  headless:true,args:engine==='chromium'?['--no-sandbox']:[]
 });
 try{
  for(const viewport of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]){
   for(const theme of ['light','dark']){
    for(const route of Object.keys(targets)){
     const label=route+' / '+theme+' / '+viewport.name;
     const before=await capture(browser,baseline,route,theme,viewport);
     const after=await capture(browser,candidate,route,theme,viewport);
     report.routes.push({label,components:Object.keys(before.style).length});
     const differ=(key,oldValue,newValue)=>{
      if(oldValue!==newValue)report.differences.push({label,key,baseline:oldValue,candidate:newValue});
     };
     differ('active theme',before.theme,after.theme);
     if(!after.sheets.some(x=>x.includes('newsroom-theme-tokens.css')))
      report.differences.push({label,key:'theme stylesheet missing',candidate:after.sheets});
     for(const token of tokens)differ('token '+token,before.props[token],after.props[token]);
     for(const selector of targets[route]){
      for(const field of fields){
       const oldValue=before.style[selector]?.[field]??null;
       const newValue=after.style[selector]?.[field]??null;
       differ(selector+' '+field,oldValue,newValue);
      }
     }
     if(route==='index.html')differ('popup manager binding',before.popupManager,after.popupManager);
     // Runtime external errors may already exist in baseline. Only new ones fail.
     for(const error of after.errors){
       if(!before.errors.includes(error))report.errors.push({label,error});
     }
     console.log('CHECK '+label+' diffs='+report.differences.filter(d=>d.label===label).length);
    }
   }
  }
 }finally{await browser.close()}
 fs.mkdirSync(path.dirname(reportFile),{recursive:true});
 fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
 console.log('DESIGN_SYSTEM_PARITY '+JSON.stringify({
  routes:report.routes.length,tokens:report.tokenCount,differences:report.differences.length,
  newJavascriptErrors:report.errors.length,
  samples:report.differences.slice(0,12)
 }));
 if(report.differences.length||report.errors.length)process.exitCode=1;
})().catch(error=>{
 report.errors.push({fatal:String(error.stack||error)});
 fs.mkdirSync(path.dirname(reportFile),{recursive:true});
 fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
 console.error(error.stack||error);process.exitCode=1;
});