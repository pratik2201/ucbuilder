// build-scripts/copy-assets.js
import fs from "fs";
import path from "path";
const SRC_DIR = ".";
const OUT_DIR = "out";
const COPY_EXTS = [".html", ".scss", ".css", ".svg", ".png", ".jpg", ".ico"];
const IGNORE_PATH = ['out','node_modules'];
function copyAssets(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (IGNORE_PATH.includes(full)) continue;
    if (stat.isDirectory()) {
      copyAssets(full);
    } else if (COPY_EXTS.includes(path.extname(file))) {
      const rel = path.relative(SRC_DIR, full);
      const dest = path.join(OUT_DIR, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(full, dest);
    }
  }
}

copyAssets(SRC_DIR);
console.log("✅ Assets copied to out/");
