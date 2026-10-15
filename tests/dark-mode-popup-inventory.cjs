/* Popup and modal exhaustive Dark Mode CSS audit.
 * This test separately probes modal DOM, including hidden/legacy overlays,
 * and opens a handful through UI. It does NOT claim a hidden DOM probe
 * validates real click behavior. Tests only UI styling, no save or publish.
 */
const {chromium,firefox,webkit}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const driver=process.env.NR_BROWSER||'chromium';
const base=process.env.NR_BASE_URL||'http://127.0.0.1:8765/';
const reportPath=process.env.NR_POPUP_REPORT||'/tmp/newsroom-dark-popup-audit.json';
const report={commit:process.env.GITHUB_SHA||'local',base,engine:driver,
  time:new Date().toISOString(),modalResults:[],interactive:[],errors:[],
  summary:{probed:0,missing:0,white:0,brightBorders:0,clicked:0,clickFailed:0}};
const inventory={
  'index.html':[
   '#importModal','#reviewModal','#reviewPublishModal','#cropModal',
   '#altPreviewModal','#altValidationModal','#newsroomUnifiedImageModal',
   '#nrLinkOverlay','#imageLibraryPopup','#linkPopup','#transformPopup',
   '#aiPopup','#commentPopup','#typoPopup','#vidioPopup',
   '#altEditorialPopover','#altMarketplacePopover','#altInsertPopover',
   '#blockMenu','#writingViewMenu','#newsroomSiteMenu','#seoReview',
   '#tagSuggestions','#nrKeywordSuggestions',
   '.alt-category-tree-popover','.alt-category-popover',
   '.team-suggestions','.alt-entity-suggestions',
   '.alt-ai-tag-suggestions','#scheduleFields',
   '#nrReviewSchedule','.alt-insert-menu',
   '#v58CategoryEditorial','.alt-preview-controlbar'
  ],
  'tags.html':['#tagModal','.nr-modal-card','.nr-account-popover'],
  'articles.html':['.article-new-popover','.article-feature-menu','.article-row-menu',
    '.article-filter-panel','.article-simple-submenu','.article-action-submenu',
    '.article-new-option','.article-feature-option','.nr-account-popover'],
  'dashboard.html':['.nr-account-popover']
};
const white=v=>{
 const match=String(v||'').match(/rgba?\(([^)]+)\)/);
 if(!match)return false;
 const [r,g,b,a=1]=match[1].split(/[, /]+/).filter(Boolean).map(Number);
 return Number.isFinite(r)&&Math.min(r,g,b)>=218 &&
   Math.max(r,g,b)-Math.min(r,g,b)<19 && a>=.72;
};
async function inspect(page,route,viewport,selector){
 const state=await page.evaluate(({selector})=>{
   const candidates=[...document.querySelectorAll(selector)];
   const rgb=v=>{
    const m=String(v||'').match(/rgba?\(([^)]+)\)/);
    if(!m)return false;
    const [r,g,b,a=1]=m[1].split(/[, /]+/).filter(Boolean).map(Number);
    return Math.min(r,g,b)>=218&&Math.max(r,g,b)-Math.min(r,g,b)<19&&a>=.72;
   };
   if(!candidates.length)return {exists:false,white:[],borders:[]};
   const white=[],borders=[];
   const skip=node=>!!node.closest('svg,canvas,.l6-preview,.alt-preview-article,.figma-readpage-preview .l6-preview-site,[data-nr-dark-ignore]') ||
    ['SVG','IMG','VIDEO','IFRAME','CANVAS','PATH','OPTION'].includes(node.tagName);
   const sel=node=>node.tagName.toLowerCase()+(node.id?'#'+node.id:'')+
    (typeof node.className==='string'&&node.className.trim()?'.'+node.className.trim().split(/\s+/).slice(0,2).join('.'):'');
   for(const root of candidates){
    for(const node of [root,...root.querySelectorAll('*')]){
     if(skip(node))continue;
     const c=getComputedStyle(node);
     if(rgb(c.backgroundColor) && (node===root||node.matches('input,textarea,select,button,.popup-body,.popup-head,.popup-foot,.modal-card,.modal-body,.modal-head,.modal-foot,.menu-option,.suggestions,.tag-wrap,.field,.rewrite-option,.nr-link-dialog,.nr-modal-card,.v34-detail-panel,.v34-preview,.v34-card,.v61-upload-drop,.v62-field') || node.children.length>0)){
      white.push({selector:sel(node),background:c.backgroundColor});
     }
     for(const edge of ['Top','Bottom','Right','Left']){
      if(parseFloat(c['border'+edge+'Width'])>=1 && rgb(c['border'+edge+'Color']) &&
        node!==document.body) borders.push({selector:sel(node),edge,color:c['border'+edge+'Color']});
     }
    }
   }
   return {exists:true,instances:candidates.length,white:white.slice(0,25),borders:borders.slice(0,25)};
 },{selector});
 const row={route,viewport,selector,...state};
 report.modalResults.push(row);
 report.summary.probed++;
 if(!state.exists) report.summary.missing++;
 report.summary.white+=state.white.length;
 report.summary.brightBorders+=state.borders.length;
 if(state.white.length||state.borders.length)console.log('DARK_POPUP_DEFECT '+JSON.stringify(row).slice(0,2400));
}
async function click(page,route,viewport,name,selector){
 const row={route,viewport,name,selector,opened:false,programmatic:false};
 try{
  const loc=page.locator(selector).first();
  if(!await loc.count()){row.reason='absent';return}
  try{
   await loc.click({timeout:2700});
   row.opened=true;
   report.summary.clicked++;
  }catch(e){
   row.reason=String(e.message).slice(0,210);
   report.summary.clickFailed++;
   // Probe hard-to-reach legacy overlays without claiming the visible click
   // works. Distinct from the real interaction acceptance criteria.
   await loc.evaluate(el=>{if(typeof el.click==='function')el.click()}).catch(()=>{});
   row.programmatic=true;
  }
  await page.waitForTimeout(180);
 }finally{
  report.interactive.push(row);
  // Restore modal state for the next safe trigger. Never hit Save/Publish.
  await page.keyboard.press('Escape').catch(()=>{});
  await page.evaluate(()=>{
   document.querySelectorAll('.modal.open,.popup.open,.nr-modal-backdrop.open,#imageLibraryPopup.open,.alt-editorial-popover.open,.alt-marketplace-popover.open,.article-new-menu.open,.article-filter-panel.open,.article-feature-menu.open,.article-simple-sub.open,.article-action-sub.open').forEach(el=>el.classList.remove('open'));
   document.body.classList.remove('nr-review-scroll-lock','nr-preview-open','modal-open','nr-link-open');
   document.querySelector('#nrLinkOverlay')?.setAttribute('hidden','');
  }).catch(()=>{});
 }
}
(async()=>{
 const browser=await ({chromium,firefox,webkit}[driver]||chromium).launch({
  headless:true,args:driver==='chromium'?['--no-sandbox']:[]
 });
 try{
  for(const viewport of [{label:'desktop',width:1440,height:900},{label:'mobile',width:390,height:844}]){
   for(const route of Object.keys(inventory)){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height}});
    await context.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
    const page=await context.newPage();
    page.on('pageerror',e=>report.errors.push({route,viewport:viewport.label,error:e.message.slice(0,200)}));
    await page.goto(new URL(route,base).href,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(route==='index.html'?2300:800);
    if(route==='index.html'){
     await click(page,route,viewport.label,'Article preview','#previewBtn');
     await click(page,route,viewport.label,'Review Publish','#publishBtn');
     await click(page,route,viewport.label,'Image gallery','#chooseHeadline');
     await click(page,route,viewport.label,'Import Draft','#railImport');
     await click(page,route,viewport.label,'Writing View','.writing-view-trigger');
     await click(page,route,viewport.label,'Site selection','.newsroom-site-trigger');
     await click(page,route,viewport.label,'SEO tab','[data-tab="seo"]');
     await click(page,route,viewport.label,'Editorial tab','[data-tab="info"]');
    } else if(route==='articles.html'){
     await click(page,route,viewport.label,'New Article','#newArticleBtn');
     await click(page,route,viewport.label,'Filter','#filterBtn');
     await click(page,route,viewport.label,'Article contextual','.article-menu-trigger');
    } else if(route==='tags.html'){
     await click(page,route,viewport.label,'Add Tag','#addTagBtn');
     await click(page,route,viewport.label,'Close Tag','#modalClose');
     await click(page,route,viewport.label,'Edit Tag','.row-action.edit-tag');
    }
    // The Unified Image modal does not mount until a picture is chosen.
    // Exercise the real editor entrypoint with a synthetic 1px image, never Save.
    if(route==='index.html'){
      const mounted=await page.evaluate(()=>{
        if(typeof window.newsroomOpenUnifiedImageEditor!=='function')return false;
        const tiny='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/MwAAAABJRU5ErkJggg==';
        try{
          window.newsroomOpenUnifiedImageEditor({
            id:'qa-synthetic-image',source:'qa',fileName:'qa.png',
            title:'QA synthetic image',url:tiny,photographer:'',
            photoSource:'',shortDesc:'',watermark:'none'
          },{type:'headline'});
          return !!document.getElementById('newsroomUnifiedImageModal');
        }catch(error){return false}
      });
      report.interactive.push({route,viewport:viewport.label,name:'Unified Image Editor synthetic open',opened:mounted,programmatic:true});
      if(mounted)await page.waitForTimeout(120);
    }
    for(const selector of inventory[route])await inspect(page,route,viewport.label,selector);
    await context.close();
   }
  }
 }finally{await browser.close()}
 fs.mkdirSync(path.dirname(reportPath),{recursive:true});
 fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
 console.log('POPUP_AUDIT_SUMMARY '+JSON.stringify(report.summary));
 console.log('POPUP_MISSING '+JSON.stringify([...new Set(report.modalResults.filter(x=>!x.exists).map(x=>x.selector))]));
 console.log('POPUP_INTERACTION_FAIL '+JSON.stringify(report.interactive.filter(x=>!x.opened).map(x=>({name:x.name,route:x.route,viewport:x.viewport,reason:x.reason})).slice(0,25)));
 if(report.summary.white||report.summary.brightBorders)process.exitCode=1;
})().catch(e=>{console.error('DARK_POPUP_FATAL',e.stack||e);process.exit(1)});
