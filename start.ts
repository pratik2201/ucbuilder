import fs from "fs";
import path from "path";

import alc from "module-alias";

alc.addAlias("ucbuilder", __dirname);

import ucr from "ucbuilder/register";

import { RootPathParam } from "ucbuilder/enumAndMore";
/**
 s(__dirname, {
    addModule: false
});

 */


export interface UcConfig {
    projectName: string,
    rootDir: string,
    designerDir: string,
    outDir: string,
    paths: {
        [key: string]: string,
    },
}
export const ucConfig: UcConfig = {
    projectName: "",
    rootDir: "",
    outDir: "/",
    designerDir: '/_designer/',
    paths: {

    }
}
/*interface SetupOptions: {
    
}*/
export class ConfigManage {
    static CONFIG_FILE_NAME = 'ucconfig.json';
    constructor() {
        this.json = Object.assign({}, ucConfig);
        this.json.paths = {};
    }
    /*ROOT_PATH(path?: string) { return (path != undefined ? path : this.json.rootPath); } */

    private NODE_MODULE(rootpath: string = this.json.rootDir) {
        return rootpath + '/node_modules';
    }

    private getSubModuleConfigPath(moduleName: string, rootpath: string = this.json.rootDir) {
        return (rootpath + '/node_modules/' + moduleName + "/" + ConfigManage.CONFIG_FILE_NAME).toFilePath();
    }
    private isSubModuleConfigExist(moduleName: string, rootpath: string = this.json.rootDir) {
        return fs.existsSync(this.getSubModuleConfigPath(moduleName, rootpath));
    }
    private readSubModuleConfig(moduleName: string, rootpath: string = this.json.rootDir) {
        if (this.isSubModuleConfigExist(moduleName, rootpath)) {
            let _pth = this.getSubModuleConfigPath(moduleName, rootpath);
            try {
                return JSON.parse(fs.readFileSync(_pth, 'binary'));
            } catch {
                console.log(_pth);
                return undefined;
            }
        } return undefined;
    }

    private getPackageJsonPath(rootpath: string = this.json.rootDir) { return rootpath + '/package.json'.toFilePath(); }
    private isPackageJsonExist(rootpath: string = this.json.rootDir) { return fs.existsSync(this.getPackageJsonPath(rootpath)); }
    private readPackage(rootPath: string = this.json.rootDir): {} | undefined {
        return this.isPackageJsonExist(rootPath) ? JSON.parse(fs.readFileSync(this.getPackageJsonPath(rootPath), 'binary')) : undefined;
    }

    private getUcConfigPath(rootpath: string = this.json.rootDir) { return (rootpath + '/' + ConfigManage.CONFIG_FILE_NAME).toFilePath(); }
    private isUcConfigExist(rootpath: string = this.json.rootDir) { return fs.existsSync(this.getUcConfigPath(rootpath)); }
    private readConfig(rootPath: string = this.json.rootDir): UcConfig | undefined {
        return this.isUcConfigExist(rootPath) ? JSON.parse(fs.readFileSync(this.getUcConfigPath(rootPath), 'binary')) : undefined;
    }
    writeConfig(cfg?: UcConfig): boolean {
        if (cfg == undefined) cfg = this.json;
        if (cfg == undefined || !fs.existsSync(cfg?.rootDir)) return false;
        let rpath = this.getUcConfigPath(cfg.rootDir);
        fs.writeFileSync(rpath, JSON.stringify(cfg, null, 4), 'binary');
    }
    private getConfig(dirpath: string): { package: {}, isNewConfig: boolean, outputDir: string, rootDir: string } | undefined {
        let isPackageFound = false;
        let _rootDir = dirpath;
        do {
            if (!this.isPackageJsonExist(_rootDir)) {
                _rootDir = path.dirname(dirpath);
                if (!fs.existsSync(_rootDir)) break;
            }
            else isPackageFound = true;
        } while (!isPackageFound);
        if (!isPackageFound) return undefined;
        else {
            let packageData = this.readPackage(_rootDir);
            if (packageData != undefined) {
                let opPath = path.dirname(packageData['main']);
                let orignalRootDir = _rootDir;
                if (opPath == '.') { // IF OUTPUT DIR IS SAME AS ROOT DIR
                    opPath = '/';
                } else {
                    orignalRootDir = orignalRootDir.trimText_('/' + opPath);
                    let orignalPackageData = this.readPackage(orignalRootDir);
                    if (orignalPackageData != undefined) {
                        packageData = orignalPackageData;
                        opPath = path.dirname(packageData['main']);
                    }
                }
                let dta = this.readConfig(orignalRootDir);
                let isNewConfig = dta == undefined;
                this.json = isNewConfig ? this.json : dta;
                return { package: packageData, isNewConfig: isNewConfig, outputDir: opPath, rootDir: orignalRootDir };
            }
            return undefined;
        }
    }
    updateAliceList(writeConfig = true) {
        let jsn = this.json;
        let moduleDirPath = this.NODE_MODULE();
        if (!fs.existsSync(moduleDirPath)) return;
        let fileFolders = fs.readdirSync(moduleDirPath);
        let existingPaths = Object.values(jsn.paths);
        for (let i = 0; i < fileFolders.length; i++) {
            const moduleName = fileFolders[i];
            //if (['ucbuilder', 'uccontrols', 'sharepnl'].includes(moduleName)) debugger;
            let re: UcConfig = this.readSubModuleConfig(moduleName);
            if (re != undefined) {
                let npath = 'node_modules/' + moduleName;
                if (existingPaths.indexOf(npath) == -1) {
                    jsn.paths[re.projectName] = npath;
                    existingPaths.push(npath);
                }
            }
        }
        if (writeConfig) this.writeConfig();
    }
    json: UcConfig;
    isNewGenerated = false;
    setbypath(dirpath: string) {
        dirpath = dirpath.toFilePath();
        //console.log(dirpath);
        let cinf = this.getConfig(dirpath);
        if (cinf != undefined) {
            let jsn = this.json;
            cinf.isNewConfig = cinf.isNewConfig;
            if (cinf.isNewConfig) {
                jsn.outDir = cinf.outputDir;
                jsn.rootDir = cinf.rootDir;
                jsn.paths[jsn.projectName] = './';
                jsn.projectName = cinf.package['name'];
                this.updateAliceList();
            }
        }
    }
}
function register(dirpath: string, pera?: RootPathParam): ConfigManage {
    //console.log('BOLO AMBE MATAKI JAY...\nstarted..');
    let outPutDir = dirpath;
    let config = new ConfigManage();
    config.setbypath(dirpath);
    ucr.registar(config.json, pera);
    return config;
    //console.log(fpath);

};
export default register;
register(__dirname, {
    addModule: false
});