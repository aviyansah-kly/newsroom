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

    if (!(await kira.locator('.article-owner strong').textContent()).includes('Nadia Prameswari') ||
        !(await kira.locator('.article-owner .nr-assignment-state').textContent()).includes('Assigned'))
      throw Error('KIRA draft should show Nadia Prameswari as assigned Editor');
    if (await kira.locator('.nr-pick-locked-note').count())
      throw Error('Redundant extra locked-note should not occupy another row');
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
    if (!await pick.isVisible()) throw Error('Unclaimed Harga draft must display Ambil');
    if ((await pick.textContent()).trim() !== 'Assign to Me' ||
        !await pick.evaluate(el => el.classList.contains('nr-btn')))
      throw Error('Claim action must use Design System button and clear Assign to Me wording');
    const claimInOwner = await harga.locator('.nr-external-pick').evaluate(el => ({
      insideOwner: el.parentElement?.classList.contains('article-owner'),
      inArticleCopy: !!el.closest('.article-copy')
    }));
    if (!claimInOwner.insideOwner || claimInOwner.inArticleCopy ||
        (await harga.locator('.article-meta .nr-external-pick').count()) !== 0)
      throw Error('Assignment controls belong in Reporter/Editor column: '+JSON.stringify(claimInOwner));
    const spacing = await page.evaluate(() => {
      const external = document.querySelector('.article-row[data-source="harga"]');
      const regular = document.querySelector('.article-row:not([data-source])');
      const calc = row => {
        const description = row.querySelector('.article-description').getBoundingClientRect();
        const metadata = row.querySelector('.article-meta').getBoundingClientRect();
        return { gap: metadata.top - description.bottom, height: row.getBoundingClientRect().height };
      };
      const ownerCell = external.querySelector('.article-owner').getBoundingClientRect();
      const assignment = external.querySelector('.nr-external-pick').getBoundingClientRect();
      return {external:calc(external),regular:calc(regular),assignmentInsideOwner:assignment.left >= ownerCell.left && assignment.right <= ownerCell.right+1};
    });
    if (!spacing.assignmentInsideOwner ||
        Math.abs(spacing.external.gap - spacing.regular.gap) > 4 ||
        spacing.external.height > spacing.regular.height + 4)
      throw Error('External row spacing differs from regular listing: '+JSON.stringify(spacing));
    const geometry=await pick.evaluate(el => ({
      height:el.getBoundingClientRect().height,
      font:getComputedStyle(el).fontSize,
      width:el.getBoundingClientRect().width
    }));
    if (geometry.height < 33 || geometry.height > 35 || geometry.width < 95 || geometry.font !== '13px')
      throw Error('Claim button must be medium 34px / 13px Design System size: '+JSON.stringify(geometry));
    await pick.click();
    if ((await harga.getAttribute('data-picked-by')) !== 'Raka Pratama' ||
        (await harga.getAttribute('data-owner')) !== 'me' ||
        (await harga.locator('[data-pick-action="release"]').count()) !== 1)
      throw Error('Pick did not transfer dummy ownership to current editor');
    if (await harga.locator('.article-more-btn').isDisabled())
      throw Error('Picked by You should allow Settings');
    const release=harga.locator('[data-pick-action="release"]');
    if ((await release.textContent()).trim() !== 'Release')
      throw Error('Release action should use concise Release wording');
    if (!(await harga.locator('.article-owner .nr-assignment-state').textContent()).includes('Assigned to You'))
      throw Error('After claiming, status must read Assigned to You');
    await release.click();
    if (!(await harga.locator('.article-owner .nr-assignment-state').textContent()).includes('Available'))
      throw Error('After releasing, status must read Available');
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
