"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intenseGenerator = void 0;
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const ResourcesUC_1 = require("ucbuilder/ResourcesUC");
const common_1 = require("ucbuilder/build/common");
class intenseGenerator {
    static generateUC(path, pera, ...args) {
        let param0 = Object.assign(pera, enumAndMore_1.ucOptions);
        let row = ResourcesUC_1.ResourcesUC.codefilelist.getObj(path);
        param0.source.cfInfo = row.codefileObj;
        if (param0.wrapperHT == undefined) {
            let tname = row.codefileObj.name;
            param0.wrapperHT = (param0.parentUc == undefined) ?
                ResourcesUC_1.ResourcesUC.contentHT
                :
                    param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$());
        }
        else {
            if (param0.wrapperHT.hasAttribute("x-nodeName")) {
                param0.source.nodeNameAs = param0.wrapperHT.getAttribute("x-nodeName");
                switch (param0.source.nodeNameAs) {
                    case 'targetElement':
                        param0.source.targetElementNodeName = param0.wrapperHT.nodeName;
                        break;
                    case 'random': break;
                    default:
                        param0.source.nodeNameAs = 'wrapper';
                        break;
                }
            }
        }
        args.push(param0);
        let classObj = row.obj; //Object.values(row.obj)[0] as any;
        let uc = (new (classObj)(...args));
        let ext = uc.ucExtends;
        ext.session.prepareForAutoLoadIfExist();
        ext.Events.loaded.fire();
        if (pera.loadAt != undefined)
            pera.loadAt.appendChild(uc.ucExtends.wrapperHT);
        return uc;
    }
    static getCnt(cInfo) {
    }
    static generateTPT(path, pera, ...args) {
        //let param0: TptOptions = newObjectOpt.copyProps(pera, TptOptions);
        let param0 = Object.assign(pera, enumAndMore_1.tptOptions);
        let row = ResourcesUC_1.ResourcesUC.codefilelist.getObj(path);
        param0.source.cfInfo = row.codefileObj;
        if (param0.elementHT == undefined) {
            let tname = row.codefileObj.name;
            param0.elementHT =
                (param0.parentUc == undefined) ?
                    ResourcesUC_1.ResourcesUC.contentHT :
                    param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$());
        }
        args.push(param0);
        let uc = (new (row.obj)(...args));
        return uc;
    }
    static parseTPT(val, parentUc) {
        if (common_1.objectOpt.parse(val, 'Template')) {
            return val[common_1.propOpt.ATTR.TEMPLETE_DEFAULT];
        }
        else if (common_1.objectOpt.parse(val, 'TemplateNode')) {
            return val;
        }
        else if (common_1.objectOpt.parse(val, 'String')) {
            let splval = ('' + val).split(";");
            let tpt = intenseGenerator.generateTPT(('' + val), { parentUc: parentUc });
            let res = (splval.length === 1) ?
                tpt[common_1.propOpt.ATTR.TEMPLETE_DEFAULT]
                :
                    tpt[splval[1].trim()];
            return res;
        }
    }
    static parseUC(val, parentUc) {
        if (common_1.objectOpt.parse(val, 'Usercontrol')) {
            return val;
        }
        else if (common_1.objectOpt.parse(val, 'String')) {
            return intenseGenerator.generateUC(val, { parentUc: parentUc });
        }
        else if (common_1.objectOpt.parse(val, 'HTMLElement')) {
            let _path = val.getAttribute("x-from");
            if (_path != undefined)
                return intenseGenerator.generateUC(_path, { parentUc: parentUc });
        }
    }
}
exports.intenseGenerator = intenseGenerator;
