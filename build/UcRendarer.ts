
import builder = ucbuilder.build;
import { tptOptions, ucOptions } from "@ucbuilder:/enumAndMore";
import { newObjectOpt } from "@ucbuilder:/global/objectOpt";
import { ResourcesUC } from "@ucbuilder:/ResourcesUC";
namespace ucbuilder.build.rendering {
    interface Template {
        // define the properties of the Template interface
    }

    interface codeFileInfo {
        // define the properties of the codeFileInfo interface
    }

    interface Usercontrol {
        // define the properties of the Usercontrol interface
    }

    export class UcRendarer {
        fInfo: codeFileInfo | undefined;
        ucParams: ucOptions = {};
        tptParams: tptOptions = {};
        build: builder = new builder();
        output: string = "";
        constructor() { }

        init(fInfo: codeFileInfo, parentUc: Usercontrol) {
            this.fInfo = fInfo;
            this.ucParams = newObjectOpt.clone(ucOptions);
            ResourcesUC.rendrarCounter++;
            let tname: string = this.fInfo.name;
            this.ucParams.source.cfInfo = this.fInfo;
            this.ucParams.parentUc = parentUc;
            this.ucParams.wrapperHT = `<${tname}></${tname}>`.$();
            this.ucParams.source.reloadDesign = true;
            this.ucParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;

            this.tptParams = newObjectOpt.clone(tptOptions);
            this.tptParams.source.cfInfo = this.fInfo;
            this.tptParams.parentUc = parentUc;
            this.tptParams.elementHT = `<${tname}></${tname}>`.$();
            this.tptParams.source.reloadDesign = true;
            this.tptParams.source.reloadKey = "" + ResourcesUC.rendrarCounter;
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
            this.tptParams.source.htmlContents = htmlContents;
            this.tptParams.source.cssContents = cssContent;
            let desCode: Template | undefined = undefined;
            this.output = this.build.getOutputCode(this.fInfo, htmlContents);
            eval(`
      ${this.output.designerCode} 
      desCode = new designer([this.tptParams]); 
    `);
            return desCode;
        }
    }
}