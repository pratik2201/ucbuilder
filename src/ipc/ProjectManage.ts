import { correctpath, getMetaUrl, IPC_API_KEY, IResolvePathResult, PreloadFullFill, ProjectRowBase, resolvePathObject } from "./enumAndMore.js";
import { ProjectRowR } from "./enumAndMore.js";
import { IpcRendererHelper } from "./IpcRendererHelper.js";
import { nodeFn } from "../nodeFn.js";

export class ProjectManage {
    static projects: ProjectRowR[] = [];
    static PROJECT_COUNTER = 0;
    static PROJECT_PATH = "";
    static wu: PreloadFullFill;
    static init() {
        this.PROJECT_PATH = IpcRendererHelper.ucConfig.projectPath;
        this.wu = window[IPC_API_KEY].fullFill;
        this.FILL_PROJECTS(IpcRendererHelper.ucConfig as any);
    }

    static FILL_PROJECTS(_project: ProjectRowR): ProjectRowR {
       // console.log(_project);
        //return;
        let newProject = Object.assign(new ProjectRowR(), _project);
        newProject.id = ProjectManage.PROJECT_COUNTER++;
        ProjectManage.projects.push(newProject);
        let childs: ProjectRowR[] = [];
        for (let i = 0, iObj = _project.children, ilen = iObj.length; i < ilen; i++) {
            childs.push(ProjectManage.FILL_PROJECTS(iObj[i]));
        }
        newProject.children = childs;
        return newProject;
    }
    /*static getMetaUrl(fullPath: string) {
        fullPath = correctpath(fullPath);
        return this.projects.find(row => fullPath.startsWith(row.projectPath))?.importMetaURL;
    }*/
    static getInfoByProjectPath(path: string): ProjectRowR | undefined {
        let findex = this.projects.findIndex(s => nodeFn.path.isSamePath(path,s.projectPath));
        if (findex == -1) return undefined;
        return this.projects[findex];
    }
    static getInfoByAlices(alices: string): ProjectRowR | undefined {

        let findex = this.projects.findIndex(s => alices["#equalIgnoreCase"](s.projectPrimaryAlice));
        if (findex == -1) return undefined;
        return this.projects[findex];
    }
    static getInfo(_path: string, callerMetaUrl: string): IResolvePathResult | undefined {
        return resolvePathObject(_path, callerMetaUrl, ProjectManage.projects,undefined, nodeFn.path as any, nodeFn.url as any);
    }
    static resolve(filePath: string, importMetaUrl: string): string {
        importMetaUrl = importMetaUrl ?? getMetaUrl<ProjectRowR>(filePath, this.projects);
        return resolvePathObject(filePath, importMetaUrl, ProjectManage.projects,undefined, nodeFn.path as any, nodeFn.url as any)?.result;
    }

}
