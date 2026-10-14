/* Read-only broad audit of Dark Mode surfaces. Captures computed colors, not just token definitions. */
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:960}});
const states=[];
await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('.nr-account-trigger').waitFor({state:'visible',timeout:25000});
await page.waitForTimeout(1500);
async function inspect(label){
 const result=await page.evaluate(()=>{
  let all=[...document.querySelectorAll('body *')], candidates=[],scanned=0;
  for(const el of all){
   const c=getComputedStyle(el),r=el.getBoundingClientRect();
   if(r.width<12||r.height<8||r.width*r.height<190||c.visibility==='hidden'||c.display==='none'||Number(c.opacity)<.05)continue;
   if(!el.getClientRects().length||el.closest('template,[hidden],[aria-hidden="true"]'))continue;
   const rgb=(c.backgroundColor.match(/[0-9.]+/g)||[]).map(Number);
   if(rgb.length<3 || (rgb.length>=4 && rgb[3]<.75))continue;
   if(Math.min(...rgb.slice(0,3))<217)continue;
   const tag=el.tagName.toLowerCase(),cls=typeof el.className==='string'?el.className.replace(/\s+/g,'.').slice(0,90):'';
   const parent=el.parentElement;
   const pa=parent?parent.tagName.toLowerCase()+(parent.id?'#'+parent.id:'')+(typeof parent.className==='string'?'.'+parent.className.split(/\s+/).slice(0,2).join('.'):''):'';
   const id=el.id?'#'+el.id:'';
   const key=tag+id+'.'+cls;
   candidates.push({key,par:pa,bg:c.backgroundColor,text:c.color,xy:[Math.round(r.x),Math.round(r.y)],wh:[Math.round(r.width),Math.round(r.height)],textPreview:(el.innerText||'').trim().slice(0,40)});
   scanned++;
  }
  candidates.sort((a,b)=>b.wh[0]*b.wh[1]-a.wh[0]*a.wh[1]);
  return {count:candidates.length,samples:candidates.slice(0,85)};
 });
 states.push({label,...result});
}
await inspect('EDITOR INITIAL');
const click=async(selector)=>{const p=page.locator(selector).first();if(await p.count()&&await p.isVisible()){await p.click({timeout:5500});await page.waitForTimeout(180);return true}return false};
await click('#publishBtn');await inspect('REVIEW AND PUBLISH');
await click('#altValidationClose');
await click('.nr-account-trigger');await inspect('USER MENU');await click('.nr-account-trigger');
await click('.alt-category-tree-trigger');await inspect('CATEGORY TREE');await page.keyboard.press('Escape');
await click('#uploadHeadline');await inspect('HEADLINE IMAGE PICKER');
await click('#imageLibraryPopup .v34-close');
await click('#imageLibraryPopup [aria-label="Close"]');
await page.keyboard.press('Escape');
await click('#linkTool');await inspect('INSERT LINK MODAL');await page.keyboard.press('Escape');
await click('#altEditorialTagsSection .alt-tag-ai');await inspect('TAGS AI');
const dynamic=await page.evaluate(()=>{
 let holder=document.querySelector('.alt-writing-card')||document.body;
 const x=document.createElement('div');x.className='alt-content-card';x.setAttribute('data-type','text');
 x.innerHTML='<div class="alt-content-card-head">Header</div><div class="alt-content-card-body"><div class="alt-mini-toolbar"><button>Bold</button></div><div class="alt-mini-editor" contenteditable="true">Tulis paragraf</div></div><div class="alt-content-card-foot">Footer</div>';
 holder.appendChild(x);return true;
});
if(dynamic)await inspect('DYNAMIC TEXT CARD');
for(const route of ['dashboard.html','articles.html','tags.html']){
 await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForTimeout(260);
 await inspect('PAGE '+route);
}
for(const state of states) console.log('AUDIT_WHITE_SURFACES '+JSON.stringify(state));
await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
