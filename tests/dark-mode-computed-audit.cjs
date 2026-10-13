const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:950}});
await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
const names=[
 ['App','body'],['Editor Header','.topbar'],['Editor Sidebar','#cmsNavDrawer'],['Editor Workspace','.workspace'],
 ['Writing Paper','.paper'],['Writing Card','.alt-writing-card'],['Writing Section','.alt-editor-section'],
 ['Headline Section','.headline'],['Editor Title','#title'],['Editor Dek','#dek'],
 ['Editor Field Label','.editor-field-name'],['Article Settings','.context'],['Editorial Pane','#infoPane'],
 ['SEO Pane','#seoPane'],['Tags Section','#altEditorialTagsSection'],['Publication Status','#nrPublicationStatusPreview'],
 ['Primary Publish','#publishBtn'],['Sidebar Account','.nr-account-trigger'],
 ['Account Popover','.nr-account-popover'],['AI Action','.nr-ai-field-action'],
 ['Review Modal','#altValidationModal'],['Review Card','#altValidationModal .alt-validation-card'],
 ['Review Summary','#altValidationModal .alt-validation-summary'],
 ['Navigation Menu','.cms-nav-item'],
 ['Right Toggle','#nrRightPanelToggle'],
 ['Link Dialog','.nr-link-dialog'],
];
const arr=[];const errs=[];page.on('pageerror',e=>errs.push(e.message));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.nr-account-trigger').first().waitFor({timeout:30000});
await page.waitForTimeout(1900);
for(const [label,selector] of names){
  const snap=await page.evaluate(({selector})=>{
    const el=document.querySelector(selector);if(!el)return {exists:false};
    const c=getComputedStyle(el),r=el.getBoundingClientRect();
    return {exists:true,visible:r.width>0&&r.height>0&&c.display!=='none'&&c.visibility!=='hidden',
      bg:c.backgroundColor,fg:c.color,border:c.borderTopColor,outline:c.outlineColor,
      font:c.fontSize,weight:c.fontWeight,sample:(el.textContent||'').trim().slice(0,38)};
  },{selector});arr.push({label,selector,...snap});
}
const btn=await page.locator('#publishBtn');if(await btn.isVisible())await btn.click({timeout:12000});
await page.waitForTimeout(300);
for(const [label,selector] of names.filter(x=>x[0].startsWith('Review'))){
 const snap=await page.evaluate(({selector})=>{
  const el=document.querySelector(selector);if(!el)return null;const c=getComputedStyle(el),r=el.getBoundingClientRect();return {display:c.display,visible:r.width>0&&r.height>0,bg:c.backgroundColor,fg:c.color,border:c.borderTopColor};
 },{selector});arr.push({label:label+' (OPEN)',selector,...snap});
}
console.log('EDITOR DARK COMPUTED AUDIT',JSON.stringify(arr));

const white=await page.evaluate(()=>{
  const selectors=new Map();
  document.querySelectorAll('body *').forEach(el=>{
    const c=getComputedStyle(el),rect=el.getBoundingClientRect();
    if(c.display==='none'||c.visibility==='hidden'||rect.width<65||rect.height<18||rect.top>1200||rect.bottom<0)return;
    const match=c.backgroundColor.match(/[0-9]+/g);
    if(!match)return;
    const col=match.slice(0,3).map(Number);
    if(Math.min(...col)<220)return;
    const id=el.id?'#'+el.id:'';
    const cls=typeof el.className==='string'?el.className.split(' ').slice(0,3).join('.'):'';
    const key=el.tagName.toLowerCase()+id+(cls?'.'+cls:'');
    selectors.set(key,(selectors.get(key)||0)+1);
  });
  return [...selectors].sort((a,b)=>b[1]-a[1]).slice(0,75);
});
console.log('VISIBLE LIGHT ISLANDS',JSON.stringify(white));
console.log('JS ERRORS',JSON.stringify(errs.slice(0,8)));
for(const route of ['dashboard.html','articles.html','tags.html']){
  await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.nr-account-trigger').first().waitFor({timeout:15000});
  await page.waitForTimeout(150);
  const r=await page.evaluate(()=>{
    const selectors=['body','.nr-topbar','.nr-sidebar','.nr-page','.nr-panel','.nr-card','.nr-global-brand','.nr-nav-item.active'];
    return selectors.map(s=>{const e=document.querySelector(s);if(!e)return null;let c=getComputedStyle(e);return {selector:s,bg:c.backgroundColor,fg:c.color}}).filter(Boolean);
  }); console.log('ROUTE '+route,JSON.stringify(r));
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
