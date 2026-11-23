const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{width:1440,height:900} });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  mkdirSync('artifacts',{recursive:true});
  try {
    await page.goto('http://127.0.0.1:8765/articles.html',{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('.article-row[data-source="kira"] .nr-external-pick',{timeout:20000});
    const rows = page.locator('.article-row');
    if (await rows.count() !== 16) throw Error('Expected 10 original + 6 external demo articles');
    const allCount = await page.locator('.article-tab[data-status="all"] .article-tab-count').textContent();
    const draftCount = await page.locator('.article-tab[data-status="draft"] .article-tab-count').textContent();
    if (allCount.trim() !== '16' || draftCount.trim() !== '9') {
      throw Error('Status counts not updated for external drafts: '+allCount+' / '+draftCount);
    }

    const kira = page.locator('.article-row[data-source="kira"]');
    const gempa = page.locator('.article-row[data-source="gempa"]');
    const harga = page.locator('.article-row[data-source="harga"]');

    if (!(await kira.locator('.nr-pick-status').textContent()).includes('Editor X'))
      throw Error('KIRA draft should indicate already picked by Editor X');
    if (await kira.locator('[data-pick-action="pick"]').count())
      throw Error('Cannot pick a draft claimed by another editor');
    if (await kira.locator('.article-more-btn').isEnabled())
      throw Error('Locked external draft should disable Settings/edit');
    if (!await kira.locator('.article-preview-btn').isEnabled())
      throw Error('External draft preview must remain available');

    if (await gempa.locator('[data-pick-action="release"]').count() !== 1 ||
        await gempa.locator('.article-more-btn').isDisabled())
      throw Error('Current Editor must be able to release own claim and open Settings');

    const pick = harga.locator('[data-pick-action="pick"]');
    if (!await pick.isVisible()) throw Error('Unclaimed Harga draft must display Pick Artikel');
    await pick.click();
    if ((await harga.getAttribute('data-picked-by')) !== 'Saya QA' ||
        (await harga.getAttribute('data-owner')) !== 'me' ||
        (await harga.locator('[data-pick-action="release"]').count()) !== 1)
      throw Error('Pick did not transfer dummy ownership to current editor');
    if (await harga.locator('.article-more-btn').isDisabled())
      throw Error('Picked by You should allow Settings');
    await harga.locator('[data-pick-action="release"]').click();
    if (await harga.getAttribute('data-picked-by') ||
        await harga.getAttribute('data-owner') !== 'team' ||
        !await harga.locator('[data-pick-action="pick"]').isVisible())
      throw Error('Release Pick should restore Available');

    await page.locator('#filterBtn').click();
    await page.locator('#sourceFilter').selectOption('kira');
    await page.locator('#applyFilters').click();
    if (await page.locator('.article-row:not([hidden])').count() !== 1 ||
        await kira.isHidden())
      throw Error('Source KIRA filter should show only KIRA demo draft');
    if (!(await page.locator('#filterCount').textContent()).includes('1'))
      throw Error('Source selection must count toward active filters');

    await page.locator('#filterBtn').click();
    await page.locator('#sourceFilter').selectOption('external');
    await page.locator('#pickFilter').selectOption('available');
    await page.locator('#applyFilters').click();
    if (await page.locator('.article-row:not([hidden])').count() !== 4)
      throw Error('External + Available filters should combine to show four drafts');

    // Source and Pick should compose with the existing status tab.
    await page.locator('.article-tab[data-status="published"]').click();
    if (await page.locator('.article-row:not([hidden])').count())
      throw Error('Published + External + Available should return zero rows');
    await page.locator('.article-tab[data-status="all"]').click();

    await page.locator('#filterBtn').click();
    await page.locator('#sourceFilter').selectOption('external');
    await page.locator('#pickFilter').selectOption('mine');
    await page.locator('#applyFilters').click();
    if (await page.locator('.article-row:not([hidden])').count() !== 1 || await gempa.isHidden())
      throw Error('External + Picked by Me should show only demo Gempa');
    await gempa.locator('[data-pick-action="release"]').click();
    if (await page.locator('.article-row:not([hidden])').count() !== 0)
      throw Error('Release should refresh Pick filter and remove the row from Mine');

    await page.locator('#filterBtn').click();
    await page.locator('#resetFilters').click();
    if (await page.locator('.article-row:not([hidden])').count() !== 16)
      throw Error('Reset Filters should restore all manual + external demo articles');

    await page.screenshot({path:'artifacts/external-source-pick-desktop.png'});
    await page.setViewportSize({width:390,height:844});
    await page.locator('.article-row[data-source="cnc"] .nr-pick-button').scrollIntoViewIfNeeded();
    if (!await page.locator('.article-row[data-source="cnc"] .nr-pick-button').isVisible())
      throw Error('Pick Article must remain visible on mobile');
    await page.screenshot({path:'artifacts/external-source-pick-mobile.png'});
    if (errors.length) throw Error('JavaScript errors: '+errors.join(' | '));
    console.log('PASS: 6 external sources, Pick/Release, competing ownership, Settings restrictions, combined filters, counts, and mobile');
  } finally {
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
