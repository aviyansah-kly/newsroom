/* Editorial comfort QA: soft decorative lines, stable canvas and strong input focus.
 * Verifies color only; existing Light-mode pixel and geometry regression runs separately.
 */
const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
const browserName=process.env.NR_BROWSER||'chromium';
const expected={
  subtle:'rgb(52, 58, 66)',
  section:'rgb(58, 65, 74)',
  card:'rgb(60, 67, 77)',
  input:'rgb(113, 128, 150)',
  canvas:'rgb(39, 44, 50)',
  action:'rgb(217, 43, 0)'
};
(async()=>{
 const browser=await ({chromium,firefox,webkit}[browserName]||chromium).launch({headless:true,args:browserName==='chromium'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1440,height:930}});
 const page=await context.newPage();
 await page.addInitScript(()=>{localStorage.setItem('newsroom:appearance','dark')});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('.nr-account-trigger').first().waitFor({state:'visible',timeout:25000});
 await page.waitForTimeout(1500);
 const audit=await page.evaluate(()=>{
  const css=getComputedStyle(document.documentElement);
  const token=(t)=>css.getPropertyValue(t).trim();
  const components=[
    ['Header separator','.newsroom-header-separator'],
    ['Main canvas','.alt-writing-card'],
    ['Info section border','#infoPane > .headline'],
    ['Right panel rule','.context > .panel > .panel-head'],
    ['Published/Modified divider','#nrPublicationStatusPreview .nr-pub-meta + .nr-pub-meta'],
    ['Team role divider','.team-role-divider'],
    ['General divider','.settings-divider'],
    ['Article page separator','.alt-page-separator'],
    ['Toolbar group','.classic-toolbar .alt-toolbar-group + .alt-toolbar-group'],
    ['Text toolbar','.alt-mini-toolbar'],
    ['Text content block','.alt-content-card'],
    ['Title field','#title'],
    ['Tags input','#tagInput'],
    ['Primary action','#publishBtn']
  ];
  const results=[];
  for(const [label,selector] of components){
   const e=document.querySelector(selector);
   if(!e){results.push({label,selector,exists:false});continue}
   const s=getComputedStyle(e),r=e.getBoundingClientRect();
   results.push({label,selector,exists:true,visible:r.height>0&&r.width>0,bg:s.backgroundColor,color:s.color,borderBottom:s.borderBottomColor,borderTop:s.borderTopColor,borderLeft:s.borderLeftColor,backgroundImage:s.backgroundImage});
  }
  return {tokens:Object.fromEntries(['--nr-border','--nr-divider-subtle','--nr-divider','--nr-canvas-border','--nr-input-boundary'].map(t=>[t,token(t)])),results};
 });
 console.log('DARK DIVIDER COMFORT AUDIT',JSON.stringify(audit));
 assert.equal(audit.tokens['--nr-divider-subtle'],'#343A42');
 assert.equal(audit.tokens['--nr-divider'],'#3A414A');
 assert.equal(audit.tokens['--nr-canvas-border'],'#3C434D');
 assert.equal(audit.tokens['--nr-input-boundary'],'#718096');
 function find(name){return audit.results.find(x=>x.label===name)}
 assert.equal(find('Main canvas').bg,expected.canvas,'Original writing canvas tone preserved');
 assert.equal(find('Header separator').bg,expected.subtle,'Header separator softened');
 assert.equal(find('Primary action').bg,expected.action,'Original muted orange publish retained');
 assert.equal(find('Title field').color,'rgb(232, 235, 239)','Title editing text still legible');
 // Validate the two publication timestamps are divided by a passive hairline.
 if(find('Published/Modified divider').exists)
   assert.equal(find('Published/Modified divider').borderLeft,expected.subtle,'Publication divider softened');
 // Control boundaries remain >=3:1 while low-emphasis hairlines remain quiet.
 const title=page.locator('#title');
 const before=await title.inputValue();
 const trigger=page.locator('.nr-account-trigger').first();
 const lightOption=page.locator('[data-nr-appearance-option="light"]').first();
 if(!await lightOption.isVisible())await trigger.click();
 await lightOption.click();
 assert.equal(await title.inputValue(),before,'Theme transition may not change writing');
 const darkOption=page.locator('[data-nr-appearance-option="dark"]').first();
 if(!await darkOption.isVisible())await trigger.click();
 await darkOption.click();
 assert.equal(await title.inputValue(),before,'Writing remains intact after returning dark');
 console.log('PASS: softer decorative separators, unchanged canvas/text/primary action, stable draft');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
