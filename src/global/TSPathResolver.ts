import fs, { stat } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ucUtil } from "./ucUtil.js";

interface TSConfig {
  compilerOptions?: {
    baseUrl?: string;
    outDir?: string;
    paths?: Record<string, string[]>;
  };
}

export class TSPathResolver {
  static isSamePath(a: string, b: string) {
    const absA = path.resolve(a);
    const absB = path.resolve(b);
    return (path.normalize(absA) === path.normalize(absB));
  }
  private static instance: TSPathResolver;
  private config: TSConfig;
  private baseDir: string;
  private paths: Record<string, string[]>;
  private outDir?: string;

  private constructor(tsconfigPath?: string) {
    const config = this.loadTSConfig(tsconfigPath);
    const compilerOptions = config.compilerOptions ?? {};

    this.config = config;
    this.baseDir = path.resolve(process.cwd(), compilerOptions.baseUrl ?? ".");
    this.paths = compilerOptions.paths ?? {};
    this.outDir = compilerOptions.outDir;
  }

  public static getInstance(tsconfigPath?: string): TSPathResolver {
    if (!TSPathResolver.instance) {
      TSPathResolver.instance = new TSPathResolver(tsconfigPath);
    }
    return TSPathResolver.instance;
  }

  private loadTSConfig(tsconfigPath?: string): TSConfig {
    const resolvedPath = tsconfigPath
      ? path.resolve(tsconfigPath)
      : this.findTSConfig();

    const raw = fs.readFileSync(resolvedPath, "utf8");
    const clean = this.stripCommentsSafe(raw);

    try {
      return JSON.parse(clean);
    } catch (err) {
      throw new Error(
        `Failed to parse tsconfig.json at ${resolvedPath}: ${(err as Error).message}`
      );
    }
  }

  private findTSConfig(): string {
    let currentDir = process.cwd();
    while (true) {
      const file = path.join(currentDir, "tsconfig.json");
      if (fs.existsSync(file)) return file;
      const parent = path.dirname(currentDir);
      if (parent === currentDir) break;
      currentDir = parent;
    }
    throw new Error("tsconfig.json not found");
  }

  /**
   * Strip comments without touching text inside strings.
   */
  private stripCommentsSafe(json: string): string {
    let insideString = false;
    let insideComment = false;
    let counter = 0;
    const maps: { [k: string]: string } = {};

    json = json.replace(/([\"'`])((?:\\.|(?!\1)[^\\])*)\1/g, (m, q, v) => {
      const k = `₰⁞${counter++}ῥ`;
      maps[k] = v;
      return k;
    });
    json = json.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
    json = json.replace(/,\s*([\]}])/g, "$1");

    json = json.replace(/₰⁞\d+ῥ/gm, (m) => {
      return `"${maps[m] ?? m}"`;
    });
    return json;
    /*
     let result = "";  
    for (let i = 0; i < json.length; i++) {
      const char = json[i];
      const next = json[i + 1];

      if (!insideComment && char === '"' && json[i - 1] !== "\\") {
        insideString = !insideString;
      }

      if (!insideString) {
        if (!insideComment && char === "/" && next === "/") {
          insideComment = true;
          i++;
          while (i < json.length && json[i] !== "\n") i++;
          continue;
        }

        if (!insideComment && char === "/" && next === "*") {
          insideComment = true;
          i += 2;
          while (i < json.length - 1 && !(json[i] === "*" && json[i + 1] === "/"))
            i++;
          i++;
          continue;
        }
      }

      if (!insideComment) {
        result += char;
      }

      if (insideComment && (char === "\n" || (char === "*" && next === "/"))) {
        if (char === "*" && next === "/") i++;
        insideComment = false;
      }
    }
    return result;*/
  }

  public resolve(importPath: string, importer?: string): string {
    importPath = ucUtil.devEsc(importPath);
    for (const [alias, mappedPaths] of Object.entries(this.paths)) {
      const aliasPrefix = alias.replace(/\*$/, "");
      if (importPath.startsWith(aliasPrefix)) {
        const suffix = importPath.slice(aliasPrefix.length);
        const target = mappedPaths[0].replace(/\*$/, suffix);
        return path.resolve(this.baseDir, target);
      }
    }

    if (importPath.startsWith(".")) {
      const importerDir =
        importer && importer.startsWith("file:")
          ? path.dirname(fileURLToPath(importer))
          : importer
            ? path.dirname(importer)
            : process.cwd();
      let baserel = path.relative(importerDir, this.baseDir);
      console.log(baserel);

      return path.resolve(importerDir, importPath);
    }

    return path.resolve(this.baseDir, importPath);
  }

  static subtractPath(basePath: string, targetPath: string) {
    // Resolve both paths to absolute paths
    const absBase = path.resolve(basePath);
    const absTarget = path.resolve(targetPath);

    // Get relative path from base to target
    const relative = path.relative(absBase, absTarget);

    return relative;
  }

  public resolveOut(importPath: string, importer?: string): string {
    const resolved = this.resolve(importPath, importer);
    if (!this.outDir) return resolved;

    const srcRoot = path.resolve(process.cwd(), this.baseDir);
    const outRoot = path.resolve(process.cwd(), this.outDir);

    if (resolved.startsWith(srcRoot)) {
      const rel = path.relative(srcRoot, resolved);
      return path.join(outRoot, rel.replace(/\.ts$/, ".js"));
    }
    return resolved;
  }

  public info() {
    return {
      baseDir: this.baseDir,
      outDir: this.outDir,
      paths: this.paths,
    };
  }
}
