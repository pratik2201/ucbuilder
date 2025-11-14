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

this is **SINGLE WINDOW** App system.  

***BUILD DESIGNER*** <br>
---
designer build process done in render process (in browser)
default is ctrl+F12 in browser it will log 
`build start` and `build successfull..`
you can set keybinding in `ucconfig.json` file
 
***FILE TYPES*** <br>
---
ucconfig.json <br>
```json
{
    "$schema": "./node_modules/ucbuilder/config$schema.json",
    "browser":{
        "importmap": { 
            // path alices for (render process) for browser only 
        } 
    }, 
    "developer": {       
        "build": {
            "ignorePath": [],  // add path which will be ignore during designer build
            "buildPath": ".", // path to build
            "keyBind": 
            // key binding to start build process default is (ctrl+F12)
            { 
                "keyCode": 123, 
                "altKey": false,
                "ctrlKey": true,
                "shiftKey": false,            
            }
        }
    },
    "preference": {        
       "jsDir": "out", 
       //output dir where output file store
       
       "tsDir": "",
       // sourcecode dir
       
       "designerDir": "assets/designer", 
        //designer dir where designer file store
        //this path is sub directory of `jsDir` and `tsDir`
        // i.e tsDir = "src" , designerDir = "assets/designer"
        // finalpath will = `src/assets/designer` same for out
    },
    "preloadMain": // this (.ipc.ts) files will load in main process before renderer load
    [ 
    ],
     "env": "developer", // this is under construction
     "type": "ts", // this is under construction   
}
```

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
***HTML Files***

in `html` file there are some special extra attibute

**x-name**<br>
`x-name` attibute used to access element or loaded usercontrol in codefile 
same you can set `id` attibute to element and get access in codefile
 
**x-from**<br>
this attibute stand for load usercontrol at the place of element

**x-tabindex**<br> 
attibute stand for define tab order 
here you can define any child elements tab order from `0` index inside each `closest parent element` element with x-tabindex.

**x-caption**<br> 
attibute stand for set title to window  

MainDashboard.uc.html<br>
```html
<wrapper x-caption="Form1" x-at="src\MainDashboard.uc.html" tabindex="0">
    <div class="layout">
        <topmenu x-from="MainDashboard/topMenu.uc.html" x-name="topmenu1"></topmenu>
        <leftmenu x-from="MainDashboard/leftMenu.uc.html" x-name="leftmenu1"></leftmenu>
        <main class="main-content" x-name="maincontent1"></main>
        <footermenu x-from="MainDashboard/footerMenu.uc.html" x-name="footerMenu1"></footermenu>
    </div>
</wrapper>
```
***CSS STYLES***
`.scss` file treat here as `.css` file just some changes

**&** selector has 2 meaning<br> 
`&`  = is root element of perticular usercontrol <br> 
`&topmenu1` = `&` followed by `x-name of usercontrol` will be apply to that usercontrol
  ```html
  <wrapper>
      <topmenu x-from="MainDashboard/topMenu.uc.html" x-name="topmenu1"></topmenu>  
  </wrapper>
  ```
  ```scss
  & { background-color:green; }  
  // this will select current `wrapper`

  &topmenu1 { background-color:blue; } 
  // this will select `wrapper` of topmenu1 usercontrol

  &topmenu1 .logo { background-color:yellow; } 
  // this will select element with `logo` class inside topmenu1 usercontrol
  ```
**VARIABLE** (VARIABLE Startwith,`$l-`,`$g-`,`$i-`)
 
**$l-** (local variable)<br>
    local variable only apply inside `current usercontrol`.
    `will not be` applied in `child usercontrol`.

**$i-** (internal variable)<br>
    internal variable apply to `any element` inside current usercontrol's

**$g-** (global variable)<br>
    global variable apply to any element belong to current project.
    will not be applied to `included project's elements`


```scss
$l-fontColor:blue;  // local variable (start with  `$l-`,`$g-`,`$i-` define it's scope)
&{
    display:block; position: absolute;
    background-color: rgb(240,240,240); 
    border:solid 1px black; 
    width: 100%; height: 100%;  overflow: hidden;
}
h2{
    font-family: Arial, Helvetica, sans-serif; display: block;  font-size: medium; color: $l-fontColor; padding: 5px; padding-left: 15px; 
    background-color: $g-title_background;  
    margin: 0px;
}
.layout { 
  overflow: hidden; display: grid;
  grid-template-columns: 150px auto;
  grid-template-rows: max-content auto max-content;
}
&topmenu1 {
    grid-column: span 2;
}
&footerMenu1 {
    grid-column: span 2;
}
```






