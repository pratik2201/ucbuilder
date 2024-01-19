"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templeteControl = exports.commonRow = exports.templete = exports.control = void 0;
exports.control = {
    name: "",
    type: 'none',
    scope: "public",
    proto: "",
    src: undefined,
    nodeName: "",
};
exports.templete = {
    name: "",
    scope: 'public',
    controls: [],
};
exports.commonRow = {
    src: undefined,
    htmlFile: {
        reGenerate: false,
        content: "",
    },
    designer: {
        extType: "",
        baseClassName: "",
        className: "",
        templetes: [],
        controls: [],
    },
    codefile: {
        baseClassName: "",
        className: "",
    },
};
exports.templeteControl = {
    name: "",
    nodeName: "",
    scope: "public",
    proto: "",
};
