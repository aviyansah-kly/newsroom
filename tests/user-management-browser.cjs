const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const issues=[];
 async function check(theme,viewport){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  await context.route(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com)\//,route=>route.abort());
  await context.addInitScript(value=>{try{localStorage.setItem('newsroom:appearance',value)}catch{}},theme);
  const page=await context.newPage();
  page.on('pageerror',error=>issues.push(theme+'/'+viewport.width+': '+error.message));
  await page.goto('http://127.0.0.1:8765/users.html',{waitUntil:'domcontentloaded'});
  await page.locator('#userRows tr').first().waitFor({timeout:15000});
  assert.equal(await page.locator('#userRows tr').count(),5,'users list renders first page');
  assert.equal(await page.locator('#pageNumbers button').count(),2,'pagination shows two page numbers');
  await page.getByRole('button',{name:'Go to page 2'}).click();
  assert.equal(await page.locator('#userRows tr').count(),1,'second page contains remaining user');
  assert.equal(await page.locator('#nextPage').isDisabled(),true,'last page disables next');
  await page.locator('#prevPage').click();
  assert.equal(await page.locator('#userRows tr').count(),5,'previous returns to first page');
  assert.match(await page.locator('.nr-global-breadcrumb strong').textContent(),/User Management/,'breadcrumb correct');
  const first=page.locator('#userRows td').first();
  const font=parseFloat(await first.evaluate(node=>getComputedStyle(node).fontSize));
  assert.ok(font>=13,'readable table text');
  assert.equal(await page.locator('[data-item="User Management"].active').count(),1,'active sidebar');
  if(viewport.width<720){
    const trDisplay=await page.locator('#userRows tr').first().evaluate(node=>getComputedStyle(node).display);
    assert.equal(trDisplay,'grid','mobile records stack into cards');
    const role=await page.locator('#userRows tr').first().locator('td:nth-child(2)').getAttribute('data-label');
    assert.equal(role,'Display Name');
    const width=await page.locator('#panel-users').evaluate(node=>node.getBoundingClientRect().width);
    assert.ok(width<viewport.width,'page stays inside viewport');
  }else{
    const table=page.locator('.nr-users-table').first();
    assert.equal(await table.evaluate(node=>getComputedStyle(node).tableLayout),'fixed','column widths stable');
    const gap=await page.locator('#panel-users').evaluate(panel=>{
       const card=panel.querySelector('.nr-users-table-card').getBoundingClientRect();
       const table=panel.querySelector('.nr-users-table').getBoundingClientRect();
       return Math.abs(card.left-table.left);
    });
    assert.ok(gap<=3,'table is flush to card border');
  }
  fs.mkdirSync('qa-screenshots',{recursive:true});
  await page.screenshot({path:'qa-screenshots/users-'+theme+'-'+viewport.width+'.png',fullPage:true});
  await page.getByRole('tab',{name:'Roles & Permissions'}).click();
  assert.equal(await page.locator('#permissionRows tr').count(),6,'permissions render');
  await page.getByRole('tab',{name:'Activity Log'}).click();
  await page.getByRole('tab',{name:'Users',exact:true}).click();
  await page.locator('#addUser').click();
  assert.equal(await page.locator('#userEditorPage').isVisible(),true,'full-page form opens');
  assert.equal(await page.locator('#userListPage').isVisible(),false,'list is hidden while editing');
  assert.match(page.url(),/view=add/,'create form has addressable URL');
  assert.equal(await page.locator('#drawerBackdrop').count(),0,'no drawer backdrop');
  const selectInset=await page.locator('#fieldRole').evaluate(node=>parseFloat(getComputedStyle(node).paddingRight));
  assert.ok(selectInset>=40,'dropdown chevron has safe right inset');
  await page.locator('#fieldUsername').fill('qa.example');
  await page.locator('#fieldName').fill('QA Example');
  await page.locator('#fieldDisplayName').fill('QA Example');
  await page.locator('#fieldEmail').fill('qa@example.com');
  await page.locator('#deskOptions input[value="News"]').check();
  assert.match(await page.locator('#selectedChannelsCount').textContent(),/1 channel selected/);
  assert.equal(await page.locator('#addGrant').isEnabled(),true,'add access enabled after selecting channel');
  await page.locator('#addGrant').click();
  assert.equal(await page.locator('#addGrant').isDisabled(),true,'add access reset after grant added');
  assert.equal(await page.locator('#grantsList .nr-grant-item').count(),1,'channel assignment added');
  assert.equal(await page.locator('#grantsCount').textContent(),'1 assigned');
  await page.locator('#grantRole').selectOption('SEO');
  await page.locator('#channelSearch').fill('Bisnis');
  await page.locator('#deskOptions input[value="Bisnis"]').check();
  await page.locator('#addGrant').click();
  assert.equal(await page.locator('#grantsList .nr-grant-item').count(),2,'multiple role/channel grants added');
  await page.locator('#fieldExpirationEnabled').check();
  assert.equal(await page.locator('#expirationField').isVisible(),true,'expiration date revealed');
  await page.locator('#fieldExpirationDate').fill('2027-12-31');
  await page.locator('#fieldVerified').check();
  await page.screenshot({path:'qa-screenshots/user-form-'+theme+'-'+viewport.width+'.png',fullPage:true});
  await page.locator('#userForm button[type="submit"]').click();
  assert.equal(await page.locator('#userEditorPage').isVisible(),false,'returns to user list on save');
  assert.equal(await page.locator('#totalCount').textContent(),'7','add user works');
  await page.locator('#userSearch').fill('QA Example');
  assert.equal(await page.locator('#userRows tr').count(),1,'search filters');
  await page.getByRole('button',{name:'Edit QA Example'}).click();
  await page.locator('#fieldName').fill('QA Example Edited');
  await page.locator('#fieldDisplayName').fill('QA Example Edited');
  await page.locator('#userForm button[type="submit"]').click();
  await page.locator('#userSearch').fill('QA Example Edited');
  assert.equal(await page.locator('#userRows tr').count(),1,'edit user works');
  await page.getByRole('button',{name:'More options for QA Example Edited'}).click();
  await page.getByRole('button',{name:'Nonaktifkan User',exact:true}).click();
  assert.equal(await page.locator('#confirmBackdrop').isVisible(),true,'confirmation opens');
  await page.locator('#acceptConfirm').click();
  assert.match(await page.locator('#userRows .nr-user-status').textContent(),/Nonaktif/,'toggle works');
  await context.close();
 }
 try{
  for(const theme of ['light','dark']){
   await check(theme,{width:1440,height:900});
   await check(theme,{width:390,height:844});
  }
  assert.deepEqual(issues,[],'browser runtime errors');
  console.log('PASS: User Management desktop/mobile Light/Dark functional and UI browser QA');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
