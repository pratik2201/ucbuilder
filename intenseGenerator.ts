import { Usercontrol } from 'ucbuilder/Usercontrol';
import { Template } from 'ucbuilder/Template';
import { TemplateNode } from 'ucbuilder/Template';
import { newObjectOpt } from 'ucbuilder/global/objectOpt';
import { UcOptions, ucOptions, TptOptions, tptOptions, WrapperNodeNameAs } from 'ucbuilder/enumAndMore';
import { ResourcesUC } from 'ucbuilder/ResourcesUC';
import { objectOpt, propOpt } from 'ucbuilder/build/common';
import { UcRendarer } from 'ucbuilder/build/UcRendarer';
//import { createRequire, Module } from 'module';

class intenseGenerator {
    static generateUC<T = string>(path: T, pera: UcOptions, ...args: any[]): Usercontrol {
        let param0: UcOptions = newObjectOpt.copyProps(pera, ucOptions);
        let row = ResourcesUC.codefilelist.getObj(path as string);
        param0.source.cfInfo = row.codefileObj;
        
        
       /* if (param0.targetElement == undefined) {
            let tname = row.codefileObj.name;
            param0.targetElement = (param0.parentUc == undefined) ?
                ResourcesUC.contentHT
                :
                param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$()) as HTMLElement;
        }
        console.log(param0.targetElement);*/
        

        /*if (param0.targetElement == undefined) {
            let tname = row.codefileObj.name;
            param0.targetElement = (param0.parentUc == undefined) ?
                ResourcesUC.contentHT
                :                    
                param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$()) as HTMLElement;
        } else {
            if (param0.targetElement.hasAttribute("x-nodeName")) {
                param0.source.nodeNameAs = param0.targetElement.getAttribute("x-nodeName") as WrapperNodeNameAs;
                switch (param0.source.nodeNameAs) {
                    case 'targetElement': param0.source.targetElementNodeName = param0.targetElement.nodeName; break;
                    case 'random': break;
                    default: param0.source.nodeNameAs = 'wrapper'; break;
                }
            }
        }*/


        let toSend = [];
        toSend.push(...args, param0);
       console.log(args);
       
        //args.push(param0);
        let classObj = row.obj; //Object.values(row.obj)[0] as any;
        let uc: Usercontrol = (new (classObj)(...toSend));
        if (uc[0]) uc[0](args);
        uc.ucExtends.Events.loaded.fire();
        return uc;
    }

    static getCnt(cInfo: UcRendarer) {

    }

    static generateTPT(path: string, pera: TptOptions, ...args: any[]): Template {
        //let param0: TptOptions = newObjectOpt.copyProps(pera, TptOptions);
        let param0: TptOptions = Object.assign(pera, tptOptions);
        let row = ResourcesUC.codefilelist.getObj(path);
        param0.source.cfInfo = row.codefileObj;
        if (param0.elementHT == undefined) {
            let tname = row.codefileObj.name;
            param0.elementHT =
                (param0.parentUc == undefined) ?
                    ResourcesUC.contentHT :
                    param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$()) as HTMLElement;
        }
        args.push(param0);
        let uc: Template = (new (row.obj)(...args));
        return uc;
    }

    static parseTPT(val: Template | TemplateNode | String, parentUc: Usercontrol): TemplateNode {
        if (objectOpt.parse(val as object, 'Template')) {
            return val[propOpt.ATTR.TEMPLETE_DEFAULT] as TemplateNode;
        } else if (objectOpt.parse(val as object, 'TemplateNode')) {
            return val as TemplateNode;
        } else if (objectOpt.parse(val, 'String')) {
            let splval: string[] = ('' + val).split(";");
            let tpt = intenseGenerator.generateTPT(('' + val), { parentUc: parentUc });
            let res = (splval.length === 1) ?
                tpt[propOpt.ATTR.TEMPLETE_DEFAULT]
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