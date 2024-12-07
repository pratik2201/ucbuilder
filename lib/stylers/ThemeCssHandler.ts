
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
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
                    case "theme":
                        //if (path.indexOf('voucherexpenseitem.tpt@ledger')!=-1) debugger;
                        let themecontents = FileDataBank.readFile(path, {
                            isFullPath: false,
                            replaceContentWithKeys: true
                        });
                        themecontents = _this.match(themecontents);
                        return themecontents;
                    case "css":
                        let isGoodToAdd: boolean = LoadGlobal.isGoodToPush(path);
                        if (isGoodToAdd) {
                            let cssContents: string = _this.main.parseStyleSeperator_sub({
                                data: FileDataBank.readFile(path, {
                                    isFullPath: false,
                                    replaceContentWithKeys: true
                                }),
                            });
                            LoadGlobal.pushRow({
                                url: path,
                                stamp: _this.main.uniqStamp, //this.stamp  <-- i changed dont know why
                                reloadDesign: false,
                                cssContents: cssContents,
                            });
                        }
                        return "";
                }
            }
        );
        return rtrn;
    }
}