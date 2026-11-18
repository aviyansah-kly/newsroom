const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');

(async () => {
  const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  mkdirSync('artifacts',{recursive:true});
  const errors = [];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8765/articles.html',{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('.article-row .article-preview-btn',{timeout:15000});
    const row=page.locator('.article-row').first();
    const title=(await row.locator('.article-title').textContent()).trim();
    await row.locator('.article-preview-btn').click();
    const dialog=page.locator('.nr-article-preview-overlay:not([hidden]) [role="dialog"]');
    if (!await dialog.isVisible()) throw Error('Dummy Preview did not open');
    if (!(await dialog.locator('.nr-article-preview-title').textContent()).includes(title))
      throw Error('Dummy Preview title does not reflect selected article');
    if (!await dialog.locator('.nr-article-preview-summary').textContent())
      throw Error('Dummy Preview summary is empty');
    if (!(await dialog.locator('.nr-article-preview-fallback').textContent()).includes('belum tersedia'))
      throw Error('Dummy Preview must clearly explain missing full article content');
    await dialog.locator('[data-preview-mode="mobile"]').click();
    if (await dialog.getAttribute('data-mode') !== 'mobile') throw Error('Preview Mobile mode not enabled');
    if (await dialog.locator('[data-preview-mode="mobile"]').getAttribute('aria-pressed') !== 'true')
      throw Error('Preview Mobile mode accessibility state wrong');
    await dialog.locator('[data-preview-mode="desktop"]').click();
    if (await dialog.getAttribute('data-mode') !== 'desktop') throw Error('Preview Desktop mode failed');
    await page.screenshot({path:'artifacts/articles-preview-desktop.png'});
    await page.keyboard.press('Escape');
    if (await dialog.isVisible()) throw Error('Escape did not close Preview');
    if (!await row.locator('.article-preview-btn').evaluate(el => el === document.activeElement))
      throw Error('Preview did not return focus to originating eye button');

    await page.setViewportSize({width:390,height:750});
    await row.locator('.article-preview-btn').click();
    if (!await dialog.isVisible()) throw Error('Preview not visible on phone');
    const bounds=await dialog.evaluate(el=>{
      const r=el.getBoundingClientRect();
      return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,w:innerWidth,h:innerHeight};
    });
    if(bounds.left<0||bounds.right>bounds.w+1||bounds.top<0||bounds.bottom>bounds.h+1)
      throw Error('Mobile preview exceeds viewport '+JSON.stringify(bounds));
    await page.screenshot({path:'artifacts/articles-preview-mobile.png'});
    await dialog.locator('.nr-article-preview-close').click();
    if (await dialog.isVisible()) throw Error('Preview close icon not working');
    if (errors.length) throw Error('Page errors: '+errors.join(' | '));
    console.log('PASS: dummy Preview title/image/summary, desktop/mobile switch, keyboard Escape, focus restore and phone viewport');
  } finally {
    await browser.close();
  }
})().catch(err=>{console.error(err);process.exitCode=1});
