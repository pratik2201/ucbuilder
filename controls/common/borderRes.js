const { arrayOpt, uniqOpt } = require("@ucbuilder:/build/common");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { dragingMode } = require("@ucbuilder:/controls/common");

class borderRes {
    constructor() { }
    /** @type {HTMLElement[]}  */ 
    list = [];
    fill() {
        this.list.push(this.resizer.left);
        this.list.push(this.resizer.top);
        this.list.push(this.resizer.right);
        this.list.push(this.resizer.bottom);
        this.list.push(this.resizer.topleft);
        this.list.push(this.resizer.topright);
        this.list.push(this.resizer.bottomleft);
        this.list.push(this.resizer.bottomright);
    }
    /** @param {HTMLElement} ele */
    hide = (ele) => {
        arrayOpt.removeByCallback(this.list, (s) => {
            return s.is(ele);
        });
    };
    resizer = {
        /** @type {HTMLElement}  */ 
        left: `<resizer role="left"></resizer>`.$(),
         /** @type {HTMLElement}  */ 
        top: `<resizer role="top"></resizer>`.$(),
         /** @type {HTMLElement}  */ 
        right: `<resizer role="right"></resizer>`.$(),
         /** @type {HTMLElement}  */ 
        bottom: `<resizer role="bottom"></resizer>`.$(),

         /** @type {HTMLElement}  */ 
         topleft: `<corner role="topleft"></corner>`.$(),
         /** @type {HTMLElement}  */ 
         topright: `<corner role="topright"></corner>`.$(),
         /** @type {HTMLElement}  */ 
         bottomleft: `<corner role="bottomleft"></corner>`.$(),
         /** @type {HTMLElement}  */ 
         bottomright: `<corner role="bottomright"></corner>`.$(),
    };
    /** @type {Usercontrol}  */ 
    ownerUc = undefined;
   /**
    * @param {dragingMode} mode 
    * @param {MouseEvent} event 
    */
    onChangeMode = (mode,event) => { }
   /**
    * @param {HTMLElement} uc 
    * @param {string} stamp 
    */
    add = (uc,stamp) => {
        this.stamp = stamp;
        this.list.forEach(s=>(uc.appendChild(s)));
        this.on();
    };
    stamp = uniqOpt.guidAs_;
    remove= () => {
        let resizer = this.resizer;
        this.list.forEach(s=>s.remove());            
        this.off();

    }
    on = () => {
        
        let resizer = this.resizer;

        resizer.left.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeLeft,event); });
        resizer.right.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeRight,event); });
        resizer.top.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeTop,event); });
        resizer.bottom.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeBottom,event); });

        resizer.topleft.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeTopLeft,event); });
        resizer.topright.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeTopRight,event); });
        resizer.bottomleft.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeBottomLeft,event); });
        resizer.bottomright.on(`mousedown.${this.stamp}`, (event) => { this.onChangeMode(dragingMode.resizeBottomRight,event); });

    }
    off = () => {
        let resizer = this.resizer;
        resizer.left.off(`mousedown.${this.stamp}`);
        resizer.right.off(`mousedown.${this.stamp}`);
        resizer.top.off(`mousedown.${this.stamp}`);
        resizer.bottom.off(`mousedown.${this.stamp}`);

        resizer.topleft.off(`mousedown.${this.stamp}`);
        resizer.topright.off(`mousedown.${this.stamp}`);
        resizer.bottomleft.off(`mousedown.${this.stamp}`);
        resizer.bottomright.off(`mousedown.${this.stamp}`);
    }
}
module.exports = { borderRes };