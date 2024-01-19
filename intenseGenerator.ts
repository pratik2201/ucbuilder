import { Usercontrol } from 'ucbuilder/Usercontrol';
import { Template } from 'ucbuilder/Template';
import { TemplateNode } from 'ucbuilder/Template';
import { newObjectOpt } from 'ucbuilder/global/objectOpt';
import { UcOptions,ucOptions, TptOptions,tptOptions, WrapperNodeNameAs } from 'ucbuilder/enumAndMore';
import { ResourcesUC } from 'ucbuilder/ResourcesUC';
import { objectOpt, propOpt } from 'ucbuilder/build/common';
import { UcRendarer } from 'ucbuilder/build/UcRendarer';

class intenseGenerator {
    static generateUC(path: string, pera: UcOptions, ...args: any[]): Usercontrol {
        let param0: UcOptions = Object.assign(pera, ucOptions);
        let row = ResourcesUC.codefilelist.getObj(path);
        param0.source.cfInfo = row.codefileObj;
        if (param0.wrapperHT == undefined) {
            let tname = row.codefileObj.name;
            param0.wrapperHT = (param0.parentUc == undefined) ?
                ResourcesUC.contentHT
                :                    
                param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$()) as HTMLElement;
        } else {
            if (param0.wrapperHT.hasAttribute("x-nodeName")) {
                param0.source.nodeNameAs = param0.wrapperHT.getAttribute("x-nodeName") as WrapperNodeNameAs;
                switch (param0.source.nodeNameAs) {
                    case 'targetElement': param0.source.targetElementNodeName = param0.wrapperHT.nodeName; break;
                    case 'random': break;
                    default: param0.source.nodeNameAs = 'wrapper'; break;
                }
            }
        }
        args.push(param0);
        let uc: Usercontrol = (new (row.obj)(...args));
        let ext = uc.ucExtends;
        ext.session.prepareForAutoLoadIfExist();
        ext.Events.loaded.fire();
        if (pera.loadAt != undefined) pera.loadAt.appendChild(uc.ucExtends.wrapperHT);
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
            let splval: string[] = (''+val).split(";");
            let tpt = intenseGenerator.generateTPT((''+val), { parentUc: parentUc });
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