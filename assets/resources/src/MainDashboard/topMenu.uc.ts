import { topMenu$Designer } from "../../assets/designer/src/MainDashboard/topMenu.uc.designer.js";
import { frmHome } from "../Contents/frmHome.uc.js";
import { frmLogin } from "../Contents/frmLogin.uc.js";


export class topMenu extends topMenu$Designer {
    constructor() { super(); this.initializecomponent(arguments, this); }
    /**
     * USE 
     * $(params){     
     *      //...
     * } METHOD TO DECLARE YOUR `constructor` 
     * THIS METHOD CALLED AFTER COMPLETE INITIALIZATION WITH ARGUMENTS PASSED in static `Create` Method
     */
    $() {
        this.cmdLogin.addEventListener('mousedown', (e) => {
            let frm = frmLogin.Create({ parentUc: this });
            frm.ucExtends.showDialog();
        });
        this.lnkHome.addEventListener('mousedown', (e) => {
            let frm = frmHome.Create({ parentUc: this });
            frm.ucExtends.showDialog();
        });
    }
}

