/* Regression guard: compare approved Main Light Mode against candidate Light Mode.
 * Test visual pixels and computed geometry/colors on both origins.
 * Existing UI must remain equivalent aside from the hidden Appearance menu.
 */
const {chromium}=require('playwright');
const {PNG}=require('pngjs');
const pixelmatch=require('pixelmatch');
const assert=require('node:assert/strict');
const routes={
  'index.html':['body','.topbar','#cmsNavDrawer','.workspace','.paper','.alt-writing-card','.headline','#title','#dek','.editor-field-name','.context','#nrRightPanelToggle','#publishBtn'],
  'dashboard.html':['body','.nr-topbar','.nr-sidebar','.nr-global-brand','.nr-page','.nr-panel'],
  'articles.html':['body','.nr-topbar','.nr-sidebar','.nr-global-brand','.nr-page','.nr-panel','.nr-nav-item.active'],
  'tags.html':['body','.nr-topbar','.nr-sidebar','.nr-global-brand','.nr-page','.nr-panel']
};
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:900},colorScheme:'light'});
    const baseline=await context.newPage(),candidate=await context.newPage();
    for(const [route,selectors] of Object.entries(routes)){
      await baseline.goto('http://127.0.0.1:8766/'+route,{waitUntil:'domcontentloaded',timeout:45000});
      await candidate.goto('http://127.0.0.1:8765/'+route,{waitUntil:'domcontentloaded',timeout:45000});
      await Promise.all([baseline.evaluate(()=>document.fonts.ready),candidate.evaluate(()=>document.fonts.ready)]);
      await baseline.waitForTimeout(650);
      await candidate.waitForTimeout(650);
      assert.equal(await candidate.evaluate(()=>document.documentElement.dataset.theme),'light');
      // Snapshot layout and CSS *without interacting with profile menu*.
      const snap=async(page)=>page.evaluate(sels=>Object.fromEntries(sels.map(s=>{
        const e=document.querySelector(s);if(!e)return [s,null];
        const st=getComputedStyle(e),r=e.getBoundingClientRect();
        return [s,{x:r.x,y:r.y,w:r.width,h:r.height,background:st.backgroundColor,color:st.color,
          border:st.borderTopColor,font:st.fontSize,lineHeight:st.lineHeight,padding:st.padding,display:st.display}];
      })),selectors);
      const a=await snap(baseline),b=await snap(candidate);
      for(const s of selectors){
        assert.deepEqual(b[s],a[s],`Light Mode geometry/style regression ${route}@${width} ${s}`);
      }
      // Exclude intermittent visitor-side media and cursor focus from screenshots.
      await baseline.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
      await candidate.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}'});
      const imgA=PNG.sync.read(await baseline.screenshot({animations:'disabled'}));
      const imgB=PNG.sync.read(await candidate.screenshot({animations:'disabled'}));
      assert.equal(imgA.width,imgB.width);assert.equal(imgA.height,imgB.height);
      const diff=pixelmatch(imgA.data,imgB.data,null,imgA.width,imgA.height,{threshold:.15,includeAA:false});
      const percent=100*diff/(imgA.width*imgA.height);
      console.log(`LIGHT BASELINE ${route}@${width}: ${percent.toFixed(3)}% pixel changes, ${selectors.length} style/geometry selectors exact`);
      // Dynamic metadata and icon loading can differ slightly. Strong style/geometry assertions above remain exact.
      assert(percent<2.0,`Visual Light Mode regression ${route}@${width} (${percent.toFixed(3)}%)`);
    }
    await context.close();
  }
  await browser.close();
  console.log('PASS: Light Mode regression across Editor, Dashboard, Articles, Tags at desktop and mobile');
})().catch(e=>{console.error(e);process.exit(1)});
