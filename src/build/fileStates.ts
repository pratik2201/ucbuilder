// import fs from "fs";
// import path from "path";

export interface IUcDepEntry {
    match: string;
    type: string;   // x-from | import | @use | @import | "{:"
    raw: string;    // the path exactly as written
    abs: string;    // resolved absolute path
}

export class UcDependencyScanner {

    path: typeof import('path');
    fs: typeof import('fs');
    constructor(path: typeof import('path'), fs: typeof import('fs')) {
        this.path = path;
        this.fs = fs;
    }
    // -----------------------------
    // MASTER REGEX (named groups)
    // -----------------------------
    static PATTERN = new RegExp([
        // x-from
        String.raw`(?<xfrom>x-from)\s*=\s*"(?<xfrom_path>.*?)"`,

        // JS import
        String.raw`(?<js_import>import\s+[\s\S]*?)\s+from\s+["'](?<js_path>.*?)["'];`,

        // SCSS @use / @import
        String.raw`(?<scss_type>@use|@import)\s+["'](?<scss_path>.*?)["'];`,

        // {: path }
        String.raw`(?<bracket_open>{:)(?<bracket_path>.*?)}`,
    ].join("|"), "gi");

    // ------------------------------------------------------
    // NEW: Iterate each match and return IUcDepEntry in callback
    // ------------------------------------------------------
    ReplaceAll(
        content: string,
        baseDir: string,
        callback: (entry: IUcDepEntry) => string
    ) {
        let match: RegExpExecArray | null;
        content = content.replace(UcDependencyScanner.PATTERN, (m, g: {
            xfrom_path?: string;
            js_path?: string;
            scss_type?: string;
            scss_path?: string;
            bracket_path?: string;
        }) => {
            console.log(arguments);
            return m;
            if (g.xfrom_path) {
                return callback(this._buildEntry(baseDir, g.xfrom_path, "x-from",match[0]));
            }

            if (g.js_path) {
                return callback(this._buildEntry(baseDir, g.js_path, "import",match[0]));
            }

            if (g.scss_path && g.scss_type) {
                return callback(this._buildEntry(baseDir, g.scss_path, g.scss_type,match[0]));
            }

            if (g.bracket_path) {
                return callback(this._buildEntry(baseDir, g.bracket_path, "{:",match[0]));
            }
            return m;
        });
        return content;
    }
    // ------------------------------------------------------
    // NEW: Iterate each match and return IUcDepEntry in callback
    // ------------------------------------------------------
    forEachMatch(
        content: string,
        baseDir: string,
        callback: (entry: IUcDepEntry) => void
    ): void {

        let match: RegExpExecArray | null;

        while ((match = UcDependencyScanner.PATTERN.exec(content)) !== null) {
            const g = match.groups as {
                xfrom_path?: string;
                js_path?: string;
                scss_type?: string;
                scss_path?: string;
                bracket_path?: string;
            };

            if (g.xfrom_path) {
                callback(this._buildEntry(baseDir, g.xfrom_path, "x-from",match[0]));
            }

            if (g.js_path) {
                callback(this._buildEntry(baseDir, g.js_path, "import",match[0]));
            }

            if (g.scss_path && g.scss_type) {
                callback(this._buildEntry(baseDir, g.scss_path, g.scss_type,match[0]));
            }

            if (g.bracket_path) {
                callback(this._buildEntry(baseDir, g.bracket_path, "{:",match[0]));
            }
        }
    }

    // -----------------------------
    // Scan single file
    // -----------------------------
    scan(filePath: string): IUcDepEntry[] {
        const absFile = this.path.resolve(filePath);
        const baseDir = this.path.dirname(absFile);

        if (!this.fs.existsSync(absFile)) {
            throw new Error(`File not found: ${absFile}`);
        }

        const content = this.fs.readFileSync(absFile, "utf8");
        const results: IUcDepEntry[] = [];
        let match: RegExpExecArray | null;

        while ((match = UcDependencyScanner.PATTERN.exec(content)) !== null) {
            const g = match.groups as {
                xfrom?: string;
                xfrom_path?: string;
                js_import?: string;
                js_path?: string;
                scss_type?: string;
                scss_path?: string;
                bracket_open?: string;
                bracket_path?: string;
            };

            if (g.xfrom_path) {
                results.push(this._buildEntry(baseDir, g.xfrom_path, "x-from",match[0]));
            }
            if (g.js_path) {
                results.push(this._buildEntry(baseDir, g.js_path, "import",match[0]));
            }
            if (g.scss_path && g.scss_type) {
                results.push(this._buildEntry(baseDir, g.scss_path, g.scss_type,match[0]));
            }
            if (g.bracket_path) {
                results.push(this._buildEntry(baseDir, g.bracket_path, "{:",match[0]));
            }
        }

        return results;
    }


    // -----------------------------
    // Recursively scan entire tree
    // -----------------------------
    scanTree(
        entryFile: string,
        visited: Set<string> = new Set()
    ): IUcDepEntry[] {

        const abs = this.path.resolve(entryFile);

        if (visited.has(abs))
            return [];

        visited.add(abs);

        const firstLevel = this.scan(abs);
        let tree: IUcDepEntry[] = [...firstLevel];

        for (const dep of firstLevel) {
            if (this.fs.existsSync(dep.abs)) {
                tree = tree.concat(this.scanTree(dep.abs, visited));
            }
        }

        return tree;
    }


    // -----------------------------
    // Build typed entry
    // -----------------------------
    private _buildEntry(baseDir: string, raw: string, type: string,match:string): IUcDepEntry {
        const cleaned = raw.trim();

        return {
            type,
            match,
            raw: cleaned,
            abs: this.path.resolve(baseDir, cleaned)
        };
    }
}
