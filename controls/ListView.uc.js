const { designer } = require('./ListView.uc.designer.js');
const { propOpt } = require('@ucbuilder:/build/common.js');
const { PageMouseEvent } = require('@ucbuilder:/appBuilder/Window/codeFile/PageManage.enum.js');
const { ListViewSource } = require("@ucbuilder:/controls/ListView.uc.enumAndMore");
const { listUiHandler } = require("@ucbuilder:/appBuilder/Window/codeFile/listUiHandler");
const { commonEvent } = require('@ucbuilder:/global/commonEvent.js');
const { TempleteNode } = require("@ucbuilder:/Template");

class ListView extends designer {
    accessKey = propOpt.ATTR.ACCESS_KEY;

    /** @type {ListViewSource}  */
    get source() {   return this.lvUI.source; }

    /** @type {TempleteNode}  */
    template = undefined;

    Events = {

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemDoubleClick: new commonEvent(),

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseDown: new commonEvent(),

        /**
         * 
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseUp: new commonEvent(),


        _this:()=> this,
        get currentItemIndexChange(){ return this._this().lvUI.Events.currentItemIndexChange; },
        get newItemGenerate(){ return this._this().lvUI.Events.newItemGenerate; }
    };

    //get listviewEvents() { return this.pageMng.PageManage_extended.Events; }

    /** @type {number} */
    topSpace = 0;
    get SESSION_DATA() {  return this.lvUI.OPTIONS.SESSION; }
    set SESSION_DATA(val) { this.lvUI.OPTIONS.SESSION = val; }
    constructor() {
        eval(designer.giveMeHug);
        this.lvUI = new listUiHandler();
        this.lvUI.init(this.listvw1, this.container1);
        this.init();
        this.ucExtends.Events.loadLastSession.on(() => {
            setTimeout(() => {
                this.lvUI.currentIndex = this.SESSION_DATA.currentIndex;
            }, 1);
        });

        this.Events.currentItemIndexChange.on((oindex, nindex, evt, evtType) => {
            if (evtType == 'Mouse') this.ucExtends.session.onModify();
        });
        this.listvw1.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemDoubleClick.fire(this.lvUI.currentIndex,e);
            }
        });
        this.listvw1.addEventListener("mousedown", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseDown.fire(this.lvUI.currentIndex,e);
            }
        });
        this.listvw1.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseUp.fire(this.lvUI.currentIndex,e);
            }
        });
    }
    get Records(){ return this.lvUI.Records; }

    init() {

        this.initListView();
    }



    initListView() {
        let _this = this;
        let uc = this.ucExtends.wrapperHT;
        uc.setAttribute('tabindex', -1);
       
        this.Records.getNode = (index) => {
          
            return _this.template.generateNode(_this.source.rows[index]);
        }
        this.lvUI.Events.newItemGenerate.on(
            /** @param {JQuery} ele */
            (ele, index) => {
                ele.setAttribute("x-tabindex", index);
            });


    }
}
module.exports = ListView;