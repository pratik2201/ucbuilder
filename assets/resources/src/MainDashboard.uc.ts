import { MainDashboard$Designer } from '../assets/designer/src/MainDashboard.uc.designer.js';
export class MainDashboard extends MainDashboard$Designer{
    constructor() { super(); this.initializecomponent(arguments, this); }
    /**
     * USE 
     * $(params){     
     *      //...
     * } METHOD TO DECLARE YOUR `constructor` 
     * THIS METHOD CALLED AFTER COMPLETE INITIALIZATION WITH ARGUMENTS PASSED in static `Create` Method
     */
    $(){
        this.ucExtends.fileInfo.projectInfo.defaultLoadAt = this.maincontent1;
    }
}

