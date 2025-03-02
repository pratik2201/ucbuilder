import { builder } from "ucbuilder/build/builder";
import { TptOptions, UcOptions } from "ucbuilder/enumAndMore";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { ResourcesUC } from "ucbuilder/ResourcesUC";
import { Template } from "ucbuilder/Template";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { SourceCodeNode } from "ucbuilder/build/common";


export class UcRendarer {
  fInfo: codeFileInfo | undefined;
  ucParams: typeof UcOptions = UcOptions;
  tptParams: typeof TptOptions = TptOptions;
  build: builder = new builder();
  output: SourceCodeNode;
  constructor() {}

  init(fInfo: codeFileInfo, parentUc: Usercontrol) {
    this.fInfo = fInfo;
    this.ucParams = newObjectOpt.clone(UcOptions);
    ResourcesUC.rendrarCounter++;
    let tname: string = this.fInfo.name;
    tname = `<${tname}></${tname}>`;
    this.ucParams.cfInfo = this.fInfo;
    this.ucParams.parentUc = parentUc;
   
    this.ucParams.targetElement = tname.$() as HTMLElement;
    //this.ucParams.source.reloadDesign = true;
    //this.ucParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;

    this.tptParams = newObjectOpt.clone(TptOptions);
    this.tptParams.cfInfo = this.fInfo;
    this.tptParams.parentUc = parentUc;
    //this.tptParams.elementHT = tname.$();
    //this.tptParams.source.reloadDesign = true;
    //this.tptParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;
  }

  generateUC(htmlContents: string, cssContent: string): Usercontrol {
    this.ucParams.source.htmlContents = htmlContents;
    this.ucParams.source.cssContents = cssContent;
    this.ucParams.mode = 'designer';
    let desCode: Usercontrol | undefined = undefined;
    this.output = this.build.getOutputCode(this.fInfo, htmlContents);
    eval(`
      ${this.output.designerCode} 
      desCode = new designer([this.ucParams]); 
    `);
    return desCode;
  }

  generateTpt(htmlContents: string, cssContent: string): Template {
    /*this.tptParams.source.htmlContents = htmlContents;
    this.tptParams.source.cssContents = cssContent;*/
    let desCode: Template = undefined;
   /* this.output = this.build.getOutputCode(this.fInfo, htmlContents);
    eval(`
      ${this.output.designerCode} 
      desCode = new designer([this.tptParams]); 
    `);*/
    return desCode;
  }
}