import fs from "fs";
import path from "path";
import url from "url";
import { KeyboardKeys } from "../lib/hardware.js";
import { correctpath, deepAssign, GetProjectName, IDeveloperOptions, IImportMap, IPC_SPLIT_KEY, isSamePath, IUCConfigPreference, ProjectRowM, resolvePathObject, subtractPath, UserUCConfig } from "./enumAndMore.js";
import { ucUtil } from "../global/ucUtil.js";
import { ProjectFolder } from "./ProjectFolder.js";
import { buildOptions } from "../build/common.js";

export class ConfigFiller {
    MAIN_CONFIG: ProjectRowM;
    PREELOAD_IMPORT: string[] = [];
    ucConfigList: ProjectRowM[] = [];
    savePreLoadFilePath(actionKey: string) {
        let spl = IPC_SPLIT_KEY(actionKey);
        let prj = this.GetByImportMeta(spl.primaryAlicePath);
        let pth = correctpath(subtractPath(prj.projectPath, url.fileURLToPath(spl.primaryAlicePath), path));
        let configFilePath = path.join(prj.projectPath, 'ucconfig.json');
        let projectConfig: UserUCConfig = JSON.parse(fs.readFileSync(configFilePath, 'binary'));
        projectConfig.preloadMain = projectConfig.preloadMain ?? [];
        projectConfig.preloadMain.push(`{:${pth}}`);
        projectConfig.preloadMain = ucUtil.distinct(projectConfig.preloadMain);
        fs.writeFileSync(configFilePath, JSON.stringify(projectConfig, undefined, 4), 'binary');
    }
    _setRootDirecory(row: ProjectRowM, _absolutePath: string) {
        row.projectPath = _absolutePath;
        const cfg = row.config;
        let mainProjPath = path.resolve();
        row.rootPath = correctpath(path.normalize(path.relative(mainProjPath, _absolutePath)));
        row.rootPath = row.rootPath == '.' ? '.' : `./${row.rootPath}/`;
        if (row.rootPath == '.') {
            let kys = Object.keys(cfg.browser.globalAlias);
            for (let i = 0, iObj = kys, ilen = iObj.length; i < ilen; i++) {
                const iKey = iObj[i];
                const iValue = cfg.browser.globalAlias[iKey];
                const custResolve = resolvePathObject(iValue, _absolutePath, [], undefined, path, url).result;
                const trimedPath = correctpath(subtractPath(mainProjPath, custResolve, path));
                cfg.browser.globalAlias[iKey] = trimedPath;
            }
        }
        let pref = cfg.preference = cfg.preference ?? {} as IUCConfigPreference;
        row.projectPrimaryAlice = row.projectName;
        pref.designerDir = (pref.designerDir ?? "");
        pref.tsDir = (pref.tsDir ?? "");
        pref.jsDir = (pref.jsDir ?? "");


        row.directoryOfFileType[".designer.ts"] =
            row.directoryOfFileType[".designer.js"] = pref.designerDir;
        row.directoryOfType["out"] = pref.jsDir;
        row.directoryOfType["src"] = pref.tsDir;

        cfg.browser.importmap[row.projectPrimaryAlice] = '';
        cfg.preloadMain = cfg.preloadMain ?? [];
        for (let i = 0, preeloadFiles = cfg.preloadMain, ilen = preeloadFiles.length; i < ilen; i++) {
            let PTH = correctpath(path.join(row.projectPath, ucUtil.devEsc(preeloadFiles[i])));
            preeloadFiles[i] = PTH;
        }

    }
    importmap: IImportMap = {
        imports: {},
        scopes: {

        }
    };
    GetByImportMeta(fileimportMeta: string): ProjectRowM {
        return this.ucConfigList.find(cfg => fileimportMeta.startsWith(cfg.importMetaURL)) || null;
    }
    GetByAlias(primaryAlicePath: string): ProjectRowM {
        return this.ucConfigList.find(cfg => primaryAlicePath.startsWith(cfg.projectPrimaryAlice)) || null;
    }
    Fill_ImportMap(_config: ProjectRowM) {
        // let _PATH_ALICES = {}; //Object.assign({}, _config.config.pathAlias);        
        const aliases = {}; //Object.assign({}, _config.config.pathAlias);
        const pathAlias = _config.config?.browser?.importmap ?? {};
        for (let [als, relPath] of Object.entries(pathAlias)) {
            als = ucUtil.trimPath(als);
            const np = ucUtil.trimPath(correctpath(path.join(_config.rootPath, relPath)));
            aliases[`${als}/`] = `./${np}/`;
        }
        if (this.importmap.scopes[_config.rootPath] == undefined)
            this.importmap.scopes[_config.rootPath] = aliases;
        for (let i = 0, iObj = _config.children, ilen = iObj.length; i < ilen; i++) {
            const iItem = iObj[i];
            this.Fill_ImportMap(iItem);
        }
    }
    ucConfig = new ProjectRowM();
    fill(mainDirPath: string) {
        debugger;
        let projectDir = this.getProjectDir(mainDirPath);
        this.Fill_UCConfig(projectDir, this.ucConfig);
        
        
        const cfg = this.MAIN_CONFIG.config;
        cfg.developer = cfg.developer ?? new IDeveloperOptions();
        cfg.developer.build = cfg.developer.build ?? Object.assign({}, buildOptions) as any;
        cfg.developer.build.keyBind = cfg.developer.build.keyBind ?? {};
        let kb = cfg.developer.build.keyBind;
        kb = kb ?? {};
        cfg.developer.build.keyBind = kb;
        if (!kb.altKey && !kb.ctrlKey && !kb.shiftKey && !kb.keyCode) {
            kb.ctrlKey = true;
            kb.shiftKey = false;
            kb.altKey = false;
            kb.keyCode = KeyboardKeys.F12;
        }

        console.log(kb);
        

        this.PREELOAD_IMPORT = ucUtil.distinct(this.PREELOAD_IMPORT);
        this.ucConfigList.sort((a, b) => b.importMetaURL.length - a.importMetaURL.length);
        this.updateAliceToPath(this.ucConfigList);
        this.Fill_ImportMap(this.ucConfig);
    }
    updateAliceToPath(linearPushAr: ProjectRowM[]) {
        let p_path = this.MAIN_CONFIG.projectPath;
        for (let i = 0, iObj = linearPushAr, ilen = iObj.length; i < ilen; i++) {
            const iUc = iObj[i];
            for (const [pathAliasKey, pathAliasValue] of Object.entries(iUc.config.browser.importmap)) {
                let fullPath = correctpath(path.join(p_path, pathAliasValue) + '/');
                let p = linearPushAr.find(s => fullPath.startsWith(s.projectPath));
                if (p != undefined)
                    iUc.aliceToPath[pathAliasKey] = p.projectPath;
            }
        }
    }
    private Fill_UCConfig(projectDirPath: string, _ucConfig: ProjectRowM) {
        if (projectDirPath != undefined) {
            let projectName = GetProjectName(projectDirPath, path, fs);
            let ucConfigPath = path.join(projectDirPath, 'ucconfig.json');
            let ucCfg: ProjectRowM = JSON.parse(fs.readFileSync(ucConfigPath, 'binary'));
            if (ucCfg != undefined) {
                _ucConfig.config = deepAssign(_ucConfig.config ?? new UserUCConfig(), ucCfg);
                const cfg = _ucConfig.config;
                if (this.MAIN_CONFIG == undefined) this.MAIN_CONFIG = _ucConfig;
                _ucConfig.projectName = projectName;
                this._setRootDirecory(_ucConfig, correctpath(projectDirPath));
                this.PREELOAD_IMPORT.push(...cfg.preloadMain);
                this.ucConfigList.push(_ucConfig);
                _ucConfig.importMetaURL = url.pathToFileURL(projectDirPath).href;
                let dirs = this.listProjectPath(projectDirPath);
                dirs.forEach(child_project_dir => {
                    let nchild = new ProjectRowM();
                    this.Fill_UCConfig(child_project_dir, nchild);
                    _ucConfig.children.push(nchild);
                });
            }
        }
    }
    listProjectPath(projectDir: string) {
        let child_projects_dirpath = path.join(projectDir, 'node_modules');
        let child_project_dirList: string[] = [];
        if (fs.existsSync(child_projects_dirpath)) {
            let child_projects = fs.readdirSync(child_projects_dirpath);
            child_projects.forEach(project_name => {
                let child_project_configfile = path.join(child_projects_dirpath, project_name, 'ucconfig.json');
                if (fs.existsSync(child_project_configfile)) {
                    child_project_dirList.push(path.join(child_projects_dirpath, project_name));
                }
            });
        }
        return child_project_dirList;
    }

    getProjectDir(_dirPath: string) {
        let package_path = '';
        do {
            package_path = path.join(_dirPath, 'package.json');
            _dirPath = path.dirname(_dirPath);
        } while (!fs.existsSync(package_path))
        return path.dirname(package_path);
    }
}


