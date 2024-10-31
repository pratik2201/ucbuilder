import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { CommonRow } from "ucbuilder/build/buildRow";
import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { objectOpt, uniqOpt } from "ucbuilder/build/common";
import { regsManage } from "ucbuilder/build/regs/regsManage";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import fs from "fs";

export class rfileGenerator {

    constructor() {
        this.rgxManage = new regsManage();

        this.key = uniqOpt.guidAs_;
        this.Uc_TREE_Template = FileDataBank.readFile('ucbuilder/buildTempates/uc/rfiletree.js', { replaceContentWithKeys: true, });
        this.Tpt_TREE_Template = FileDataBank.readFile('ucbuilder/buildTempates/tpt/rfiletree.js', { replaceContentWithKeys: true, });

        this.MAIN_Template = FileDataBank.readFile('ucbuilder/buildTempates/rfilemain.js', { replaceContentWithKeys: true, });        
    }
    Uc_TREE_Template: string = "";
    Tpt_TREE_Template: string = "";
    MAIN_Template: string = "";
    
    rgxManage: regsManage;
    outputdata: string;
    linker: {} = {};
    key = "";
    fill(rows: CommonRow[] = []) {
        let _this = this;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            this.fillTreeNodes(row);
        }
        //console.log(this.linker);

        this.fillHeaderAsText(this.linker);
    }
    fillTreeNodes(row: CommonRow) {
        let src = row.src;
        let pth = src.rootInfo.alices + '/' + src.partInfo.sortDirPath;
        let parted = pth.split('/');
        let obj = this.linker;
        let lobj = undefined;
        for (let i = 0; i < parted.length; i++) {
            const part = parted[i];
            if (!obj[part]) obj[part] = {};
            obj = obj[part];
            //lobj = obj[part];
        }
        obj["path"] = pth;
        obj["type"] = row.src.extCode;
        obj["row"] = row;
        obj["key"] = this.key;
    }
    fillHeaderAsText(nodes) {

        let keys = Object.keys(nodes);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.fillNameSpaceAsText(key, nodes[key])
        }

    }
    textObj: {} = {};
    fillNameSpaceAsText(alice: string, node: {}) {
        let tnode = {};
        if (!this.textObj[alice]) this.textObj[alice] = {};
        tnode = this.textObj[alice];
        let texts = this.recursiveText(alice, node);
        let wholeText = this.generateNew({ treeContent: texts }, this.MAIN_Template);
        let rInfo = rootPathHandler.getInfoByAlices(alice);
        let generateAt = (rInfo.path + '/R.ts').toFilePath();
        fs.writeFileSync(generateAt, wholeText);
        //console.log(toGenPath);
        //console.log(wholeText);
        

    }
    recursiveText(alice: string, node: {}): string {

        let keys = Object.keys(node);
        let text = "";
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (node[key].key === this.key) { //    found
                let nd = node[key];
                let rw = nd.row as CommonRow;
                //console.log(rw);
                switch (rw.src.extCode) {
                    case '.uc':
                        text += this.generateNew(rw, this.Uc_TREE_Template);
                        break;
                    case '.tpt':
                        text += this.generateNew(rw, this.Tpt_TREE_Template);
                        break;
                }
                //text += 'FOUND = ' + rw.src.html.rootPath;
            } else {
                text += key + ":{";
                text += this.recursiveText(key, node[key]);
                text += "},";
            }
        }
        return text;
    }
    private generateNew(node: {}, templateText: string) {
        let dta = templateText;
        dta = this.rgxManage.parse(node, dta);
        return dta;
    }
}