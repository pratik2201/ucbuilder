"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codefileHandler = void 0;
const codeFileInfo_1 = require("./codeFileInfo");
class row {
}
class codefileHandler {
    constructor() {
        this.nodes = [];
        this.usageCount = 0;
    }
    getObj(path) {
        let codefileObj = new codeFileInfo_1.codeFileInfo(codeFileInfo_1.codeFileInfo.getExtType(path));
        codefileObj.parseUrl(path);
        let index = this.exist(codefileObj);
        this.usageCount++;
        if (index == -1) {
            let node = new row();
            node.codefileObj = codefileObj;
            let reqval = require(codefileObj.codeSrc.fullPath);
            node.obj = reqval[codefileObj.name]; //Object.values(reqval)
            this.nodes.push(node);
            return node;
        }
        else {
            return this.nodes[index];
        }
    }
    exist(codefileObj) {
        return this.nodes.findIndex(s => s.codefileObj.code.rootPath == codefileObj.code.rootPath);
    }
}
exports.codefileHandler = codefileHandler;
