import assert from "node:assert/strict";
import { readFile, writeFile, lstat } from "node:fs/promises";
import path from "node:path";
import { sourceFiles, sourceHash } from "./files.mjs";

const [lab] = process.argv.slice(2);
const state = path.join(lab, ".ai-next");
const receipt = JSON.parse(await readFile(path.join(state, "test-receipt.json"), "utf8"));
assert.equal(receipt.result, "passed", "Evidence requires passing real tests.");
assert.equal(receipt.sourceHash, await sourceHash(lab), "Source changed after test receipt.");
const metadata = JSON.parse((await readFile(path.join(lab, ".ai-next-checkpoint.json"), "utf8")).replace(/^\uFEFF/, ""));
const baseline = path.join(state, "baseline");
const files = [...new Set([...await sourceFiles(lab), ...await sourceFiles(baseline)])].sort();
const changes = [];

function sanitize(text) {
  return text.replaceAll("\r\n", "\n").split("\n").map((line) => {
    if (/password|passwd|secret|token|api[_-]?key|authorization|credential|-----BEGIN .*PRIVATE KEY/i.test(line) ||
      /https?:\/\/[^/\s]+@/i.test(line) || /[A-Z]:[\\/](?:Users|home)[\\/]/i.test(line) ||
      /(?:gh[pousr]_|github_pat_)[a-zA-Z0-9_]+/.test(line)) {
      return "[REDACTED: potentially sensitive line]";
    }

    return line;
  }).join("\n");
}

async function text(root, file) {
  try {
    return await readFile(path.join(root, file), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return "";
    }

    throw error;
  }
}

for (const file of files) {
  const before = await text(baseline, file);
  const after = await text(lab, file);
  if (before !== after) {
    changes.push(`--- checkpoint/${file}\n+++ participant/${file}\n@@ -1,${before.split("\n").length} +1,${after.split("\n").length} @@\n` +
      sanitize(before).split("\n").map((line) => `-${line}`).join("\n") + "\n" +
      sanitize(after).split("\n").map((line) => `+${line}`).join("\n"));
  }
}

let narrative = "not supplied; memory, routing and review are not verified";
try {
  const file = path.join(lab, "AI-NEXT-EVIDENCE.md");
  assert.equal((await lstat(file)).isSymbolicLink(), false, "Narrative must not be a link.");
  narrative = sanitize((await readFile(file, "utf8")).slice(0, 32000));
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

await writeFile(path.join(state, "source.diff"), changes.join("\n\n") + "\n");
await writeFile(path.join(state, "evidence.json"), JSON.stringify({
  schemaVersion: 1,
  checkpoint: metadata.checkpoint,
  testedFeature: receipt.feature,
  testReceipt: receipt,
  sourceDiff: "source.diff",
  diffScope: "api C#/project/JSON; frontend source/config/manifests only; checkpoint-relative full-file hunks",
  userReportedNarrative: narrative,
  memory: "not verified; inspect a fresh-session citation manually",
  routing: "not verified; user-reported narrative is not independent proof",
  review: "not verified; obtain independent reviewer dispositions",
  browserUi: "not verified",
  limitations: [
    "Prepared checkpoints are manual fallback, not evidence that agents implemented features.",
    "Starter tests do not establish read/filter completion; use the explicit Feature selector.",
    "Local baseline is learner-writable, not tamper-proof.",
    "Sanitization is best effort. Manually inspect evidence before sharing.",
    "No chat, .squad history, credentials, database or server logs are collected. Nothing is published."
  ]
}, null, 2));
console.log("Local sanitized evidence written: .ai-next\\evidence.json and .ai-next\\source.diff. Inspect before sharing.");
