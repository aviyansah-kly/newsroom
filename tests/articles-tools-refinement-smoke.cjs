const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');

(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const failures = [];
  page.on('pageerror', err => failures.push(err.message));
  mkdirSync('artifacts', {recursive:true});
  try {
    await page.goto('http://127.0.0.1:8765/articles.html', {waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('.nr-tools-menu', {timeout:20000});
    const published = page.locator('.article-row[data-status="published"]').first();
    const menuButton = published.locator('.article-more-btn');
    await menuButton.click();
    await page.waitForTimeout(120);
    const menu = published.locator('.nr-tools-menu');
    if (!await menu.isVisible()) throw Error('Tools menu does not open');
    if (await menu.locator('.nr-tools-field').count() !== 2)
      throw Error('Headline and Pin Article must show inline');
    if (await menu.locator('.article-action-submenu').count())
      throw Error('Obsolete side popup submenu should not remain');
    if (!await menu.locator('[data-tools-toggle="headlineHome"]').isVisible())
      throw Error('Headline Homepage option missing');
    if (await menu.locator('.nr-tools-disclosure-content').count())
      throw Error('Advanced settings should be collapsed by default');
    const before = await menu.locator('[data-tools-toggle="headlineTV"]').getAttribute('aria-pressed');
    await menu.locator('[data-tools-toggle="headlineTV"]').click();
    const after = await menu.locator('[data-tools-toggle="headlineTV"]').getAttribute('aria-pressed');
    if (before === after) throw Error('Headline TV selection did not change');
    await menu.locator('[data-tools-toggle="exclude"]').click();
    if (await menu.locator('[data-tools-toggle="curated"]').getAttribute('aria-pressed') !== 'false')
      throw Error('Exclude and Curated must be mutually exclusive');
    await menu.locator('[data-tools-disclosure="advanced"]').click();
    if (!await menu.locator('[data-tools-toggle="adsMobile"]').isVisible())
      throw Error('Advanced ads settings did not expand');
    await menu.locator('[data-tools-toggle="adsMobile"]').click();
    if (await menu.locator('[data-tools-toggle="adsMobile"]').getAttribute('aria-pressed') !== 'true')
      throw Error('Mobile ads toggle did not persist');
    await menu.locator('[data-tools-disclosure="technical"]').click();
    if (!await menu.locator('[data-tools-toggle="varnish"]').isVisible())
      throw Error('Technical settings did not expand');
    await page.screenshot({path:'artifacts/article-tools-light.png'});
    // ESC closes the menu without losing settings.
    await menu.locator('[data-tools-disclosure="technical"]').press('Escape');
    if (await menu.isVisible()) throw Error('Escape did not close Tools');
    await menuButton.click();
    if (await menu.locator('[data-tools-toggle="adsMobile"]').getAttribute('aria-pressed') !== 'true')
      throw Error('Settings did not persist while reopening menu');

    // Simulate Unpublish only after explicit confirmation; must not hit CMS API.
    await menu.locator('[data-tools-command="unpublish"]').click();
    if (!await menu.locator('[data-tools-command="confirm-unpublish"]').isVisible())
      throw Error('Unpublish lacks confirmation');
    await menu.locator('[data-tools-command="cancel-unpublish"]').click();
    if (!await menu.locator('[data-tools-command="unpublish"]').isVisible())
      throw Error('Unpublish cancel does not restore original action');
    await menu.locator('[data-tools-command="unpublish"]').click();
    await menu.locator('[data-tools-command="confirm-unpublish"]').click();
    if (await published.getAttribute('data-status') !== 'draft')
      throw Error('Demo unpublish did not update local row state');
    if (await published.locator('.article-status-pill').textContent() !== 'Draft')
      throw Error('Status label did not update');

    // Dark background must actually change.
    await menu.locator('[data-tools-command="close"]').click();
    await page.evaluate(() => {document.documentElement.dataset.theme='light'});
    await menuButton.click();
    const light = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    await page.evaluate(() => {document.documentElement.dataset.theme='dark'});
    const dark = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    if (light === dark) throw Error('Tools background remains light in Dark Mode');
    await page.screenshot({path:'artifacts/article-tools-dark.png'});
    await menu.locator('[data-tools-command="close"]').click();

    // Menu stays fully inside a 390px mobile viewport and can scroll.
    await page.setViewportSize({width:390,height:750});
    await page.evaluate(() => {document.documentElement.dataset.theme='light'});
    await menuButton.click();
    await page.waitForTimeout(80);
    const geom = await menu.evaluate(el => {
      const r=el.getBoundingClientRect();
      return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight,scrollHeight:el.querySelector('.nr-tools-scroll')?.scrollHeight};
    });
    if (geom.left < 0 || geom.right > geom.w + 1 || geom.top < 0 || geom.bottom > geom.h + 1)
      throw Error('Tools popup overflows mobile viewport '+JSON.stringify(geom));
    await page.screenshot({path:'artifacts/article-tools-mobile.png'});
    if (failures.length) throw Error('Browser errors: '+failures.join(' | '));
    console.log('PASS: Tools layout, accessibility, inline placement, state persistence, confirmation, Dark Mode and mobile bounds');
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
