const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('#cmsNavDrawer.nr-unified-nav .nr-nav-rail [data-nav-group="admin"]', { timeout: 20000 });
    const editor = await page.evaluate(() => {
      const sidebar = document.querySelector('#cmsNavDrawer.nr-unified-nav');
      return {
        nav: [...sidebar.querySelectorAll('.nr-nav-list[data-group="dashboard"] [data-cms-item]')].map(el => el.dataset.cmsItem),
        rail: [...sidebar.querySelectorAll('.nr-nav-rail [data-nav-group]')].map(el => el.dataset.navGroup),
        width: sidebar.getBoundingClientRect().width,
        railWidth: sidebar.querySelector('.nr-nav-rail').getBoundingClientRect().width,
        brand: document.querySelector('.newsroom-header-left .newsroom-header-brand img')?.getAttribute('src'),
        site: document.querySelector('#newsroomSiteCurrent img')?.getAttribute('src')
      };
    });
    if (JSON.stringify(editor.rail) !== JSON.stringify(['dashboard','admin']))
      throw Error('Latest Editor two-column sidebar groups missing: ' + JSON.stringify(editor.rail));

    await page.goto('http://127.0.0.1:8765/articles.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForSelector('#sidebar.nr-unified-nav .nr-nav-rail [data-nav-group="admin"]', { timeout: 20000 });
    await page.waitForSelector('.nr-header-page-actions #newArticleMenu', { timeout: 20000 });
    await page.waitForSelector('.nr-account', { timeout: 15000 });

    const article = await page.evaluate(() => {
      const sidebar = document.querySelector('#sidebar.nr-unified-nav');
      return {
        nav: [...sidebar.querySelectorAll('.nr-nav-list[data-group="dashboard"] [data-item]')].map(el => el.dataset.item),
        rail: [...sidebar.querySelectorAll('.nr-nav-rail [data-nav-group]')].map(el => el.dataset.navGroup),
        width: sidebar.getBoundingClientRect().width,
        railWidth: sidebar.querySelector('.nr-nav-rail').getBoundingClientRect().width,
        headerHeight: document.querySelector('.nr-topbar').getBoundingClientRect().height
      };
    });
    if (JSON.stringify(editor.nav) !== JSON.stringify(article.nav))
      throw Error('Article List nav differs from Editor: ' + JSON.stringify({editor: editor.nav, articles: article.nav}));
    if (JSON.stringify(editor.rail) !== JSON.stringify(article.rail))
      throw Error('Two-column rail groups do not match Editor');
    if (Math.abs(article.width - 274) > 2 || Math.abs(editor.width - article.width) > 2 ||
        Math.abs(article.railWidth - 66) > 2 || Math.abs(editor.railWidth - article.railWidth) > 2 ||
        Math.abs(article.headerHeight - 68) > 1)
      throw Error('Latest two-column sidebar geometry mismatch: ' + JSON.stringify({ editor, article }));
    if ((await page.locator('#sidebar .nr-nav-list[data-group="dashboard"] [data-item="Articles"].active').count()) !== 1)
      throw Error('Articles is not active in the Dashboard group');
    if ((await page.locator('.nr-topbar .newsroom-header-brand img').getAttribute('src')) !== editor.brand ||
        (await page.locator('#newsroomSiteCurrent img').getAttribute('src')) !== editor.site)
      throw Error('Header logo / site selector differs from Editor');
    if ((await page.locator('#sidebar .nr-account').count()) !== 1) throw Error('Account footer missing');

    // The rail really switches Dashboard/Admin; it is not a decorative placeholder.
    await page.locator('#sidebar [data-nav-group="admin"]').click();
    if (!await page.locator('#sidebar .nr-nav-list[data-group="admin"] [data-admin-menu="Users"]').isVisible())
      throw Error('Admin group did not open');
    if (await page.locator('#sidebar .nr-nav-list[data-group="dashboard"]').isVisible())
      throw Error('Dashboard list remains visible while Admin is selected');
    await page.locator('#sidebar [data-nav-group="dashboard"]').click();

    await page.locator('#newArticleBtn').click();
    if (!await page.locator('.article-new-popover').isVisible()) throw Error('New Article dropdown no longer opens');
    if (!await page.locator('.article-new-option[href="index.html"]').isVisible())
      throw Error('New Article destination missing');

    // Persisted state is shared by CMS pages, so normalize before checking collapse.
    await page.evaluate(() => {
      document.body.classList.remove('nr-sidebar-collapsed');
      localStorage.setItem('newsroom:sidebar-collapsed', '0');
    });
    await page.locator('#sidebarToggle').click();
    await page.waitForTimeout(350);
    const collapsed = await page.locator('#sidebar').evaluate(el => el.getBoundingClientRect().width);
    if (Math.abs(collapsed - 66) > 2 || await page.locator('#sidebar .nr-nav-content').isVisible())
      throw Error('Two-column nav collapse should show rail only, 66px: ' + collapsed);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#mobileMenu').click();
    await page.waitForTimeout(250);
    const mobileLeft = await page.locator('#sidebar').evaluate(el => el.getBoundingClientRect().left);
    if (mobileLeft < -2) throw Error('Mobile sidebar is offscreen after opening: ' + mobileLeft);
    if (!await page.locator('#sidebar .nr-nav-content').isVisible())
      throw Error('Mobile should show both rail and menu');
    if (!await page.locator('#newArticleBtn').isVisible()) throw Error('New Article hidden on mobile');
    await page.locator('#sidebarBackdrop').click({ position: { x: 380, y: 400 } });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 3) throw Error('Horizontal overflow: ' + overflow);

    console.log('PASS: Article List matches latest Editor two-column sidebar (274px + 66px rail), groups, menu, header, account, collapse and mobile.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1 });
