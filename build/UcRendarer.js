"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UcRendarer = void 0;
const builder_1 = require("ucbuilder/build/builder");
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const objectOpt_1 = require("ucbuilder/global/objectOpt");
const ResourcesUC_1 = require("ucbuilder/ResourcesUC");
class UcRendarer {
    constructor() {
        this.ucParams = enumAndMore_1.ucOptions;
        this.tptParams = enumAndMore_1.tptOptions;
        this.build = new builder_1.builder();
    }
    init(fInfo, parentUc) {
        this.fInfo = fInfo;
        this.ucParams = objectOpt_1.newObjectOpt.clone(enumAndMore_1.ucOptions);
        ResourcesUC_1.ResourcesUC.rendrarCounter++;
        let tname = this.fInfo.name;
        tname = `<${tname}></${tname}>`;
        this.ucParams.source.cfInfo = this.fInfo;
        this.ucParams.parentUc = parentUc;
        this.ucParams.wrapperHT = tname.$();
        this.ucParams.source.reloadDesign = true;
        this.ucParams.source.reloadKey = "" + ResourcesUC_1.ResourcesUC.rendrarCounter;
        this.tptParams = objectOpt_1.newObjectOpt.clone(enumAndMore_1.tptOptions);
        this.tptParams.source.cfInfo = this.fInfo;
        this.tptParams.parentUc = parentUc;
        this.tptParams.elementHT = `<${tname}></${tname}>`.$();
        this.tptParams.source.reloadDesign = true;
        this.tptParams.source.reloadKey = "" + ResourcesUC_1.ResourcesUC.rendrarCounter;
    }
    generateUC(htmlContents, cssContent) {
        this.ucParams.source.htmlContents = htmlContents;
        this.ucParams.source.cssContents = cssContent;
        this.ucParams.mode = 'designer';
        let desCode = undefined;
        this.output = this.build.getOutputCode(this.fInfo, htmlContents);
        eval(`
      ${this.output.designerCode} 
      desCode = new designer([this.ucParams]); 
    `);
        return desCode;
    }
    generateTpt(htmlContents, cssContent) {
        this.tptParams.source.htmlContents = htmlContents;
        this.tptParams.source.cssContents = cssContent;
        let desCode = undefined;
        this.output = this.build.getOutputCode(this.fInfo, htmlContents);
        eval(`
      ${this.output.designerCode} 
      desCode = new designer([this.tptParams]); 
    `);
        return desCode;
    }
}
exports.UcRendarer = UcRendarer;
