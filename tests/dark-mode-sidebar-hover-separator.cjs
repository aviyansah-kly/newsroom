/* Screenshot regression: sidebar dark hover and Short Desc → content divider.
 * Verifies real rendered selectors across Chromium, Firefox, WebKit.
 * No draft edits, no backend writes, no design geometry modifications.
 */
const {chromium,firefox,webkit}=require('playwright');
const assert=require('node:assert/strict');
const engine=process.env.NR_BROWSER||'chromium';
const base=process.env.NR_BASE||'http://127.0.0.1:8765/';
const driver={chromium,firefox,webkit}[engine]||chromium;
(async()=>{
 const browser=await driver.launch({headless:true,args:engine==='chromium'?['--no-sandbox']:[]});
 const context=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'light'});
 await context.addInitScript(()=>localStorage.setItem('newsroom:appearance','dark'));
 const page=await context.newPage();
 const problems=[];
 page.on('pageerror',e=>problems.push(e.message));
 await page.goto(base+'index.html',{waitUntil:'domcontentloaded',timeout:60000});
 const target=page.locator('#cmsNavDrawer .cms-nav-item[data-cms-item="Video Galleries"]').first();
 await target.waitFor({state:'visible',timeout:25000});
 await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
 const inspect=async(loc)=>{
  return loc.evaluate(el=>{
   const c=getComputedStyle(el),svg=el.querySelector('svg'),span=el.querySelector('span');
   const color=x=>x?getComputedStyle(x).color:null;
   return {background:c.backgroundColor,text:c.color,svg:color(svg),label:color(span),
     className:el.className,focus:getComputedStyle(el).outlineColor};
  });
 };
 const normal=await inspect(target);
 await target.hover();
 await page.waitForTimeout(100);
 const hover=await inspect(target);
 console.log('DARK_SIDEBAR_HOVER '+JSON.stringify({normal,hover}));
 assert.equal(hover.background,'rgb(57, 66, 77)','Video Galleries hover surface uses Dark semantic hover token');
 assert.equal(hover.text,'rgb(232, 235, 239)','Sidebar hover label stays readable');
 assert.equal(hover.label,hover.text,'Nested label inherits hover text');
 if(hover.svg)assert.equal(hover.svg,hover.text,'Sidebar hover icon inherits hover text');
 const active=page.locator('#cmsNavDrawer .cms-nav-item.active').first();
 if(await active.count()){
  const c=await inspect(active);
  console.log('DARK_SIDEBAR_ACTIVE '+JSON.stringify(c));
  assert.equal(c.background,'rgb(27, 49, 75)','Active blue selection retained');
 }
 // Compare actual separator pseudo-element, not ordinary section border.
 const sep=await page.evaluate(()=>{
  const el=document.querySelector('.alt-writing-card .alt-editor-section');
  if(!el) return {exists:false};
  const elStyle=getComputedStyle(el),before=getComputedStyle(el,'::before');
  return {exists:true,bg:before.backgroundColor,height:before.height,content:before.content,
    borderTop:elStyle.borderTopColor,borderBottom:elStyle.borderBottomColor};
 });
 console.log('DARK_SHORTDESC_SEPARATOR '+JSON.stringify(sep));
 assert(sep.exists,'Actual content section exists');
 assert.equal(sep.bg,'rgb(48, 54, 62)','Short Desc separator is the low-contrast #30363E hairline');
 assert.equal(sep.height,'1px','No line-thickness/layout change');
 // Shared sidebar should match on non-editor routes.
 await page.goto(base+'articles.html',{waitUntil:'domcontentloaded',timeout:45000});
 const standard=page.locator('.nr-sidebar .nr-nav-item[data-item="Video Galleries"]').first();
 await standard.waitFor({state:'visible',timeout:25000});
 await standard.hover();
 const standardHover=await inspect(standard);
 console.log('DARK_SHARED_SIDEBAR_HOVER '+JSON.stringify(standardHover));
 assert.equal(standardHover.background,'rgb(57, 66, 77)','Shared nav hover is semantic dark');
 assert.equal(standardHover.text,'rgb(232, 235, 239)','Shared nav hover label is readable');
 assert.equal(problems.length,0,'No page errors on editor or article list');
 await browser.close();
 console.log('PASS: Dark sidebar hover text/icon, active selection and Short Desc pseudo-divider ['+engine+']');
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
