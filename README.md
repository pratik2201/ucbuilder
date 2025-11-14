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
***Usercontrol*** (single ui with multiple child `Usercontrols`)<br>
*.uc.html `(html code)`<br>
*.uc.scss `(style code for perticular file)`<br>
*.uc.designer.ts `(auto-generated file include controls)`<br>
*.uc.ts `(typescript code file)`<br>

***Template*** (multiple ui repeator)<br>
*.tpt.html `(html code)`<br>
*.tpt.scss `(style code for perticular file)`<br>
*.tpt.designer.ts `(auto-generated file include controls)`<br>
*.tpt.ts `(typescript code file)`<br>

---

Program.ts `(starting point of renderer process (browser,web ui))`

Program.styles.scss `(global style for current project)`

Program.main.ts `(starting point of node where electron setup done.)`

Program.preload-renderer.ts `(this file loaded just before Program.ts)`

Program.preload.cjs `(main process preload script. it should commonJs (.cjs))`

Program.viewer.html `(main page that loaded in window)`

---
**Note** : stylesheet code `.scss` is treat as `.css` just file extenstion changed. <br>

***INHARIT*** <br>
---
indexPage.uc.ts <br>
class `indexPage` -> class `indexPage$Designer` -> class `Usercontrol`


itemRow.tpt.ts <br>
class `itemRow` -> class `itemRow$Designer` -> class `Template`