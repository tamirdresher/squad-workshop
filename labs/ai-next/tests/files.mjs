import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function sourceFiles(root) {
  const files = [];
  async function visit(relative) {
    const full = path.join(root, relative);
    let stat;
    try {
      stat = await lstat(full);
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }

      throw error;
    }

    if (stat.isSymbolicLink()) {
      throw new Error("Source links are not allowed.");
    }

    if (stat.isDirectory()) {
      for (const entry of await readdir(full)) {
        if (!["bin", "obj", "node_modules", "dist", ".git"].includes(entry)) {
          await visit(path.join(relative, entry));
        }
      }
    } else if (/\.(cs|csproj|json|tsx?|css|html)$/.test(relative)) {
      files.push(relative.replaceAll("\\", "/"));
    }
  }

  await visit("api");
  await visit(path.join("frontend", "src"));
  for (const file of ["frontend/package.json", "frontend/package-lock.json",
    "frontend/tsconfig.json", "frontend/vite.config.ts", "frontend/index.html"]) {
    await visit(file);
  }

  return [...new Set(files)].sort();
}

export async function sourceHash(root) {
  const hash = createHash("sha256");
  for (const file of await sourceFiles(root)) {
    hash.update(file);
    hash.update(await readFile(path.join(root, file)));
  }

  return hash.digest("hex");
}
