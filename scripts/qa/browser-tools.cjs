const path = require("node:path");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..", "..");

function playwright() {
  if (process.env.PLAYWRIGHT_MODULE_PATH) {
    return require(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH));
  }
  try {
    return require("playwright");
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const globalRoot = execFileSync(npm, ["root", "--global"], {
    encoding: "utf8", shell: process.platform === "win32"
  }).trim();
  return require(path.join(globalRoot, "playwright"));
}

function browserOptions() {
  const channel = process.env.PLAYWRIGHT_BROWSER_CHANNEL ||
    (process.platform === "win32" ? "msedge" : undefined);
  return { headless: true, ...(channel ? { channel } : {}) };
}

module.exports = { root, playwright, browserOptions };
