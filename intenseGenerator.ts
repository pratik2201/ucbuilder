import { objectOpt } from "ucbuilder/build/common";
import { UcRendarer } from "ucbuilder/build/UcRendarer";
import { ITptOptions, IUcOptions, TptOptions, UcOptions } from "ucbuilder/enumAndMore";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { VariableList } from "ucbuilder/lib/stylers/StylerRegs";
import { ResourcesUC } from "ucbuilder/ResourcesUC";
import { Template, TemplateNode } from "ucbuilder/Template";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
//import { createRequire, Module } from "module";

class intenseGenerator {
    static setCSS_globalVar(varList: VariableList, _path: string): void  {    
        let rt = rootPathHandler.getInfo(_path);
        rt.stampSRC.styler.__VAR.SETVALUE(varList, '' + rt.id, 'g');
    }
    static generateUC<T = string>(path: T, pera: IUcOptions, ...args: any[]): Usercontrol {
        let param0: IUcOptions = newObjectOpt.copyProps(pera, UcOptions);
        let row = ResourcesUC.codefilelist.getObj(path as string);
        param0.cfInfo = row.codefileObj;
        let toSend = [];
        toSend.push(...args, param0);
        let classObj = row.obj; //Object.values(row.obj)[0] as any;
       // console.log(toSend);
        
        let uc: Usercontrol = (new (classObj)(...toSend));
        if (uc['$']) uc['$'](args);
        //uc.ucExtends.Events.loaded.fire();
        return uc;
    }

    static getCnt(cInfo: UcRendarer) {

    }

    static generateTPT(path: string, pera: ITptOptions, ...args: any[]): Template {
        //let param0: TptOptions = newObjectOpt.copyProps(pera, TptOptions);
        let param0: ITptOptions = Object.assign(pera, TptOptions);
        let row = ResourcesUC.codefilelist.getObj(path);
        param0.cfInfo = row.codefileObj;
        /*if (param0.elementHT == undefined) {
            let tname = row.codefileObj.name;
            param0.elementHT =
                (param0.parentUc == undefined) ?
                        rootPathHandler.contentHT :
                    param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$(),{ skipTopEle:true }) as HTMLElement;
        }*/
        args.push(param0);
        let uc: Template = (new (row.obj)(...args));
        return uc;
    }

    static parseTPT(val: Template | TemplateNode | String, parentUc: Usercontrol): TemplateNode {
        if (objectOpt.parse(val as object, 'Template')) {
            return val[ATTR_OF.TEMPLETE_DEFAULT] as TemplateNode;
        } else if (objectOpt.parse(val as object, 'TemplateNode')) {
            return val as TemplateNode;
        } else if (objectOpt.parse(val, 'String')) {
            let splval: string[] = ('' + val).split(";");
            let tpt = intenseGenerator.generateTPT(('' + val), { parentUc: parentUc });
            let res = (splval.length === 1) ?
                tpt[ATTR_OF.TEMPLETE_DEFAULT]
                :
                tpt[splval[1].trim()];
            return res;
        }
    }

    static parseUC(val: Usercontrol | string | HTMLElement, parentUc: Usercontrol): Usercontrol {
        if (objectOpt.parse(val as Usercontrol, 'Usercontrol')) {
            return val as Usercontrol;
        } else if (objectOpt.parse(val as String, 'String')) {
            return intenseGenerator.generateUC(val as string, { parentUc: parentUc });
        } else if (objectOpt.parse(val as HTMLElement, 'HTMLElement')) {
            let _path = (val as HTMLElement).getAttribute("x-from") as string;
            if (_path != undefined) return intenseGenerator.generateUC(_path, { parentUc: parentUc });
        }
    }
}

export { intenseGenerator };
