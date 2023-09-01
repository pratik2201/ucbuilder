const { objectOpt, looping } = require('@ucbuilder:/build/common.js');
const { Usercontrol } = require('@ucbuilder:/Usercontrol.js');
const { windowStates } = require('@ucbuilder:/controls/common.js');
const { tabChilds } = require('@ucbuilder:/controls/Splitter.uc.enumAndMore.js');
const { dragHandler } = require('@ucbuilder:/controls/tabControl.uc.drag.js');
const { intenseGenerator } = require('@ucbuilder:/intenseGenerator.js');
const { designer } = require('./tabControl.uc.designer.js');
const { ResourcesUC } = require('@ucbuilder:/ResourcesUC.js');
const tabRecord = {
    caption: "",
    /** @type {HTMLElement}  */
    tabButton: undefined,
    /** @type {tabChilds}  */
    SESSION: undefined,
}
class tabControl extends designer {
    SESSION_DATA = {
        /** @type {tabChilds[]}  */
        tabChild: [],
        activeIndex: 0,
    };
    constructor() {
        eval(designer.giveMeHug);
        this.init();
        
    }
    dragHandle = new dragHandler();
    /** @type {tabRecord[]}  */
    source = [];
    init() {
        this.tpt_itemnode.init(this);
        this.ucExtends.Events.loadLastSession.on(() => {
            this.loadSession();
        });
        this.ucExtends.Events.onDataImport = (data) => {
            switch (data.type) {
                case 'uc':
                    if (objectOpt.parse(data, Usercontrol.name)) {
                        /** @type {Usercontrol}  */
                        let uc = data;
                        this.pushUc(uc);
                        this.refreshTabHeader();
                        this.tpt_itemnode.setActive(uc.ucExtends.self.index());

                        return true;
                    }
                    break;
            }
            return false;
        };
        this.dragHandle.init(this);
    }
    get length() {
        return this.tabView.children.length;
    }
    loadSession() {

        this.SESSION_DATA.tabChild.forEach(node => {
            let nuc = intenseGenerator.generateUC(node.filePath, {
                
                parentUc: this,
                session:{ loadBySession:true }
            });
            nuc.ucExtends.session.setSession(node.session[""]);
            this.pushUc(nuc);
        });
        this.refreshTabHeader();
        this.tpt_itemnode.setActive(this.SESSION_DATA.activeIndex);
    }
    /**
     * @param {Usercontrol} uc 
     * @param {number} atIndex 
     */
    pushUc(uc, atIndex = -1) {
        uc.ucExtends.windowstate = windowStates.dock;
        if (atIndex == -1)
            this.tabView.appendChild(uc.ucExtends.self);
        else {
            this.tabView.children.item(atIndex).before(uc.ucExtends.self);
        }
        uc.ucExtends.Events.activate.on(() => {
            this.tpt_itemnode.setActive(uc.ucExtends.self.index());

        });
    }
    refreshTabHeader() {
        this.tabHeader.innerHTML = "";
        this.SESSION_DATA.tabChild.length = 0;
        this.source.length = 0;
        looping.htmlChildren(this.tabView, (htEle) => {
            /** @type {Usercontrol}  */
            let uc = ResourcesUC.getBaseObject(htEle);
            let ucext = uc.ucExtends;
            /** @type {tabChilds}  */
            let ssn = objectOpt.clone(tabChilds);
            ssn.filePath = ucext.fileInfo.html.rootPath,
                ssn.fstamp = ucext.fileStamp;
            ssn.index = htEle.index();
            ssn.stamp = htEle.stamp();


            //console.log(uc.ucSession.stamp);
            //console.log(uc.ucSession.parentSource);

            uc.ucExtends.session.exchangeParentWith(ssn.session);
            this.SESSION_DATA.tabChild.push(ssn);
            let row = {
                tabName: htEle.getAttribute("x-caption"),
            };
            /** @type {tabRecord}  */
            let tab = objectOpt.clone(tabRecord);
            tab.caption = htEle.getAttribute("x-caption"),
                tab.SESSION = ssn;
            let nnode = this.tpt_itemnode.primary.generateNode(tab);
            tab.tabButton = nnode;
            uc.ucExtends.Events.afterClose.on(() => {
                this.SESSION_DATA.tabChild.splice(nnode.index(), 1);
                nnode.remove();
            });
            this.tabHeader.appendChild(nnode);

        });
        //this.dragHandle.draging.node.enter.reFill(Array.from(this.tabHeader.children),true,true);
        //this.dragHandle.draging.node.leave.reFill(Array.from(this.tabHeader.children),true,true);
    }
}
module.exports = tabControl;