import { codeFileInfo } from "ucbuilder/build/codeFileInfo";

class row {
    codefileObj: codeFileInfo;
    obj: any;
}

export class codefileHandler {
    nodes: row[] = [];
    usageCount = 0;

    getObj(path: string): row {
        let codefileObj = new codeFileInfo(codeFileInfo.getExtType(path));
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
        } else {
            return this.nodes[index];
        }
    }

    exist(codefileObj: codeFileInfo): number {
        return this.nodes.findIndex(s => s.codefileObj.code.rootPath == codefileObj.code.rootPath);
    }
}
