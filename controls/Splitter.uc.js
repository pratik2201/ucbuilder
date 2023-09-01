const { objectOpt, controlOpt } = require('@ucbuilder:/build/common.js');
const { boxHandler } = require('@ucbuilder:/controls/Splitter.uc.boxHandler.js');
const { spliterType, splitterRow,splitterCell } = require('@ucbuilder:/controls/Splitter.uc.enumAndMore.js');
const { splitersGrid } = require('@ucbuilder:/controls/Splitter.uc.splitersGrid.js');
const { intenseGenerator } = require('@ucbuilder:/intenseGenerator.js');

const { designer } = require('./Splitter.uc.designer.js');
class Splitter extends designer {
    SESSION_DATA = {

        /** @type {splitterCell[]}  */
        measurement: [],
        attribList: "",
        type: spliterType.NOT_DEFINED,

        
    };
    allowSplitRow = true;
    allowSplitColumn = true;
    allowResizeRow = true;
    allowResizeColumn = true;
    generateNode = true;
    constructor() {
        eval(designer.giveMeHug);

        this.tree.init(this.mainContainer, this);
        this.tree.type = this.SESSION_DATA.type;
        this.ucExtends.Events.loadLastSession.on(() => {
            this.loadSession();
        });
        
    }
    get length() {
        let len = 0;
        this.tree.allElementHT.forEach(ele => {
            /** @type {boxHandler}  */
            let bx = ele.data('box');
            let val = bx.uc.length;
            if (val != undefined) len += val;
        });
        return len;
    }
    pushPrimaryContainer() {
        let row = this.navoNodeMoklo(this.tree);

        this.tree.pushBox(row.box);
        this.tree.refresh();
    }
    gapSize = 0;
    minSizeValue = 20;
    tree = new splitersGrid();

    get myPropertiesText() {
        return controlOpt.xPropToAttr(this.ucExtends.self);
    }

    loadSession() {


        this.tree.type = this.SESSION_DATA.type;

        this.SESSION_DATA.measurement.forEach(node => {
            let sadoNode = this.sadoNodeMoklo(this.tree);
            this.ucExtends.passElement(node);
           
            this.mainContainer.appendChild(sadoNode.node);
            let elementHT = `<e${node.attribList}></e>`.$();
            let ucs = intenseGenerator.generateUC(node.ucPath, {
                wrapperHT: elementHT,
                session:{ loadBySession:true },
                parentUc: this
            });
           
            sadoNode.view.appendChild(ucs.ucExtends.self);
            sadoNode.box.uc = ucs;

            sadoNode.view.appendChild(ucs.ucExtends.self);
            //console.log(node.session);
            ucs.ucExtends.session.setSession(node.session[""]);
        });

        this.tree.resizer.giveResizer();

    }

    containerList = [
        "@ucbuilder:/controls/tabControl.uc.html"
    ];
    primaryContainer = "@ucbuilder:/controls/tabControl.uc.html";
    /** @param {splitersGrid} splGrid */
    sadoNodeMoklo(splGrid) {
        /** @type {HTMLElement}  */
        let node = '<node></node>'.$();
        /** @type {HTMLElement}  */
        let view = '<view></view>'.$();
        node.appendChild(view);
        this.ucExtends.passElement(node);
        let box = new boxHandler();
        node.data('box', box);
        box.init(splGrid, node, view);
        return {
            node: node,
            view: view,
            box: box
        };
    }
    /** @param {splitersGrid} splGrid */
    navoNodeMoklo(splGrid) {
        let sadoNode = this.sadoNodeMoklo(splGrid);
        let ucs = intenseGenerator.generateUC(this.primaryContainer, { parentUc: this });
        
        sadoNode.view.appendChild(ucs.ucExtends.self);
        sadoNode.box.uc = ucs;
        /**   AA LE... MOKLYO */
        return {
            node: sadoNode.node,
            view: sadoNode.view,
            box: sadoNode.box,
        }
    }
    /**
     * @param {spliterType} type
     * @returns {Splitter}
     */
    navuGridMoklo(type = spliterType.NOT_DEFINED) {
        /** @type {HTMLElement}  */
        let elementHT = `<Splitter x:SESSION_DATA.type="'${type}'"  ${this.myPropertiesText}  ></Splitter>`.$();
        elementHT.setAttribute("x:generateNode", false);
        /** @type {Splitter}  */
        let uc = intenseGenerator.generateUC("@ucbuilder:/controls/Splitter.uc.html", {
            wrapperHT: elementHT,
            parentUc: this
        });
       
        /**   AA LE... MOKLYU */
        return uc;
    }
}
module.exports = Splitter;