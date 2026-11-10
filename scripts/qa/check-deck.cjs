const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { mkdirSync } = require("node:fs");
const { root, playwright, browserOptions } = require("./browser-tools.cjs");
const { chromium } = playwright();

async function main() {
  const output = path.join(root, ".course-validation");
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch(browserOptions());
  try {
    const page = await browser.newPage();
    const failures = [];
    page.on("pageerror", error => failures.push(error.message));
    const url = pathToFileURL(path.join(root, "presentations", "ai-next-squad.html")).href;
    await page.goto(url);
    assert.equal(await page.locator(".slide").count(), 21);
    assert.equal(await page.locator(".notes").count(), 21);
    const duration = await page.locator(".lab").evaluateAll(slides =>
      slides.reduce((sum, slide) => sum + Number(slide.dataset.duration), 0)
    );
    assert.equal(duration, 126);
    assert.equal(await page.locator("script[src], link[rel=stylesheet]").count(), 0);
    const reviewCommands = await page.locator("#slide-16 pre").innerText();
    assert.match(reviewCommands, /Test-AiNextLab\.ps1[^\n]+-Feature filter/);
    assert.match(reviewCommands, /Export-AiNextEvidence\.ps1[^\n]+-Feature filter/);
    assert.match(await page.locator("#slide-16").innerText(), /-Feature read[\s\S]+both/);

    await page.locator("#next").click();
    await assertCounter(page, "2 / 21");
    await page.locator("#previous").click();
    await assertCounter(page, "1 / 21");
    await page.locator("#jump").selectOption("13");
    await assertCounter(page, "14 / 21");
    await page.locator("#jump").blur();
    await page.keyboard.press("Home");
    await assertCounter(page, "1 / 21");
    await page.keyboard.press("End");
    await assertCounter(page, "21 / 21");
    await page.keyboard.press("ArrowLeft");
    await assertCounter(page, "20 / 21");
    await page.keyboard.press("n");
    assert.equal(await page.locator("#notes").getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator(".active .notes").isVisible(), true);
    await page.keyboard.press("n");
    await page.keyboard.press("a");
    assert.equal(await page.locator(".slide:visible").count(), 21);
    await page.keyboard.press("a");
    assert.equal(await page.locator(".slide:visible").count(), 1);
    const originalTheme = await page.locator("html").getAttribute("data-theme");
    await page.locator("#theme").click();
    assert.notEqual(await page.locator("html").getAttribute("data-theme"), originalTheme);
    await page.goto(`${url}?scoutTheme=dark#slide-7`);
    await assertCounter(page, "7 / 21");
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");

    const checks = [];
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 1280, height: 720 },
      { width: 768, height: 1024 },
      { width: 390, height: 844 }
    ]) {
      await page.setViewportSize(viewport);
      for (let index = 0; index < 21; index++) {
        await page.locator("#jump").selectOption(String(index));
        const layout = await page.evaluate(() => {
          const slide = document.querySelector(".slide.active");
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            height: Math.round(slide.getBoundingClientRect().height),
            title: slide.dataset.title
          };
        });
        assert.equal(layout.overflow, false, `${viewport.width}px slide ${index + 1} overflow`);
        checks.push({ viewport: viewport.width, number: index + 1, ...layout });
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.locator("#jump").selectOption("6");
    await page.screenshot({ path: path.join(output, "deck-lab-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, "deck-lab-mobile.png"), fullPage: true });
    await page.emulateMedia({ media: "print" });
    assert.equal(await page.locator(".slide:visible").count(), 21);
    assert.equal(await page.locator(".controls").isVisible(), false);
    assert.deepEqual(failures, []);
    console.log(JSON.stringify({
      result: "PASS",
      slides: 21,
      handsOnMinutes: duration,
      viewportSlideChecks: checks.length,
      navigation: "buttons, jump, Home, End, arrows, hash",
      notesThemeOverviewPrint: "PASS",
      pageErrors: failures,
      maximumSlideHeight1440: Math.max(...checks.filter(row => row.viewport === 1440).map(row => row.height))
    }, null, 2));
  } finally {
    await browser.close();
  }
}

async function assertCounter(page, expected) {
  assert.equal(await page.locator("#counter").textContent(), expected);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
