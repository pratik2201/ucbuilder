
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { RootPathRow } from "ucbuilder/global/findAndReplace";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { StampNode } from "ucbuilder/lib/StampGenerator";
import { patternList, StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";

export class ThemeCssHandler {
    main: StylerRegs;
    constructor(main: StylerRegs) {
        this.main = main;
    }
    match(rtrn: string): string {
        let _this = this;
        rtrn = rtrn.replace(
            patternList.themeCSSLoader,
            (match: string, code: string, quationMark: string, path: string, offset: any, input_string: string) => {
                switch (code) {
                    case "use":
                        //if (path.indexOf('voucherexpenseitem.tpt@ledger')!=-1) debugger;
                        let themecontents = FileDataBank.readFile(path, {
                            isFullPath: false,
                            replaceContentWithKeys: true
                        });
                        themecontents = _this.match(themecontents);
                        return themecontents;
                    case "import":
                        //console.log(path);
                        let node: RootPathRow = rootPathHandler.getInfo(path);//rootPathHandler.convertToRow(row, true);
                        node.isAlreadyFullPath = true;
                        let stpSrc = StampNode.registerSoruce({
                            key: path,
                            root: node,
                            accessName: '',
                        });
                        if (!stpSrc.cssCode.hasContent) {
                            stpSrc.cssCode.load(
                                FileDataBank.readFile(path, { replaceContentWithKeys: true })
                            );
                            stpSrc.cssCode.content = stpSrc.styler.parseStyleSeperator_sub({
                                data: stpSrc.cssCode.originalContent,
                            });
                        }
                        stpSrc.loadCSS();
                        /*let isGoodToAdd: boolean = LoadGlobal.isGoodToPush(path);
                        if (isGoodToAdd) {
                            let cssContents: string = _this.main.parseStyleSeperator_sub({
                                data: FileDataBank.readFile(path, {
                                    isFullPath: false,
                                    replaceContentWithKeys: true
                                }),
                            });
                            LoadGlobal.pushRow({
                                url: path,
                                stamp: _this.main.LOCAL_STAMP_KEY, //this.stamp  <-- i changed dont know why
                                 cssContents: cssContents,
                                 reloadDesign: false,
                                });
                        }*/
                        return "";
                }
            }
        );
        return rtrn;
    }
}