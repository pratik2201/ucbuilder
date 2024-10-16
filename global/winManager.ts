import { uniqOpt, controlOpt } from 'ucbuilder/build/common';
import { FocusManager } from 'ucbuilder/global/focusManage';
import { Usercontrol } from 'ucbuilder/Usercontrol';
//import { winFrame } from '../../uccontrols/controls/winFrame.uc';

export class winContiner {
    static source: any[] = [];
    static randomName: string = 'w' + uniqOpt.randomNo();
    // static mng = new winManager();
    // static getManager(node: HTML;Element, frame: winFrame): winManager {
    //     let rtrn: winManager = node.data(this.randomName);
    //     if (rtrn == undefined) {
    //         rtrn = new winManager(/*node, */frame);
    //         node.data(this.randomName, rtrn);
    //     }
    //     return rtrn;
    // }
}

export class winManager {
    //mainNode: HTMLElement;
    static curIndex: number = 0;
    static CURRENT_WIN: Usercontrol;
    static pages: Usercontrol[] = [];
    static focusMng: FocusManager = new FocusManager();

    static transperency: HTMLElement = document.createElement("transperencyBack"); //undefined;
    // constructor(/*mainNode: HTMLElement, */frame: winFrame) {
    //    // this.mainNode = mainNode;
    //     frame.ucExtends.passElement(this.transperency);
    // }

    static push = (form: Usercontrol): void => {
        let _this = this;
       
        if (_this.CURRENT_WIN != undefined) {
            this.setfreez(true, _this.CURRENT_WIN.ucExtends.self);
        }
       
        _this.CURRENT_WIN = form;
        _this.pages.push(_this.CURRENT_WIN);
        _this.curIndex = _this.pages.length - 1;
        //console.log(form.ucExtends.wrapperHT.isConnected);
        /*form.ucExtends.Events.loaded.on(() => {
           
            form.ucExtends.wrapperHT.before(this.transperency);
        })*/
    }

    static pop = (): void => {
        this.curIndex = this.pages.length - 1;
        // 
        if (this.curIndex >= 0) {
            this.pages.pop();
            this.curIndex--;
            this.CURRENT_WIN = this.pages[this.curIndex];
            if (this.CURRENT_WIN != undefined) {
                let _wrapperHT = this.CURRENT_WIN.ucExtends.self;
                _wrapperHT.before(this.transperency);
                this.setfreez(false, _wrapperHT);
                return;
            }
        }
        this.transperency.remove();
        this.CURRENT_WIN = undefined;
    }

    static ATTR = {
        DISABLE: {
            NEW_VALUE: "disnval" + uniqOpt.randomNo(),
            OLD_VALUE: "disoval" + uniqOpt.randomNo(),
        }
    }

    static setfreez = (freez: boolean, element: HTMLElement): void => {
        if (freez) {
            this.focusMng.fetch();
            element.setAttribute('active', '0');
            let eles = element.querySelectorAll(controlOpt.ATTR.editableControls);
            eles.forEach(
                (e: HTMLElement) => {
                    let disableAttr = e.getAttribute("disabled");
                    if (disableAttr != null) e.data(winManager.ATTR.DISABLE.OLD_VALUE, disableAttr);
                    e.setAttribute('disabled', 'true');
                    e.setAttribute(winManager.ATTR.DISABLE.NEW_VALUE, 'true');
                });

        } else {
            element.setAttribute('active', '1');
            let eles = element.querySelectorAll(`[${winManager.ATTR.DISABLE.NEW_VALUE}]`);
            eles.forEach(
                (e: HTMLElement) => {
                    let disableAttr = e.data(winManager.ATTR.DISABLE.OLD_VALUE);
                  //  console.log(element);
                  //  console.log(disableAttr);

                    if (disableAttr != undefined) e.setAttribute('disabled', disableAttr);
                    else e.removeAttribute('disabled');
                    // e.removeAttribute('disabled', winManager.ATTR.DISABLE.NEW_VALUE);
                });
            this.focusMng.focus();
        }
    }
}