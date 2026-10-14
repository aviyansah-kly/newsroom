/* Contract for dynamic Text, Video, Image, Embed, Klasemen and Page Break in Dark Mode. */
const assert=require('node:assert/strict');
const {chromium,firefox,webkit}=require('playwright');
(async()=>{
 const driver=process.env.NR_BROWSER||'chromium';
 const browser=await ({chromium,firefox,webkit}[driver]||chromium).launch({headless:true,args:driver==='chromium'?['--no-sandbox']:[]});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#publishBtn').waitFor({state:'visible',timeout:30000});
 await page.waitForTimeout(800);
 const result=await page.evaluate(()=>{
   const sample=e=>{let s=getComputedStyle(e);return {bg:s.backgroundColor,fg:s.color,bt:s.borderTopColor,bb:s.borderBottomColor,bl:s.borderLeftColor,shadow:s.boxShadow}};
   const textContrast=(fg,bg)=>{const rgb=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number);const L=v=>rgb(v).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);const a=L(fg),b=L(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
   const tabs=[...document.querySelectorAll('.context .tabs.article-tabs-promoted button.tab')].map(e=>({class:e.className,...sample(e),label:sample(e.querySelector('.alt-tab-label')||e)}));
   const owner=document.querySelector('.alt-writing-card')||document.body;
   const cards=[];
   const parts=[
     ['text','<div class="classic-toolbar"><button>Bold</button><span class="toolbar-sep"></span><button class="active">Italic</button></div><div id="tiptap-editor"><div class="tiptap-editor" contenteditable="true">Contoh artikel</div></div><div class="alt-mini-toolbar"><button>Text</button></div><div class="alt-mini-editor" contenteditable="true">Contoh teks</div>'],
     ['video','<div class="alt-card-field"><label>Video URL</label><input placeholder="Video URL"></div><div class="alt-media-side-preview"><div class="alt-preview-empty-state"><span>Preview video tampil di sini</span></div></div>'],
     ['image','<div class="alt-media-drop"><strong>Tambahkan Image</strong><span>Pilih image dari gallery</span><button class="btn">Upload Image</button></div>'],
     ['embed','<div class="alt-card-field"><label>Embed URL / Iframe</label><textarea placeholder="URL HTTPS"></textarea></div><div class="alt-media-preview-card"><span>Preview embed tampil di sini</span></div>'],
     ['standings','<div class="alt-standings-card"><span class="alt-standings-icon">♜</span><div class="alt-standings-field"><label>Pilih Liga</label><select class="alt-standings-select"><option>Liga 1</option></select></div></div>'],
     ['page','<div class="alt-page-card"><span class="alt-page-badge">Page Break</span><span class="alt-page-line"></span></div>']
   ];
   for(const [kind,markup] of parts){
     let node=document.createElement('section');node.className='alt-content-card';node.dataset.type=kind;
     node.innerHTML='<div class="alt-content-card-head"><button class="alt-card-control">Block '+kind+'</button></div><div class="alt-content-card-body">'+markup+'</div><div class="alt-content-card-foot">Status</div>';
     owner.appendChild(node);
     let pick=selector=>node.querySelector(selector)?sample(node.querySelector(selector)):null;
     cards.push({kind,card:sample(node),head:pick('.alt-content-card-head'),body:pick('.alt-content-card-body'),foot:pick('.alt-content-card-foot'),toolbar:pick('.classic-toolbar'),toolbarButton:pick('.classic-toolbar button'),activeButton:pick('.classic-toolbar button.active'),toolbarRule:pick('.toolbar-sep'),miniToolbar:pick('.alt-mini-toolbar'),miniButton:pick('.alt-mini-toolbar button'),videoPreview:pick('.alt-media-side-preview'),mediaDrop:pick('.alt-media-drop'),mediaButton:pick('.alt-media-drop button'),standings:pick('.alt-standings-card'),page:pick('.alt-page-card'),pageLine:pick('.alt-page-line')});
     node.remove();
   }
   let tabContrast=tabs.map(t=>({class:t.class,ratio:textContrast(t.label.fg,t.bg.startsWith('rgba(')?'rgb(34,38,44)':t.bg)}));
   return {tabs,tabContrast,cards};
 });
 console.log('EDITOR_EXPANDED_THEME_AUDIT',JSON.stringify(result));
 assert(result.tabs.length>=2,'Editorial and SEO tabs must exist');
 for(const t of result.tabContrast)assert(t.ratio>=4.5,'Tab contrast must be readable: '+JSON.stringify(t));
 for(const block of result.cards){
  assert.equal(block.card.bg,'rgb(44, 51, 59)',block.kind+' card uses differentiated graphite surface');
  assert.equal(block.head.bb,'rgb(52, 58, 66)',block.kind+' head quiet separator');
  assert.equal(block.foot.bt,'rgb(52, 58, 66)',block.kind+' footer quiet separator');
 }
 const text=result.cards.find(c=>c.kind==='text');
 for(const key of ['toolbar','miniToolbar'])assert.equal(text[key].bg,'rgb(43, 48, 55)',key+' dark toolbar');
 for(const key of ['toolbarButton','miniButton'])assert.equal(text[key].fg,'rgb(187, 195, 205)',key+' readable neutral control');
 assert.equal(text.toolbarRule.bg,'rgb(52, 58, 66)','Formatting separator is soft');
 assert.equal(result.cards.find(c=>c.kind==='video').videoPreview.bg,'rgb(43, 48, 55)');
 assert.equal(result.cards.find(c=>c.kind==='image').mediaDrop.bg,'rgb(43, 48, 55)');
 assert.equal(result.cards.find(c=>c.kind==='embed').videoPreview,null);
 assert.equal(result.cards.find(c=>c.kind==='standings').standings.bg,'rgb(43, 48, 55)');
 assert.equal(result.cards.find(c=>c.kind==='page').pageLine.bg,'rgb(52, 58, 66)');
 console.log('PASS: '+driver+' editorial tabs and six content types follow canonical dark theme');
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
