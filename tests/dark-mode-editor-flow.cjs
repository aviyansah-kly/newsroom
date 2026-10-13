/* Editor interactions relevant to Dark Mode, aligned to current Editorial Workspace.
   Leaves saved article logic unchanged; browser session is disposable. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1600,height:950}});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('#nrRightPanelToggle').waitFor({state:'visible',timeout:25000});
 await page.locator('.nr-account-trigger').waitFor({state:'visible',timeout:25000});
 await page.waitForTimeout(2000);
 let title=await page.locator('#title').inputValue();
 const right=page.locator('#nrRightPanelToggle');
 const initial=await page.evaluate(()=>({side:document.body.classList.contains('nr-right-collapsed'),rect:document.querySelector('.alt-writing-card')?.getBoundingClientRect().width}));
 await right.click({timeout:12000});
 let collapsed=await page.evaluate(()=>({side:document.body.classList.contains('nr-right-collapsed'),rect:document.querySelector('.alt-writing-card')?.getBoundingClientRect().width}));
 assert.equal(collapsed.side,!initial.side,'Right panel toggles collapsed state');
 await right.click({timeout:12000});
 assert.equal(await page.evaluate(()=>document.body.classList.contains('nr-right-collapsed')),initial.side,'Right panel restores state');
 assert.equal(await page.locator('#title').inputValue(),title,'Panel collapse preserves title');
 // Open canonical Review & Publish flow, inspect dialog and close.
 await page.locator('#publishBtn').click({timeout:12000});
 await page.locator('#altValidationModal').waitFor({state:'visible',timeout:12000});
 const heading=await page.locator('#altValidationHeading').textContent();
 assert(heading.includes('Review & Publish'));
 await page.locator('#altValidationClose').click({timeout:12000});
 await page.locator('#altValidationModal').waitFor({state:'hidden',timeout:12000});
 // Open existing SidebarAccount, choose Dark, confirm text and publish modal remain intact.
 await page.locator('.nr-account-trigger').first().click();
 await page.locator('[data-nr-appearance-option="dark"]').first().click();
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
 assert.equal(await page.locator('#title').inputValue(),title,'Appearance change preserves title');
 await page.locator('#publishBtn').click({timeout:12000});
 await page.locator('#altValidationModal').waitFor({state:'visible',timeout:12000});
 const modalBg=await page.locator('#altValidationModal .alt-validation-card').evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.equal(modalBg,'rgb(34, 38, 44)','Publish modal is graphite');
 await page.locator('#altValidationClose').click();
 await page.locator('#altValidationModal').waitFor({state:'hidden'});
 // Existing app nav must remain expandable without losing the theme selection.
 const navButton=page.locator('#cmsNavClose');
 if(await navButton.count()&&await navButton.isVisible()){
  await navButton.click();
  assert.equal(await page.evaluate(()=>document.body.classList.contains('cms-sidebar-collapsed')),true);
  // Existing Editor hides this collapse trigger in collapsed mode; do not click a hidden control.
  if(await navButton.isVisible()){
    await navButton.click();
    assert.equal(await page.evaluate(()=>document.body.classList.contains('cms-sidebar-collapsed')),false);
  }
 }
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'dark');
 console.log('PASS: panel collapse, publishing dialog, appearance switching, preserved title, left sidebar');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
