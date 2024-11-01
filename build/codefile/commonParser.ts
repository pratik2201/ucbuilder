import { commonGenerator } from 'ucbuilder/build/codefile/commonGenerator';
import { codeFileInfo } from 'ucbuilder/build/codeFileInfo';
import { commonRow, CommonRow, Control, ImportClassNode } from 'ucbuilder/build/buildRow.js';
import { buildOptions, objectOpt, propOpt, ScopeType } from 'ucbuilder/build/common';
import { FilterContent } from 'ucbuilder/global/filterContent';
import { FileDataBank } from 'ucbuilder/global/fileDataBank';
import { AliceManager } from 'ucbuilder/build/codefile/aliceManager';
import { Template } from 'ucbuilder/Template';
import { builder } from 'ucbuilder/build/builder';
import { TemplatePathOptions } from 'ucbuilder/enumAndMore';
import { ResourcesUC } from 'ucbuilder/ResourcesUC';

export class commonParser {

    reset() {
        this.rows.length = 0;
        this.pathReplacement.length = 0;
    }
    rows: CommonRow[] = [];
    pathReplacement: { findPath: string, replaceWith: string }[] = [];
    pushReplacement({ findPath = '', replaceWith = '' }: { findPath: string, replaceWith: string }) {
        let index = this.pathReplacement.findIndex(s => s.findPath.equalIgnoreCase(findPath));
        if (index == -1) this.pathReplacement.push({ findPath: findPath, replaceWith: replaceWith });
        else this.pathReplacement[index].replaceWith = replaceWith;
    }
    bldr: builder;
    gen: commonGenerator;
    constructor(bldr: builder) {
        this.bldr = bldr;
        this.gen = new commonGenerator();
    }

    init(filePath: string, htmlContents: string | undefined = undefined) {
        let row = this.fill(filePath, htmlContents);
        if (row != undefined)
            this.rows.push(row);
    }

    aliceMng = new AliceManager();
    _filterText = new FilterContent();
    formHT: HTMLElement;
    fill(filePath: string, htmlContents: string | undefined = undefined): CommonRow {
        let _row = objectOpt.clone(commonRow);
        let _this = this;
        _row.src = new codeFileInfo(codeFileInfo.getExtType(filePath));
        if (!_row.src.parseUrl(filePath)) return undefined;


        //FileDataBank.readFile()

        let code = (htmlContents == undefined) ? FileDataBank.readFile(_row.src.html.rootPath, {
            replaceContentWithKeys: false,
            reloadData: true,
        }) : htmlContents;
        let isUserControl = _row.src.extCode == buildOptions.extType.Usercontrol;

        try {
            if (code.trim() != '') {
                this.formHT = code.$() as HTMLElement;
                let xAt = this.formHT.getAttribute('x-at');
                if (xAt == null || !xAt.equalIgnoreCase(_row.src.mainFileRootPath)) {
                    this.formHT.setAttribute('x-at', _row.src.mainFileRootPath);
                    _row.htmlFile.content = this.formHT.outerHTML;
                    _row.htmlFile.reGenerate = true;
                } 
            } else {
                code = `<wrapper x-caption="${_row.src.name}" x-at="${_row.src.mainFileRootPath}" tabindex="0"><!-- DONT MODIFY "x-at" ATTRIBUTE ->
</wrapper>`;
                this.formHT = code.$() as HTMLElement;
                _row.htmlFile.content = code;
                _row.htmlFile.reGenerate = true;
            }
        } catch {
            return undefined;
        }

        this.aliceMng.fillAlices(this.formHT);
        _row.designer.className =
            _row.codefile.baseClassName = "Designer";
        _row.codefile.className = _row.src.name;
        if (!isUserControl) {
            let im = _row.designer.importClasses;
            let aliceNumber = 0;
            aliceNumber = this.fillDefImports('Template, TemplateNode', 'ucbuilder/Template', aliceNumber, im);
            aliceNumber = this.fillDefImports('intenseGenerator', 'ucbuilder/intenseGenerator', aliceNumber, im);
            aliceNumber = this.fillDefImports('TptOptions, templatePathOptions', 'ucbuilder/enumAndMore', aliceNumber, im);
            aliceNumber = this.fillDefImports('VariableList', 'ucbuilder/global/stylerRegs', aliceNumber, im);

            _row.designer.baseClassName = "Template";
            let tptbyCntnt = Template.getTemplates.byDirectory(filePath) as TemplatePathOptions[];
            let tpts = _row.designer.templetes;
            tptbyCntnt.forEach(template => {
                let rolelwr = template.name;
                if (tpts.findIndex(s => s.name.equalIgnoreCase(rolelwr)) != -1) return;
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
            let im = _row.designer.importClasses;
            let aliceNumber = 0;
            aliceNumber = this.fillDefImports('Usercontrol', 'ucbuilder/Usercontrol', aliceNumber, im);
            aliceNumber = this.fillDefImports('intenseGenerator', 'ucbuilder/intenseGenerator', aliceNumber, im);
            aliceNumber = this.fillDefImports('UcOptions', 'ucbuilder/enumAndMore', aliceNumber, im);
            aliceNumber = this.fillDefImports('VariableList', 'ucbuilder/global/stylerRegs', aliceNumber, im);
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
                    //if(_row.src.fullPathWithoutExt.includes())
                    //console.log(_row.src);

                    /* let fItem = this.pathReplacement.find(s => s.findPath.equalIgnoreCase(uFInf.mainFileRootPath));
                     if (fItem!=undefined) {
                         ele.setAttribute('x-from', fItem.replaceWith);
                         _row.htmlFile.content = this.formHT.outerHTML;
                         _row.htmlFile.reGenerate = true;
                     }*/

                    //console.log(_subpath);
                    //console.log(uFInf.mainFileRootPath);
                    if (uFInf.existCodeFile || uFInf.existHtmlFile || uFInf.existDeignerFile) {
                        let ctrlNode: Control = {
                            name: nameAttr,
                            proto: proto,
                            scope: scope,
                            type: uFInf.extCode,
                            nodeName: uFInf.name,
                            src: uFInf,
                        }
                        aliceNumber = _this.fillDefImports(uFInf.name, uFInf.mainFileRootPath, aliceNumber, im, ctrlNode);
                        _row.designer.controls.push(ctrlNode);
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
            //  console.log(_row.src.codeSrc.rootPath);
            //  console.log(im);

        }

        return _row;
    }
    fillDefImports(name: string, url: string, aliceNumber: number, classList: ImportClassNode[], ctrlNode?: Control): number {
        let _found = classList.find(s => s.name.equalIgnoreCase(name))
        let aliceTxt = (_found) ? 'a' + aliceNumber++ : '';
        let obj: ImportClassNode = {
            name: name,
            alice: aliceTxt,
            url: url,
            get importText() {
                if (this.alice == '')
                    return this.name;
                else return `${this.name} as ${this.alice}`;
            },
            get objText() {
                return (this.alice == '') ? this.name : this.alice;
            }
        };
        if (ctrlNode != undefined) ctrlNode.importedClass = obj;
        classList.push(obj);
        return aliceNumber;
    }

}