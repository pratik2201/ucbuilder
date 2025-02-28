import * as fs from "fs";
import * as path from "path";
const importRegex = /import\s+.*?['"]([^'"]+)['"]/g
export function findImports(dir: string, objRef: { [key: string]: string[] } = {}): { [key: string]: string[] } {
    const files = fs.readdirSync(dir);
    let modules: Set<string> = new Set();
    let rtrn = objRef;
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (file.endsWith('node_modules')) return;
        if (stat.isDirectory()) {
            findImports(fullPath, objRef);
            //modules = new Set([...modules, ...findImports(fullPath,objRef)]);
        } else if (/*file.endsWith(".js") || */file.endsWith(".ts")) {
            const content = fs.readFileSync(fullPath, "utf8");
            const matches = content.match(importRegex);

            if (matches) {
                matches.forEach(match => {
                    const moduleMatch = match.match(/['"]([^'"]+)['"]/);
                    if (moduleMatch != null) {
                        let fv = moduleMatch[1];
                        if (!fv.startsWith('ucbuilder') && !fv.startsWith('sharepnl')) {
                            console.log(fullPath);
                            let v = rtrn[fv];
                            if (v == undefined) {
                                rtrn[fv] = [fullPath];
                            } else {
                                v.push(fullPath);
                            }
                            //modules.add(fv);
                        }
                    }
                    /* if (moduleMatch && !moduleMatch[1].startsWith(".")) {
                         modules.add(moduleMatch[1]);
                     }*/
                });
            }
        }
    });

    return rtrn;
}

