import solidPlugin from "@opentui/solid/bun-plugin";
import { mkdir, readdir, rm } from "fs/promises";
import { join, extname, relative, basename } from "path";

const srcDir = "./src";
const outDir = "./dist";

async function getFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await getFiles(fullPath));
    } else if (extname(entry.name) === ".ts" || extname(entry.name) === ".tsx") {
      files.push(fullPath);
    }
  }
  return files;
}

async function build() {
  console.log("Building arcane-ui with @opentui/solid/bun-plugin...");

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const files = await getFiles(srcDir);

  // Build each file individually to control output path
  for (const file of files) {
    const relPath = relative(srcDir, file);
    const outPath = join(outDir, relPath.replace(/\.tsx?$/, ".js"));
    const outFileDir = join(outDir, relative(srcDir, file).split("/").slice(0, -1).join("/"));

    await mkdir(outFileDir, { recursive: true });

    console.log(`Building: ${relPath}`);

    const result = await Bun.build({
      entrypoints: [file],
      target: "bun",
      outdir: outFileDir,
      plugins: [solidPlugin],
      external: ["@opentui/core", "@opentui/solid", "solid-js", "events"],
      format: "esm",
      splitting: false,
      minify: false,
    });

    if (!result.success) {
      console.error(`Build failed for ${relPath}:`);
      for (const error of result.logs) {
        console.error(error);
      }
      process.exit(1);
    }
  }

  console.log("Build complete!");
}

build().catch(console.error);
