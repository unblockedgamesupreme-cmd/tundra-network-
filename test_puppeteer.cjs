const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    if (typeof handleProxyNavHome === 'function') {
      document.getElementById('proxyUrlInputHome').value = "test";
      handleProxyNavHome({ preventDefault: () => {} });
    }
  });
  
  await page.waitForTimeout(3000);
  
  const frame = page.frames().find(f => f.url().includes('/api/proxy'));
  if (frame) {
    const html = await frame.content();
    console.log("IFRAME HTML:", html.substring(0, 1000));
  } else {
    console.log("No proxy iframe found");
  }
  
  await browser.close();
})();
