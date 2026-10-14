/* V2.3 Editor visual hierarchy regression: validates computed UI after render,
   no stored content writes and no layout or typography changes. */
const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browserName=process.env.NR_BROWSER||'chromium';
const browser=await ({chromium,firefox,webkit}[browserName]||chromium).launch({headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
const page=await browser.newPage({viewport:{width:1440,height:950}});
await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
await page.locator('#publishBtn').waitFor({state:'visible',timeout:30000});
await page.waitForTimeout(700);
const result=await page.evaluate(()=>{
 const color=el=>{const s=getComputedStyle(el);return {bg:s.backgroundColor,fg:s.color,border:s.borderTopColor,bottom:s.borderBottomColor,shadow:s.boxShadow}};
 const tabs=[...document.querySelectorAll('.context .tabs.article-tabs-promoted button.tab')].map(x=>({active:x.classList.contains('active'),...color(x)}));
 const owner=document.querySelector('.alt-writing-card');
 const create=(type,body)=>{
   const el=document.createElement('section');el.className='alt-content-card';el.dataset.type=type;
   el.innerHTML='<div class="alt-content-card-head"><span class="alt-content-card-title">Block '+type+'</span><small class="alt-content-card-meta">Content block</small></div><div class="alt-content-card-body">'+body+'</div><div class="alt-content-card-foot"><small>Siap diedit</small></div>';
   owner.appendChild(el);
   const sample=q=>el.querySelector(q)?color(el.querySelector(q)):null;
   const output={type,card:color(el),heading:sample('.alt-content-card-title'),subheading:sample('.alt-content-card-meta'),head:sample('.alt-content-card-head'),body:sample('.alt-content-card-body'),foot:sample('.alt-content-card-foot'),preview:sample('.alt-media-drop,.alt-media-preview-card,.alt-standings-card'),previewTitle:sample('.alt-media-drop strong,.alt-media-preview-card strong,.alt-standings-card strong')};
   el.remove();return output;
 };
 const cards=[
  create('text','<div class="alt-mini-toolbar"><button>Bold</button></div><div class="alt-mini-editor" contenteditable="true">Body text</div>'),
  create('image','<div class="alt-media-drop"><strong>Tambahkan Image</strong><span>Pilih image dari galeri</span></div>'),
  create('video','<div class="alt-media-preview-card"><strong>Preview video</strong></div>'),
  create('standings','<div class="alt-standings-card"><strong>Pilih Liga</strong></div>'),
 ];
 const div=getComputedStyle(document.documentElement);
 return {tabs,cards,tokens:Object.fromEntries(['--nr-ui-decorative-divider','--nr-ui-card-border','--nr-ui-block-surface','--nr-ui-block-title'].map(x=>[x,div.getPropertyValue(x).trim()]))};
});
console.log('V23_VISUAL_HIERARCHY '+JSON.stringify(result));
assert.equal(result.tokens['--nr-ui-decorative-divider'],'#30363E');
assert.equal(result.tokens['--nr-ui-card-border'],'#465260');
assert.equal(result.tabs.filter(x=>x.active).length,1);
for(const x of result.tabs){if(x.active){assert.equal(x.bg,'rgb(48, 72, 98)');assert.equal(x.shadow,'none','Active tab needs no underline');}else{assert.equal(x.fg,'rgb(194, 203, 214)')}}
for(const block of result.cards){
 assert.equal(block.card.bg,'rgb(44, 51, 59)',block.type+' must stand out from parent canvas');
 assert.equal(block.card.border,'rgb(70, 82, 96)',block.type+' card border');
 assert.equal(block.heading.fg,'rgb(225, 232, 241)',block.type+' heading legibility');
 assert.equal(block.head.bottom,'rgb(48, 54, 62)',block.type+' soft header separator');
 assert.equal(block.foot.border,'rgb(48, 54, 62)',block.type+' soft footer separator');
 if(block.preview){assert.equal(block.preview.bg,'rgb(43, 48, 55)');assert.equal(block.preview.border,'rgb(70, 82, 96)');}
 if(block.previewTitle)assert.equal(block.previewTitle.fg,'rgb(225, 232, 241)');
}
console.log('PASS V23: distinct editor cards, soft separators, clear labels, filled tabs without underline ['+browserName+']');
await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
