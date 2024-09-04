"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tptOptions = exports.templatePathOptions = exports.ucOptions = exports.sourceOptions = exports.sessionOptions = exports.rootPathParam = void 0;
const objectOpt_1 = require("ucbuilder/global/objectOpt");
exports.rootPathParam = {
    level: 4,
    addIntoFileDataBankAlso: true,
    addModule: true,
    buildOption: {
        addPathInProjectBuild: true,
        removeSomeSpecialPathFromProjectBuild: true
    },
};
exports.sessionOptions = {
    addNodeToParentSession: false,
    loadBySession: false,
    uniqueIdentity: "",
};
exports.sourceOptions = {
    nodeNameAs: 'wrapper',
    targetElementNodeName: "as",
    templateName: "",
    reloadKey: "",
    reloadDesign: false,
    beforeContentAssign: (content) => {
        return content;
    },
};
exports.ucOptions = {
    mode: 'client',
    session: objectOpt_1.newObjectOpt.clone(exports.sessionOptions),
    source: objectOpt_1.newObjectOpt.clone(exports.sourceOptions),
    events: {
        beforeInitlize: (uc) => {
        },
    },
};
exports.templatePathOptions = {
    name: "",
    mainFilePath: "",
    htmlContents: "",
    cssContents: "",
};
exports.tptOptions = {
    source: objectOpt_1.newObjectOpt.clone(exports.sourceOptions),
};
