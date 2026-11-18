const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('#cmsNavDrawer [data-cms-item="Articles"]', { timeout: 20000 });
    const editorNav = await page.locator('#cmsNavDrawer [data-cms-item]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-cms-item')));
    const editorBrand = await page.locator('.newsroom-header-left .newsroom-header-brand img').getAttribute('src');
    const editorSite = await page.locator('#newsroomSiteCurrent img').getAttribute('src');

    await page.goto('http://127.0.0.1:8765/articles.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('.nr-sidebar [data-item="Articles"]', { timeout: 20000 });
    await page.waitForSelector('.nr-header-page-actions #newArticleMenu', { timeout: 20000 });

    const articleNav = await page.locator('.nr-sidebar [data-item]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-item')));
    if (JSON.stringify(editorNav) !== JSON.stringify(articleNav)) {
      console.log('Editor nav:', JSON.stringify(editorNav));
      console.log('Articles nav:', JSON.stringify(articleNav));
      throw Error('Article List menu order differs from Editor Workspace');
    }
    if (await page.locator('.nr-sidebar [data-item="Articles"].active').count() !== 1)
      throw Error('Article List current page is not active in shared sidebar');
    if (await page.locator('.nr-topbar .newsroom-header-brand img').getAttribute('src') !== editorBrand)
      throw Error('Header brand differs from Editor');
    if (await page.locator('#newsroomSiteCurrent img').getAttribute('src') !== editorSite)
      throw Error('Site switcher differs from Editor');
    if (await page.locator('.nr-topbar .nr-header-page-actions #newArticleBtn').count() !== 1)
      throw Error('New Article action not in shared header');
    if (await page.locator('.article-page-head #newArticleBtn').count())
      throw Error('Duplicate New Article action remains in page heading');
    if (await page.locator('.nr-account').count() !== 1)
      throw Error('Shared sidebar account footer missing');

    const desktop = await page.evaluate(() => {
      const header = document.querySelector('.nr-topbar').getBoundingClientRect();
      const sidebar = document.querySelector('.nr-sidebar').getBoundingClientRect();
      return { headerHeight: header.height, sidebarWidth: sidebar.width };
    });
    if (Math.abs(desktop.headerHeight - 68) > 1 || Math.abs(desktop.sidebarWidth - 248) > 2)
      throw Error('Shared shell geometry mismatch ' + JSON.stringify(desktop));

    await page.locator('#newArticleBtn').click();
    if (!await page.locator('.article-new-popover').isVisible())
      throw Error('Existing New Article dropdown stopped opening');
    if (!await page.locator('.article-new-option[href="index.html"]').isVisible())
      throw Error('Regular Article destination missing from dropdown');

    await page.locator('#sidebarToggle').click();
    await page.waitForTimeout(350); // wait for the approved 180ms sidebar width transition
    const collapsed = await page.locator('.nr-sidebar').evaluate(el => el.getBoundingClientRect().width);
    if (Math.abs(collapsed - 64) > 2) throw Error('Shared sidebar collapse width incorrect: ' + collapsed);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#mobileMenu').click();
    if (!await page.locator('.nr-sidebar').isVisible()) throw Error('Mobile sidebar failed to open');
    if (!await page.locator('#newArticleBtn').isVisible()) throw Error('Header action invisible on mobile');
    await page.locator('#sidebarBackdrop').click({ position: { x: 380, y: 400 } });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 3) throw Error('Unexpected horizontal overflow on phone ' + overflow);

    console.log('PASS: header identity, exact sidebar IA, account, active page, 68/248/64 layout, New Article dropdown and mobile');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1 });
