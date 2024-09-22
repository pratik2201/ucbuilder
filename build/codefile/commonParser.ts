import { commonGenerator } from 'ucbuilder/build/codefile/commonGenerator';
import { codeFileInfo } from 'ucbuilder/build/codeFileInfo';
import { commonRow,CommonRow,Control } from 'ucbuilder/build/buildRow.js';
import { buildOptions, objectOpt, propOpt, ScopeType } from 'ucbuilder/build/common';
import { FilterContent } from 'ucbuilder/global/filterContent';
import { FileDataBank } from 'ucbuilder/global/fileDataBank';
import { AliceManager } from 'ucbuilder/build/codefile/aliceManager';
import { Template } from 'ucbuilder/Template';
import { builder } from 'ucbuilder/build/builder';
import { TemplatePathOptions } from 'ucbuilder/enumAndMore';

class commonParser {

    rows: CommonRow[] = [];
    bldr: builder;
    gen: commonGenerator;
    constructor(bldr: builder) {
        this.bldr = bldr;
        this.gen = new commonGenerator();
    }

    init(filePath: string, htmlContents: string | undefined = undefined) {
        let row = this.fill(filePath, htmlContents);
        if(row!=undefined)
            this.rows.push(row);
    }

    aliceMng = new AliceManager();
    _filterText = new FilterContent();
    formHT: HTMLElement;
    fill(filePath: string, htmlContents: string | undefined = undefined): CommonRow {
        let _row = objectOpt.clone(commonRow);
        _row.src = new codeFileInfo(codeFileInfo.getExtType(filePath));
        if (!_row.src.parseUrl(filePath)) return undefined;
        
        let code = (htmlContents == undefined) ? FileDataBank.readFile(_row.src.html.rootPath, {
            replaceContentWithKeys: false
        }) : htmlContents;
        let isUserControl = _row.src.extCode == buildOptions.extType.Usercontrol;
       
       
        
        
        this.formHT = code.$() as HTMLElement;
        
        this.aliceMng.fillAlices(this.formHT);
        _row.designer.className =
            _row.codefile.baseClassName = "Designer";
        _row.codefile.className = _row.src.name;
        if (!isUserControl) {
           
            
            _row.designer.baseClassName = "Template";
            let tptbyCntnt = Template.getTemplates.byDirectory(filePath) as TemplatePathOptions[];
            let tpts = _row.designer.templetes;
            tptbyCntnt.forEach(template => {
                let rolelwr = template.name.toLowerCase();
                if (tpts.findIndex(s => s.name.toLowerCase() == rolelwr) != -1) return;
                let controls: Control[] = [];
                let cntHT = template.htmlContents.$() as HTMLElement;
                let _htEleAr = Array.from(cntHT.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
                _htEleAr.forEach(e => {
                    let scope = e.getAttribute(propOpt.ATTR.SCOPE_KEY) as ScopeType;
                    if (scope == undefined)
                        scope = 'public';
                    controls.push({
                        name: e.getAttribute("x-name"),
                        nodeName: e.nodeName,
                        proto: objectOpt.getClassName(e),
                        scope: scope,
                    })
                });
                tpts.push({
                    name: template.name,
                    scope: "public",
                    controls: controls
                });
            });
        } else {
            _row.designer.baseClassName = "Usercontrol";
            let elem = Array.from(this.formHT.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
            elem.forEach((ele) => {
                let nameAttr = ele.getAttribute(propOpt.ATTR.ACCESS_KEY);
                let nodeName = ele.nodeName;
                let scope = ele.getAttribute(propOpt.ATTR.SCOPE_KEY) as ScopeType;
                if (scope == undefined)
                    scope = 'public';
                let proto = Object.getPrototypeOf(ele).constructor.name;
              
                
                if (ele.hasAttribute("x-from")) {
                   
                    let _subpath = ele.getAttribute("x-from");

                    let uFInf = new codeFileInfo(codeFileInfo.getExtType(_subpath));

                    uFInf.parseUrl(_subpath);
                    //console.log(_subpath);
                    //console.log(uFInf.mainFileRootPath);
                    

                    if (uFInf.existCodeFile || uFInf.existHtmlFile || uFInf.existDeignerFile) {
                        _row.designer.controls.push({
                            name: nameAttr,
                            proto: proto,
                            scope: scope,
                            type: uFInf.extCode,
                            nodeName: uFInf.name,
                            src: uFInf,
                        });
                    }
                } else {
                    _row.designer.controls.push({
                        name: nameAttr,
                        proto: proto,
                        scope: scope,
                        type: 'none',
                        nodeName: nodeName,
                    });
                }
            });
        }

        return _row;
    }
}

export { commonParser };