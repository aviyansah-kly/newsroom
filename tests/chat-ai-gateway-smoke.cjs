const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  try {
    await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForFunction(() => {
      const trigger = document.getElementById('railAI');
      return trigger?.parentElement === document.body;
    }, { timeout: 20000 });

    const launcher = page.locator('#railAI');
    const dock = page.locator('#agentDock');
    if (await launcher.count() !== 1) throw Error('Chat AI launcher must appear once');
    if (!await launcher.isVisible()) throw Error('Chat AI launcher not visible');
    if ((await launcher.getAttribute('aria-controls')) !== 'agentDock') throw Error('Missing Chat AI panel association');
    if ((await launcher.textContent()).includes('Chat AI') === false) throw Error('Chat AI label missing');

    const geometry = await launcher.evaluate(node => {
      const box = node.getBoundingClientRect();
      return { right: innerWidth - box.right, bottom: innerHeight - box.bottom, position: getComputedStyle(node).position };
    });
    if (geometry.position !== 'fixed' || geometry.right > 48 || geometry.bottom > 48 || geometry.right < -2 || geometry.bottom < -2)
      throw Error('Chat AI launcher must float at bottom-right: ' + JSON.stringify(geometry));

    await launcher.click();
    await page.waitForFunction(() => document.getElementById('agentDock')?.classList.contains('open'));
    if ((await launcher.getAttribute('aria-expanded')) !== 'true') throw Error('Chat AI expanded accessibility state missing');
    if (!await page.locator('#agentInput').isVisible()) throw Error('Chat AI input inaccessible');
    await page.locator('#agentClose').click();
    await page.waitForFunction(() => !document.getElementById('agentDock')?.classList.contains('open'));

    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 });
      if (!await launcher.isVisible()) throw Error('Chat AI missing at viewport ' + width);
      await launcher.click();
      await page.waitForFunction(() => document.getElementById('agentDock')?.classList.contains('open'));
      await page.locator('#agentClose').click();
      await page.waitForFunction(() => !document.getElementById('agentDock')?.classList.contains('open'));
      console.log('PASS floating Chat AI launcher and existing agentDock flow at', width);
    }
    console.log('PASS: restored existing launcher without duplicate or second chat backend');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1 });
