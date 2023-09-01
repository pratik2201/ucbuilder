const { builder } = require("@ucbuilder:/build/builder");
const { tptOptions, ucOptions } = require("@ucbuilder:/enumAndMore");
const { clone } = require("@ucbuilder:/global/objectOpt");
const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
/**
 * @typedef {import ('@ucbuilder:/Template').Template} Template
 * @typedef {import ('@ucbuilder:/build/codeFileInfo').codeFileInfo} codeFileInfo
 * @typedef {import ('@ucbuilder:/Usercontrol').Usercontrol} Usercontrol
 */
class UcRendarer {
    /** @type {codeFileInfo}  */
    fInfo = undefined;
    /** @type {ucOptions}  */
    ucParams = {};
    /** @type {tptOptions}  */
    tptParams = {};
    build = new builder();
    constructor() {

    }
    
    /** 
     * @param {filepath} fInfo
     * @param {Usercontrol} parentUc
     */
    init(fInfo, parentUc) {
        this.fInfo = fInfo;        
        this.ucParams = clone(ucOptions);
        this.tptParams = clone(tptOptions);
        //this._programRef = parentUc.ucExtends.program;
        ResourcesUC.rendrarCounter++;
        let tname = this.fInfo.name;
        this.ucParams.source.fInfo = this.fInfo;
        this.ucParams.parentUc = parentUc;
        this.ucParams.wrapperHT = `<${tname}></${tname}>`.$();
        //this.ucParams.programRef = this._programRef;
        this.ucParams.source.reloadDesign = true;
        this.ucParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;
        
        this.tptParams = clone(tptOptions);
        this.tptParams.source.fInfo = this.fInfo;
        this.tptParams.parentUc = parentUc;
        this.tptParams.elementHT = `<${tname}></${tname}>`.$();
        //this.tptParams.programRef = this._programRef;
        this.tptParams.source.reloadDesign = true;
        this.tptParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;
    }
    /** 
     * @param {string} htmlContents 
     * @param {string} cssContent 
     * @returns {Usercontrol}
    */
    generateUC(htmlContents, cssContent) {
        this.ucParams.source.htmlContents = htmlContents;
        this.ucParams.source.cssContents = cssContent;

        let desCode = undefined;
        this.output = this.build.getOutputCode(this.fInfo, htmlContents);

        eval(`
        ${this.output.designerCode} 
        desCode = new designer([this.ucParams]); 
        `);
        return desCode;
    }

    /** 
     * @param {string} htmlContents 
     * @param {string} cssContent 
     * @returns {Template}
    */
    generateTpt(htmlContents, cssContent) {
        this.tptParams.source.htmlContents = htmlContents;
        this.tptParams.source.cssContents = cssContent;
        /** @type {Template}  */
        let desCode = undefined;
        this.output = this.build.getOutputCode(this.fInfo, htmlContents);

        console.log(this.output);
        eval(`
        ${this.output.designerCode} 
        desCode = new designer([this.tptParams]); 
        `);
        return desCode;
    }
}
module.exports = { UcRendarer };