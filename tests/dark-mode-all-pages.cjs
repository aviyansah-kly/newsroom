/* Real-page Dark Mode visual audit: dashboard, articles, tags and editor.
 * Checks both viewports, scroll states, menus, modals, SEO and Review.
 * Run: NR_BROWSER=chromium NR_BASE_URL=http://127.0.0.1:8765 node tests/dark-mode-all-pages.cjs
 */
const {chromium,firefox,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const engine=process.env.NR_BROWSER||'chromium';
const base=process.env.NR_BASE_URL||'http://127.0.0.1:8765/';
const screenshotDir=process.env.NR_DARK_SCREENSHOTS_DIR||'';
const routes=['dashboard.html','articles.html','tags.html','index.html'];
const sizes=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const report={timestamp:new Date().toISOString(),commit:process.env.GITHUB_SHA||'local',engine,base,routes:[],interactionFailures:[],summary:{scenes:0,whiteSurfaces:0,brightBorders:0,missingDark:0,failedInteractions:0}};
const take=async(page,route,scene)=>{
 const data=await page.evaluate(()=>{
   const list=[],border=[];
   const elements=document.body.querySelectorAll('*');
   const vw=window.innerWidth,vh=window.innerHeight;
   const skip=e=>e.closest('svg,canvas,picture,.ProseMirror img,.alt-preview-article img,[data-nr-dark-ignore]')!==null || ['IMG','VIDEO','IFRAME','SVG','PATH','OPTION','CANVAS'].includes(e.tagName);
   const name=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string' && e.className.trim()?'.'+e.className.trim().split(/\s+/).slice(0,3).join('.'):'');
   const rgb=v=>{
      const m=String(v).match(/rgba?\(([^)]+)\)/);
      if(!m)return null;
      const nums=m[1].split(/[, /]+/).filter(Boolean).map(Number);
      return nums.length>=3?nums:null;
   };
   for(const e of elements){
     if(skip(e))continue;
     const r=e.getBoundingClientRect();
     if(r.width<42||r.height<19||r.right<0||r.bottom<0||r.left>vw||r.top>vh)continue;
     const c=getComputedStyle(e);
     if(c.display==='none'||c.visibility!=='visible'||parseFloat(c.opacity)<.6)continue;
     const n=name(e),text=(e.textContent||'').trim().slice(0,32);
     const v=rgb(c.backgroundColor);
     if(v&&(!Number.isFinite(v[3])||v[3]>=.7)){
       const [r1,g,b]=v;
       if(Math.min(r1,g,b)>=222 && Math.max(r1,g,b)-Math.min(r1,g,b)<=18){
          list.push({selector:n,bg:c.backgroundColor,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),text});
       }
     }
     for(const edge of ['Top','Right','Bottom','Left']){
       const thickness=parseFloat(c['border'+edge+'Width']);
       if(thickness<1)continue;
       const v=rgb(c['border'+edge+'Color']);
       if(v&&Math.min(...v.slice(0,3))>205 && Math.max(...v.slice(0,3))-Math.min(...v.slice(0,3))<18&&(!Number.isFinite(v[3])||v[3]>=.7)){
          border.push({selector:n,edge,bg:c['border'+edge+'Color'],w:Math.round(r.width),h:Math.round(r.height)});
       }
     }
   }
   return {theme:document.documentElement.dataset.theme,whiteSurfaces:list.slice(0,50),brightBorders:border.slice(0,45)};
 });
 const entry={route,scene,...data};
 report.routes.push(entry);report.summary.scenes++;
 report.summary.whiteSurfaces+=data.whiteSurfaces.length;
 report.summary.brightBorders+=data.brightBorders.length;
 if(data.theme!=='dark')report.summary.missingDark++;
 console.log('DARK_SCENE '+JSON.stringify({route,scene,theme:data.theme,white:data.whiteSurfaces.slice(0,15),border:data.brightBorders.slice(0,7)}));
 if(screenshotDir){
   fs.mkdirSync(screenshotDir,{recursive:true});
   const safe=(route+'-'+scene).replace(/[^a-z0-9_-]/gi,'-');
   await page.screenshot({path:path.join(screenshotDir,safe+'.png'),animations:'disabled'}).catch(()=>{});
 }
};
async function optional(page,label,selector){
 try{
   const item=page.locator(selector).first();
   if(!await item.isVisible({timeout:1000}))return false;
   await item.click({timeout:4500});
   await page.waitForTimeout(180);
   return true;
 }catch(error){report.summary.failedInteractions++;report.interactionFailures.push({label,error:error.message.slice(0,240)});console.log('OPTIONAL_INTERACTION_FAILED '+label+' '+error.message.slice(0,160));return false}
}
(async()=>{
 const driver={chromium,firefox,webkit}[engine]||chromium;
 const browser=await driver.launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 try{
  for(const viewport of sizes){
   for(const route of routes){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
    await context.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(new URL(route,base).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(route==='index.html'?2200:900);
    const scene=state=>take(page,route,viewport.name+'-'+state);
    await scene('initial');
    // The Account menu is shared by every page and can conceal white popovers.
    // Mobile sidebar is collapsed by default. Expand it through its real
    // control before inspecting Account, then close it to expose page actions.
    if(viewport.name==='mobile' && await optional(page,'Mobile navigation','#mobileMenu')){
      await scene('mobile-nav-open');
    }
    if(await optional(page,'Account','.nr-account-trigger')){
      await scene('account-open');
      await optional(page,'Close Account','.nr-account-trigger');
    }
    if(viewport.name==='mobile'){
      const menu=page.locator('#mobileMenu');
      if(await menu.count() && (await menu.getAttribute('aria-expanded'))==='true') await optional(page,'Close mobile navigation','#mobileMenu');
    }
    // Scroll into the middle/bottom of actual page and inspect visible boxes.
    await page.evaluate(()=>window.scrollTo(0,Math.max(0,document.documentElement.scrollHeight/2-window.innerHeight/2)));
    await page.waitForTimeout(160);await scene('middle-scroll');
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await page.waitForTimeout(160);await scene('bottom-scroll');
    if(route==='articles.html'){
      if(await optional(page,'New article','#newArticleBtn')){
        await scene('new-article-open');
        await optional(page,'Close new article menu','#newArticleBtn');
      }
      if(await optional(page,'Filter articles','#filterBtn')){
        await scene('filter-open');
        await optional(page,'Close article filters','#filterBtn');
      }
      if(await optional(page,'Article row menu','.article-menu-trigger'))await scene('article-action-open');
    } else if(route==='tags.html'){
      if(await optional(page,'Add tag','#addTagBtn'))await scene('tag-modal-open');
      if(await optional(page,'Close tag modal','#modalClose'))await scene('tag-modal-close');
      if(await optional(page,'Edit tag','.row-action.edit-tag'))await scene('tag-edit-modal-open');
    } else if(route==='index.html'){
      if(await optional(page,'SEO tab','.context [data-tab="seo"]'))await scene('seo-active');
      if(await optional(page,'Editorial tab','.context [data-tab="info"]'))await scene('editorial-active');
      if(await optional(page,'Review and Publish','#publishBtn'))await scene('review-modal');
      else if(viewport.name==='mobile'&&await page.locator('#publishBtn').count()){
        // Audit modal surface even if header action is currently obstructed.
        // The inaccessible real click remains an explicit QA failure.
        await page.locator('#publishBtn').evaluate(el=>el.click());
        await page.waitForTimeout(200);
        await scene('review-modal-programmatic');
      }
    }
    if(errors.length){report.routes.push({route,scene:viewport.name+'-page-errors',errors:errors.slice(0,5)})}
    await context.close();
   }
  }
 }finally{await browser.close()}
 const destination=process.env.NR_DARK_REPORT||'/tmp/newsroom-dark-mode-audit.json';
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.writeFileSync(destination,JSON.stringify(report,null,2)+'\n');
 console.log('DARK_REPORT '+destination);
 console.log('DARK_SUMMARY '+JSON.stringify(report.summary));
 if(report.summary.missingDark>0||report.summary.whiteSurfaces>0){
   if(process.env.NR_DARK_REPORT_ONLY==='1')console.log('REPORT ONLY: visual defects recorded; not failing audit');
   else process.exitCode=1;
 }
})().catch(error=>{console.error('DARK_AUDIT_ERROR',error.stack||error);process.exit(1)});