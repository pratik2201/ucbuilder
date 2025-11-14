# ucbuilder
:Shree Ganeshay Namah:<br />
**App Builder** – A modular UI framework for Electron-based applications.

---
# 🚀 Create Project
`Node Version 22.9.0` require (I Tested). ``you can test earliar or later version``

DOWNLOAD FILE `ucbuilderProjectGenerator.bat` FROM GIVEN Gdrive URL [here](https://drive.google.com/file/d/18rEZEAbY7zFthC_rQ_gwYNeAAvgZJPuQ/view?usp=drive_link)
. made for spoon-fed

move `ucbuilderProjectGenerator.bat` to the place where you want your new project and run (double click the file)

**give your answer for 2 given question** 

```bash
========================================
  Electron + ucbuilder Setup Tool
========================================

Enter your project name: 
Enter Electron version (e.g. 31.6.0,blank for latest):
```

now it should start initlize and install dependancies.
wait untill finish all installation.

open project in editor (**vscode** recommanded (`direct opened if exist`))

run the command 
```bash
npm run rebuild; npm start;
```
it will show basic dashboard in window..

**your project is ready to develope**

---
Quick Introduction Youtube : [here](https://www.youtube.com/watch?v=3ZUkDqP6DQU)
---
# 🚀 Instructions

***FILE TYPES*** <br>
---
***Usercontrol*** 
(single ui with multiple child `Usercontrols`)
--
*.uc.html `(html code)`<br>
*.uc.scss `(style code for perticular file)`<br>
*.uc.designer.ts `(auto-generated file include controls)`<br>
*.uc.ts `(typescript code file)`<br>

**inheritance**<br>
class `MainDashboard` -> class `MainDashboard$Designer` -> class `Usercontrol`<br>
(MainDashboard.uc.ts)&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;(MainDashboard.uc.designer.ts)

***Template*** (multiple ui repeator)
--
*.tpt.html `(html code)`
*.tpt.scss `(style code for perticular file)`
*.tpt.designer.ts `(auto-generated file include controls)`
*.tpt.ts `(typescript code file)`

**inheritance**<br>
class `itemRow` -> class `itemRow$Designer` -> class `Template`<br>
(itemRow.uc.ts)&nbsp; &nbsp;  &nbsp;&nbsp;(itemRow.uc.designer.ts)

***IPC handling*** (handle main and renderer bridge)
--
 
filename.ts `for renderer process`
```ts
import { IpcRendererHelper } from "ucbuilder/out/ipc/IpcRendererHelper.js";
const renderer = IpcRendererHelper.Group(import.meta.url);
function readJson(_path:string): company$model {
  return renderer.sendSync("readJson", [_path]);
}
```
filename.ipc.ts  `for main process`
```ts
import { IpcMainGroup } from "ucbuilder/out/ipc/IpcMainHelper.js";
import fs from "fs";
const main = IpcMainGroup(import.meta.url);
main.On("readJson", (e,_path) => {
    e.returnValue = fs.readFileSync(_path, 'binary');
});
```
***NOTE*** all `*.ipc.ts` files must be loaded before renderer process start execute.

(this process is done automatically on firsttime `import` the file)

you can define these paths manually by adding paths in `ucconfig.json` file  string property named `preloadMain`

all the file's described in `preloadMain` property will be loaded.

***OTHER MAIN FILES***
--

Program.ts `(starting point of renderer process (browser,web ui))`
```ts
import { MainDashboard } from "./src/MainDashboard.uc.js";

const frm = MainDashboard.Create({
  targetElement: document.body  // where you want load usercontrol
});
frm.ucExtends.show(); // this will load `MainDashboard` into targetElement
```
Program.styles.scss `(global style for current project)`

Program.main.ts `(starting point of node where electron setup done.)`

Program.preload-renderer.ts `(this file loaded just before Program.ts)`

Program.preload.cjs `(main process preload script. it should commonJs (.cjs))`

Program.viewer.html `(main page that loaded in window)`

---
**example**

MainDashboard.uc.designer.ts  (this file generate on build designer)
```ts
import { Usercontrol } from "ucbuilder/out/Usercontrol.js";
import { intenseGenerator } from "ucbuilder/out/intenseGenerator.js";
import { IUcOptions } from "ucbuilder/out/enumAndMore.js";
import { VariableList } from "ucbuilder/out/StylerRegs.js";
import { topMenu } from "../../../src/MainDashboard/topMenu.uc.js"; // other userconctrol
import { leftMenu } from "../../../src/MainDashboard/leftMenu.uc.js"; // 
import { footerMenu } from "../../../src/MainDashboard/footerMenu.uc.js"; 
import { MainDashboard } from "../../../src/MainDashboard.uc.js"; // codefile ref.



export class MainDashboard$Designer extends Usercontrol {    
    private static _FILE_PATH = '../../../src/MainDashboard.uc.html'; 
    public static get FILE_PATH() {
        return this._FILE_PATH;
    }
    public static get AbsolutePath() {
        return Usercontrol.Resolver(import.meta.url, this.FILE_PATH);
    }
    static get designerToCode(): string {
        return Usercontrol.designerToCode;
    }
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }   
    static Create(pera: IUcOptions, ...args: any[]): MainDashboard { 
        /**  */
        return intenseGenerator.generateUC(this.FILE_PATH,MainDashboard,import.meta.url,pera,...args) as MainDashboard;
    }
    static async CreateAsync(pera: IUcOptions, ...args: any[]): Promise<MainDashboard> {
        return (await intenseGenerator.generateUCAsync( this.FILE_PATH, MainDashboard, import.meta.url, pera, ...args)) as MainDashboard;
    }
    get(id:"") {
        return this.ucExtends.find(`[id="${id}"]`)[0];
    }

    public topmenu1: import('../../../src/MainDashboard/topMenu.uc.js').topMenu;
    public leftmenu1: import('../../../src/MainDashboard/leftMenu.uc.js').leftMenu;
    public maincontent1: HTMLElement;
    public footerMenu1: import('../../../src/MainDashboard/footerMenu.uc.js').footerMenu;
    
    
    constructor(){ super(); }

    async initializecomponentAsync(args: IUcOptions, form: MainDashboard) {
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        let CONTROLS = ucExt.controls;        
        await Usercontrol.GenerateControls(this,args,args.cfInfo.pathOf[".js"]);        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
    }

    initializecomponent(argsLst: IArguments, form: MainDashboard) {
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions;
        let ucExt = this.ucExtends; 
        ucExt.initializecomponent(args);         
        let CONTROLS = ucExt.controls;
         //   Initialize child components
        this.topmenu1 = topMenu.Create({       
                parentUc : this, 
                mode:args.mode,
                accessName:"topmenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"topmenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.topmenu1 as any
            });
        this.topmenu1.ucExtends.show();
        // .... SAME FOR OTHER 2 Usercontrols
        this.maincontent1 = CONTROLS.maincontent1  as unknown as HTMLElement;
       
        

        //   finalize current 
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;

    }
}
```
MainDashboard.uc.ts
```ts
import { MainDashboard$Designer } from '../assets/designer/src/MainDashboard.uc.designer.js';  // generate on build  
export class MainDashboard extends MainDashboard$Designer{
    constructor() { super(); this.initializecomponent(arguments, this); }
    
    $(args:any){    // this method user to define construction call
        this.topmenu1.lnkHome.innerText = 'Dashboard';  // access child uc's link button
    }
}
```
***CSS STYLES***
---

**Note** : stylesheet code `.scss` is treat as `.css` just file extenstion changed. <br>


---






