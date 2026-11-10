import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { sourceHash } from "./files.mjs";

const [lab, feature] = process.argv.slice(2);
assert.ok(lab && ["starter", "read", "filter"].includes(feature));
const run = path.join(lab, ".ai-next", `test-${randomUUID()}`);
await mkdir(run);
const database = path.join(run, "books.db");
const results = [];
let child;
let base;

async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => {
    child.once("exit", resolve);
  });
  child.kill();
  await Promise.race([
    exited,
    new Promise((_, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("API process did not stop."));
      }, 10000);
      timeout.unref();
    })
  ]);
}

async function start() {
  child = spawn("dotnet", [path.join(lab, "api", "bin", "Debug", "net10.0", "ReadingList.Api.dll")], {
    cwd: lab,
    env: {
      ...process.env,
      BOOKS_DB: database,
      ASPNETCORE_URLS: "http://127.0.0.1:0",
      ASPNETCORE_ENVIRONMENT: "Production",
      Logging__LogLevel__Default: "Information"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  let output = "";
  child.stderr.on("data", () => {
    // Server logs intentionally never become evidence.
  });
  base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("API did not become ready in 30 seconds."));
    }, 30000);
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", () => {
      clearTimeout(timeout);
      reject(new Error("API exited before readiness."));
    });
    child.stdout.on("data", (chunk) => {
      output = (output + chunk.toString()).slice(-8000);
      const match = output.match(/Now listening on: (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
  });
}

async function request(method, route, body, expected) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  assert.equal(response.status, expected);
  if (expected === 200 || expected === 201) {
    const value = await response.json();
    return { value, location: response.headers.get("location") };
  }
}

function bookSchema(book) {
  assert.deepEqual(Object.keys(book).sort(), ["author", "id", "isRead", "title"]);
  assert.equal(typeof book.id, "number");
  assert.equal(typeof book.title, "string");
  assert.equal(typeof book.author, "string");
  assert.equal(typeof book.isRead, "boolean");
}

async function check(name, action) {
  try {
    await action();
    results.push({ name, result: "passed" });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, result: "failed" });
    throw error;
  }
}

let passed = false;
let cleaned = false;
let first;
let second;
try {
  await start();
  await check("new independent SQLite database is empty", async () => {
    assert.deepEqual((await request("GET", "/api/books", undefined, 200)).value, []);
  });
  await check("POST trims both fields, returns 201 Book and Location", async () => {
    const response = await request("POST", "/api/books", { title: "  Dune  ", author: " Frank Herbert " }, 201);
    first = response.value;
    bookSchema(first);
    assert.deepEqual(first, { id: 1, title: "Dune", author: "Frank Herbert", isRead: false });
    assert.equal(response.location, "/api/books/1");
  });
  for (const field of ["title", "author"]) {
    for (const [label, value] of [["missing", undefined], ["null", null], ["empty", ""],
      ["whitespace", " \t "], ["overlong", "x".repeat(121)], ["number", 42]]) {
      await check(`POST rejects ${field} ${label}`, async () => {
        await request("POST", "/api/books", { title: "Valid", author: "Valid", [field]: value }, 400);
      });
    }
  }

  await check("POST accepts trimmed 120-character title and author", async () => {
    second = (await request("POST", "/api/books", {
      title: ` ${"t".repeat(120)} `, author: ` ${"a".repeat(120)} `
    }, 201)).value;
    bookSchema(second);
    assert.equal(second.title.length, 120);
    assert.equal(second.author.length, 120);
  });
  await check("GET preserves schema and stable id order; invalid POSTs do not insert", async () => {
    const books = (await request("GET", "/api/books", undefined, 200)).value;
    assert.deepEqual(books, [first, second]);
    books.forEach(bookSchema);
  });
  if (feature !== "starter") {
    const route = `/api/books/${first.id}/read`;
    for (const [label, body] of [["missing", {}], ["null", { isRead: null }],
      ["string", { isRead: "true" }], ["number", { isRead: 1 }]]) {
      await check(`PATCH rejects ${label} boolean`, async () => {
        await request("PATCH", route, body, 400);
      });
    }

    await check("PATCH unknown id returns 404", async () => {
      await request("PATCH", "/api/books/999999/read", { isRead: true }, 404);
    });
    await check("PATCH true is idempotent and preserves title/author", async () => {
      first = { ...first, isRead: true };
      assert.deepEqual((await request("PATCH", route, { isRead: true }, 200)).value, first);
      assert.deepEqual((await request("PATCH", route, { isRead: true }, 200)).value, first);
      assert.deepEqual((await request("GET", "/api/books", undefined, 200)).value, [first, second]);
    });
    await check("PATCH false is idempotent then true persists", async () => {
      const unread = { ...first, isRead: false };
      assert.deepEqual((await request("PATCH", route, { isRead: false }, 200)).value, unread);
      assert.deepEqual((await request("PATCH", route, { isRead: false }, 200)).value, unread);
      assert.deepEqual((await request("PATCH", route, { isRead: true }, 200)).value, first);
    });
  }

  if (feature === "filter") {
    await check("GET all/read/unread filters match exact ordered Book arrays", async () => {
      assert.deepEqual((await request("GET", "/api/books?status=all", undefined, 200)).value, [first, second]);
      assert.deepEqual((await request("GET", "/api/books?status=read", undefined, 200)).value, [first]);
      assert.deepEqual((await request("GET", "/api/books?status=unread", undefined, 200)).value, [second]);
    });
    for (const invalid of ["invalid", "", "Read", "all&status=read", "%20read%20"]) {
      await check(`GET rejects invalid filter ${invalid || "(empty)"}`, async () => {
        await request("GET", `/api/books?status=${invalid}`, undefined, 400);
      });
    }

    await check("filter requests never mutate storage", async () => {
      assert.deepEqual((await request("GET", "/api/books", undefined, 200)).value, [first, second]);
    });
  }

  await check("API restart preserves SQLite data and read status", async () => {
    await stop();
    await start();
    assert.deepEqual((await request("GET", "/api/books", undefined, 200)).value, [first, second]);
    if (feature === "filter") {
      assert.deepEqual((await request("GET", "/api/books?status=read", undefined, 200)).value, [first]);
    }
  });
  passed = true;
} catch {
  console.error(`FAIL ${results.at(-1)?.name ?? "API startup"}; no server logs exported.`);
  process.exitCode = 1;
} finally {
  try {
    await stop();
    await rm(run, { recursive: true, force: false });
    cleaned = true;
  } catch {
    passed = false;
    process.exitCode = 1;
    results.push({ name: "exact API process and run-directory cleanup", result: "failed" });
  }

  const receipt = {
    result: passed ? "passed" : "failed",
    feature,
    timestamp: new Date().toISOString(),
    sourceHash: await sourceHash(lab),
    builds: { api: "passed", frontend: "passed" },
    versions: {
      node: process.version,
      npm: execFileSync("npm.cmd", ["--version"], { shell: true, encoding: "utf8" }).trim(),
      dotnet: execFileSync("dotnet", ["--version"], { encoding: "utf8" }).trim()
    },
    checks: results,
    cleanup: cleaned ? "completed" : "failed; inspect the exact test run path locally",
    browserUi: "not verified"
  };
  await writeFile(path.join(lab, ".ai-next", "test-receipt.json"), JSON.stringify(receipt, null, 2));
}
