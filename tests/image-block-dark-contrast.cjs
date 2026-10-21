/* Verify image block appearance with exact runtime DOM shape in both themes. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const theme of ['dark','light']){
   const page=await browser.newPage();
   await page.addInitScript(value=>localStorage.setItem('newsroom:appearance',value),theme);
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForTimeout(400);
   const actual=await page.evaluate(()=>{
    const body=document.querySelector('.alt-writing-card')||document.body;
    const card=document.createElement('article');
    card.className='alt-content-card';card.dataset.type='image';
    card.innerHTML='<div class="alt-content-card-body"><div class="v34-image-empty v56-image-empty newsroom-image-empty"><div class="newsroom-image-empty-copy"><strong>Tambahkan Image</strong><span>Pilih image dari gallery atau upload file dari perangkat.</span></div><div class="newsroom-image-empty-actions"><button class="newsroom-image-upload-btn"><span>Upload Image</span></button></div></div></div>';
    body.appendChild(card);
    const sel=s=>getComputedStyle(card.querySelector(s));
    const result={theme:document.documentElement.dataset.theme,title:sel('.newsroom-image-empty-copy strong').color,desc:sel('.newsroom-image-empty-copy span').color,buttonBg:sel('.newsroom-image-upload-btn').backgroundColor,buttonColor:sel('.newsroom-image-upload-btn').color};
    card.remove();return result;
   });
   console.log('IMAGE_BLOCK_CONTRAST '+JSON.stringify(actual));
   if(theme==='dark'){
    assert.equal(actual.title,'rgb(232, 235, 239)','Image title must match Headline Image dark text');
    assert.equal(actual.desc,'rgb(187, 195, 205)','Image description must use secondary dark text');
    assert.notEqual(actual.buttonBg,'rgb(255, 255, 255)','Upload button must not be white');
    assert.equal(actual.buttonColor,'rgb(232, 235, 239)');
   }
   await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
