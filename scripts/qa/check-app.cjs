const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const path = require("node:path");
const { rmSync, writeFileSync, existsSync } = require("node:fs");
const { root, playwright, browserOptions } = require("./browser-tools.cjs");
const { chromium } = playwright();

async function assertReachable(url) {
  // Synchronous PowerShell calls pause undici's idle-socket timers.
  const response = await fetch(url, { headers: { Connection: "close" } });
  assert.equal(response.status, 200);
  await response.arrayBuffer();
}

function ready(child, pattern, name) {
  return new Promise((resolve, reject) => {
    let output = "";
    const timeout = setTimeout(() => reject(new Error(`${name} readiness timeout: ${output}`)), 30000);
    function fail(error) { clearTimeout(timeout); reject(error); }
    child.once("error", fail);
    child.once("exit", () => fail(new Error(`${name} exited: ${output}`)));
    child.stderr.on("data", chunk => { output += chunk; });
    child.stdout.on("data", chunk => {
      output += chunk;
      const match = output.match(pattern);
      if (match) { clearTimeout(timeout); resolve(match[1]); }
    });
  });
}

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Owned PID ${child.pid} did not exit`)), 15000);
    child.once("exit", () => { clearTimeout(timeout); resolve(); });
    child.kill();
  });
}

function validate(lab, checkpoint, exportEvidence = false) {
  const script = exportEvidence ? "Export-AiNextEvidence.ps1" : "Test-AiNextLab.ps1";
  const result = spawnSync("pwsh", ["-NoLogo", "-NoProfile", "-File",
    path.join(root, "scripts", script), "-LabPath", lab, "-Feature", checkpoint], {
    cwd: root, encoding: "utf8", timeout: 180000, maxBuffer: 5 * 1024 * 1024
  });
  if (result.error) throw result.error;
  return { ...result, output: result.stdout + result.stderr };
}

async function check(checkpoint) {
  const lab = path.join(root, ".course-validation", `browser-${checkpoint}`);
  assert.ok(existsSync(path.join(lab, ".ai-next-checkpoint.json")), `Prepare ${lab} first; see scripts/qa/README.md`);
  rmSync(path.join(lab, ".ai-next", "browser.db"), { force: true });
  let api;
  let vite;
  let browser;
  async function start() {
    api = spawn("dotnet", [path.join(lab, "api", "bin", "Debug", "net10.0", "ReadingList.Api.dll")], {
      cwd: lab,
      env: { ...process.env, BOOKS_DB: path.join(lab, ".ai-next", "browser.db"),
        ASPNETCORE_URLS: "http://127.0.0.1:0", ASPNETCORE_ENVIRONMENT: "Production" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    const base = await ready(api, /Now listening on: (http:\/\/127\.0\.0\.1:\d+)/, "API");
    await assertReachable(`${base}/api/books`);
    const config = path.join(lab, ".ai-next", "browser-vite.config.mjs");
    writeFileSync(config, `export default ${JSON.stringify({ server: { proxy: { "/api": base } } })};\n`);
    vite = spawn(process.execPath, [path.join(lab, "frontend", "node_modules", "vite", "bin", "vite.js"),
      "--config", config, "--host", "127.0.0.1", "--port", "0"], {
      cwd: path.join(lab, "frontend"), env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    });
    const url = await ready(vite, /(http:\/\/127\.0\.0\.1:\d+)/, "Vite");
    await assertReachable(url);
    return url;
  }
  try {
    const firstUrl = await start();
    if (process.platform === "win32") {
      let refused = validate(lab, checkpoint);
      assert.notEqual(refused.status, 0, "Validation must refuse running API/Vite");
      assert.match(refused.output, /Stop your API and Vite servers/);
      assert.equal(api.exitCode, null, "Refusal must not stop API");
      assert.equal(vite.exitCode, null, "Refusal must not stop Vite");
      await assertReachable(`${firstUrl}/api/books`);
      await stop(api);
      refused = validate(lab, checkpoint);
      assert.notEqual(refused.status, 0, "Validation must refuse Vite with API stopped");
      assert.match(refused.output, /Stop your API and Vite servers/);
      assert.equal(vite.exitCode, null, "Refusal must not stop Vite");
      await assertReachable(firstUrl);
      console.log(`PASS ${checkpoint} running API/Vite and Vite-only guards refuse without killing processes`);
    } else {
      console.log("SKIP Windows process-discovery assertions on this platform");
    }
    await stop(api);
    await stop(vite);
    const validated = validate(lab, checkpoint, true);
    assert.equal(validated.status, 0, validated.output);
    console.log(`PASS ${checkpoint} stop owned servers → fresh validation/export`);
    const url = await start();
    browser = await chromium.launch(browserOptions());
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(url);
    await page.getByText("No books in this view.").waitFor();
    assert.equal(await page.getByRole("heading", { name: "Personal reading list" }).count(), 1);
    async function add(title, author) {
      await page.getByLabel("Title", { exact: true }).fill(title);
      await page.getByLabel("Author", { exact: true }).fill(author);
      const response = page.waitForResponse(r => r.url().endsWith("/api/books") && r.request().method() === "POST");
      await page.getByRole("button", { name: "Add book", exact: true }).click();
      return (await response).status();
    }
    assert.equal(await add("  Dune  ", " Frank Herbert "), 201);
    await page.getByText("Dune", { exact: true }).waitFor();
    assert.equal(await page.getByLabel("Title", { exact: true }).inputValue(), "");
    assert.equal(await page.getByLabel("Author", { exact: true }).inputValue(), "");
    assert.equal(await add("   ", "Valid"), 400);
    await page.getByRole("alert").waitFor();
    assert.match(await page.getByRole("alert").innerText(), /Add failed/);
    assert.equal(await add("Foundation", "Isaac Asimov"), 201);
    await page.getByText("Foundation", { exact: true }).waitFor();
    assert.equal(await page.locator("li").count(), 2);
    assert.equal(await page.getByRole("alert").count(), 0);
    if (checkpoint === "starter") {
      assert.equal(await page.getByRole("combobox").count(), 0);
      assert.equal(await page.locator("li button").count(), 0);
    } else {
      await page.getByRole("button", { name: "Mark Dune read", exact: true }).click();
      await page.getByRole("button", { name: "Mark Dune unread", exact: true }).waitFor();
      await page.getByRole("combobox").selectOption("read");
      await page.getByText("Foundation", { exact: true }).waitFor({ state: "hidden" });
      assert.equal(await page.locator("li").count(), 1);
      await page.getByRole("combobox").selectOption("unread");
      await page.getByText("Dune", { exact: true }).waitFor({ state: "hidden" });
      await page.getByText("Foundation", { exact: true }).waitFor();
      assert.equal(await page.locator("li").count(), 1);
      await page.getByRole("combobox").selectOption("all");
      await page.getByText("Dune", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark Dune unread", exact: true }).click();
      await page.getByRole("button", { name: "Mark Dune read", exact: true }).waitFor();
      await page.getByRole("button", { name: "Mark Dune read", exact: true }).click();
      await page.getByRole("button", { name: "Mark Dune unread", exact: true }).waitFor();
    }
    await page.reload();
    await page.getByText("Foundation", { exact: true }).waitFor();
    assert.equal(await page.locator("li").count(), 2);
    if (checkpoint === "filter") {
      await page.getByRole("button", { name: "Mark Dune unread", exact: true }).waitFor();
    }
    await page.screenshot({ path: path.join(root, ".course-validation", `app-${checkpoint}.png`), fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS browser ${checkpoint}: restarted API/Vite, real browser UI, add/trim, validation/recovery, reload persistence, ${checkpoint === "filter" ? "read/unread toggle and all/read/unread filters" : "no premature read/filter controls"}; no page errors`);
  } finally {
    if (browser) await browser.close();
    await stop(vite);
    await stop(api);
    console.log(`PASS ${checkpoint} exact API, Vite and browser cleanup`);
  }
}

(async () => {
  await check("starter");
  await check("filter");
})().catch(error => { console.error(error); process.exitCode = 1; });
