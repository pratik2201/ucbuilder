
import path from "path";
import fs from "fs";
import { GetPackage, GetProjectName, GetUcConfig, isSamePath, subtractPath, UserUCConfig } from "../ipc/enumAndMore.js";
const args = process.argv.slice(2);
const user_project_dir = path.resolve();
const ucbuilder_project_dir = path.resolve(user_project_dir, 'node_modules/ucbuilder');
let pkg = GetPackage(user_project_dir, path, fs) as {};
const user_project_name = args[0] ?? pkg['name'];
const ucbuilder_resource_dir = path.join(ucbuilder_project_dir, 'assets/resources');
function GetInfo(subpath: string) {
    const rtrn = {
        userFilePath: path.join(user_project_dir, subpath),
        templatePath: path.join(ucbuilder_resource_dir, subpath),
        templateContent: undefined as string,
        get isUserFileExist() { return fs.existsSync(rtrn.userFilePath); },
        write: undefined as (content?: string) => void,
    }
    rtrn.write = (content: string = rtrn.templateContent) => {
        ensureDirectoryExistence(rtrn.userFilePath);
        fs.writeFileSync(rtrn.userFilePath, content, 'binary');
    }
    rtrn.templateContent = fs.readFileSync(rtrn.templatePath, 'binary');
    return rtrn;
}
function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}
function DirectGenerate(subpath: string) {
    let launchFile = GetInfo(subpath);
    if (!launchFile.isUserFileExist) launchFile.write();
}
DirectGenerate('ucconfig.json');
let uccfg = GetUcConfig(user_project_dir, path, fs) as {} as UserUCConfig;
/*DirectGenerate('.vscode/launch.json');
DirectGenerate('.vscode/settings.json');
DirectGenerate('Program.ts');
DirectGenerate('Program.main.ts');
DirectGenerate('Program.preload-renderer.ts');
DirectGenerate('Program.preload.cjs');
DirectGenerate('Program.viewer.html');
DirectGenerate('Program.styles.scss');
DirectGenerate('tsconfig.json');
DirectGenerate('ucconfig.json');
DirectGenerate('assets/$uc-moveAssetsToStage.js');*/
const ignoreDirs = (uccfg.developer.build.ignorePath ?? []).map(s => path.normalize(path.join(user_project_dir, s)));
function isValidFile(fpath: string): boolean {
    return ignoreDirs.findIndex(s => {
        return isSamePath(s, fpath, path);
    }) == -1;
}
function recursive(parentDir: string, isValidFile: (fpath: string) => boolean, callback: (path: string) => void) {
    if (!isValidFile(parentDir)) return;
    let DirectoryContents = fs.readdirSync(parentDir + '/');
    DirectoryContents.forEach((file: string) => {
        let _path = path.join(parentDir, file);//["#toFilePath"]();            
        if (fs.statSync(_path).isDirectory()) {
            recursive(_path, isValidFile, callback);
        } else {
            callback(_path);
        }
    });
}

recursive(ucbuilder_resource_dir, isValidFile, (_path:string) => {
    let diffpath = subtractPath(ucbuilder_resource_dir, _path,path);
    DirectGenerate(diffpath);
});
if (pkg != undefined) {
    pkg["main"] = "./out/Program.main.js";
    pkg["type"] = "module";
    pkg['scripts'] = pkg['scripts'] ?? {};
    Object.assign(pkg['scripts'], {
        "clean": "rimraf out",
        "build:dts": "tsc --emitDeclarationOnly",
        "build:js": "node assets/$uc-moveAssetsToStage.js && tsc",
        "build": "npm run build:js",
        "rebuild": "npm run clean && npm run build:js  && npm run build:dts",
        "start": " electron . --trace-deprecation",
    });
    fs.writeFileSync(path.join(user_project_dir, 'package.json'), JSON.stringify(pkg, undefined, 4), 'binary');
}
console.log('here...............................................');