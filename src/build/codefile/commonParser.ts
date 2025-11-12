import { ITemplatePathOptions } from "../../enumAndMore.js";
import { FilterContent } from "../../global/filterContent.js";
import { ATTR_OF } from "../../global/runtimeOpt.js";
import { SpecialExtEnum, ucUtil } from "../../global/ucUtil.js";
import { IUCConfigPreference } from "../../ipc/enumAndMore.js";
import { ProjectRowR } from "ucbuilder/ipc/enumAndMore.js";
import { nodeFn } from "../../nodeFn.js";
import { Template } from "../../Template.js";
import { Usercontrol } from "../../Usercontrol.js";
import { builder } from "../builder.js";
import { CommonRow, Control, ImportClassNode } from "../buildRow.js";
import { codeFileInfo } from "../codeFileInfo.js";
import { ScopeType, objectOpt } from "../common.js";
import { TemplateMaker } from "../regs/TemplateMaker.js";
import { commonGenerator } from "./commonGenerator.js";
export interface PathReplacementNode { findPath: string, replaceWith: string }
export class commonParser {

    reset() {
        this.rows.length = 0;
        this.pathReplacement.length = 0;
    }
    rows: CommonRow[] = [];
    pathReplacement: PathReplacementNode[] = [];
    pushReplacement({ findPath = '', replaceWith = "" }: PathReplacementNode) {
        let index = this.pathReplacement.findIndex(s => s.findPath["#equalIgnoreCase"](findPath));
        if (index == -1) this.pathReplacement.push({ findPath: findPath, replaceWith: replaceWith });
        else this.pathReplacement[index].replaceWith = replaceWith;
        //console.log(this.pathReplacement);

    }
    bldr: builder;
    gen: commonGenerator;
    constructor(bldr: builder) {
        this.bldr = bldr;
        this.gen = new commonGenerator();
        this.project = this.bldr.project;
        this.PREFERENCE = this.project.config.preference;
        //this.UC_BUILDER_DIRECTORY = this.project.aliceToPath['ucbuilder/'];
        //this.UC_BUILDER_ALICE = this.project.pathToAlice[this.UC_BUILDER_DIRECTORY];
        this.PROJECT_PATH_LENGTH = this.project.projectPath.length;
    }
    //UC_BUILDER_DIRECTORY = "";
    //UC_BUILDER_ALICE = "";
    PREFERENCE: IUCConfigPreference;
    project: ProjectRowR;
    PROJECT_PATH_LENGTH = 0;
    init(filePath: string, htmlContents: string | undefined = undefined) {
        let row = this.fill(filePath, htmlContents);
        if (row != undefined)
            this.rows.push(row);
    }

    tmaker = new TemplateMaker('');
    //aliceMng = new AliceManager();
    _filterText = new FilterContent();
    codeHT: HTMLElement;
    fill(filePath: string, htmlContents: string | undefined = undefined): CommonRow {
        let _row = new CommonRow();
        let _this = this;
        _row.src = new codeFileInfo(codeFileInfo.getExtType(filePath));
        if (!_row.src.parseUrl(filePath, 'src', this.project.importMetaURL)) return undefined;
        let onSelect_xName = _this.bldr.Event.onSelect_xName;
        let projectPath = nodeFn.path.resolve();

        let tsToDes = nodeFn.path.relativeFilePath(_row.src.pathOf['.ts'], _row.src.pathOf['.designer.ts']);
        let DestoTs = nodeFn.path.relativeFilePath(_row.src.pathOf['.designer.ts'], _row.src.pathOf['.ts']);

        _row.codeFilePath = ucUtil.changeExtension(DestoTs, '.ts', '.js')["#toFilePath"]();
        _row.designerFilePath = ucUtil.changeExtension(tsToDes, '.ts', '.js')["#toFilePath"]();
        let code = htmlContents ?? nodeFn.fs.readFileSync(_row.src.pathOf[".html"], undefined, _row.src.projectInfo.importMetaURL);
        code = code["#devEsc"]();
        this.tmaker.mainImportMeta = nodeFn.url.pathToFileURL(filePath);
        let cccodeCallback = this.tmaker.compileTemplate(code);
        code = cccodeCallback();
        let rootpath = nodeFn.path.relative(projectPath, filePath);
        let isUserControl = _row.src.extCode == SpecialExtEnum.uc;
        let primaryChild: HTMLElement = undefined;
        try {
            if (code.trim() != '') {
                this.codeHT = code["#PHP_REMOVE"]()["#$"]();
                primaryChild = this.codeHT;
                let xAt = this.codeHT.getAttribute('x-at');
                if (xAt == null || !nodeFn.path.isSamePath(xAt, rootpath)) {
                    this.codeHT.setAttribute('x-at', rootpath);
                    _row.htmlFileContent = this.codeHT.outerHTML["#PHP_ADD"]();
                }
            } else {
                if (isUserControl) {
                    code = `<wrapper x-caption="${_row.src.name}" x-at="${rootpath}" tabindex="0">
                                <!-- DONT MODIFY "x-at" ATTRIBUTE -->
                            </wrapper>`;
                } else {
                    code = `<x:template  x-at="${rootpath}" >
                        <wrapper id="primary"></wrapper>
                        <wrapper id="header"></wrapper>
                        <wrapper id="footer"></wrapper>
                    </x:template>`;
                }
                this.codeHT = code["#$"]() as HTMLElement;
                primaryChild = this.codeHT;
                _row.htmlFileContent = code;
                ///_row.htmlFile.reGenerate = true;
            }
        } catch (ex) {
            console.log(ex);

            return undefined;
        }
        _row.codefile.className = _row.src.name;
        _row.designer.className = `${_row.codefile.className}$Designer`;
        let DESIGNER_DIR_PATH = nodeFn.path.dirname(_row.src.pathOf['.designer.ts']);
        let _ts = ucUtil.cleanNodeModulesPath(nodeFn.path.relative(DESIGNER_DIR_PATH, _row.src.pathOf['.ts']))["#toFilePath"]();
        _row.codeFilePath = ucUtil.changeExtension(_ts, '.ts', '.js');
        _row.htmlFilePath = ucUtil.changeExtension(_ts, '.ts', '.html');
        if (!isUserControl) {
            _row._extends.addImport(['Template', 'TemplateNode'], this.uc('./node_modules/ucbuilder/out/Template.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['intenseGenerator'], this.uc('./node_modules/ucbuilder/out/intenseGenerator.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['ITptOptions'], this.uc('./node_modules/ucbuilder/out/enumAndMore.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['VariableList'], this.uc('./node_modules/ucbuilder/out/StylerRegs.js', DESIGNER_DIR_PATH));
            _row.baseClassName = Template.name;
            let subTemplates: ITemplatePathOptions[];
            if (_row.htmlFileContent == undefined)
                subTemplates = Template.GetArrayOfTemplate(_row.src);
            else {
                let tob = Template.GetOptionsByContent(_row.htmlFileContent,
                    _this.gen.DEFAULT_TEMPLEATES.TS.TPT.STYLE,
                    undefined, nodeFn.url.pathToFileURL(_row.src.pathOf[".scss"]));
                subTemplates = Object.values(tob.tptObj);
            }
            let tpts = _row.designer.templetes;
            subTemplates.forEach(template => {
                let rolelwr = template.accessKey;
                if (tpts.findIndex(s => s.name["#equalIgnoreCase"](rolelwr)) != -1) return;
                let controls: Control[] = [];
                if (template.htmlContents == '' || template.htmlContents == undefined) {
                    //debugger;
                    template.htmlContents = `<wrapper   x-at="${rootpath}"  >
<!-- DONT MODIFY "x-at" ATTRIBUTE FROM PRIMARY FILE -->
</wrapper>`;
                }
                let cntHT = template.htmlContents["#PHP_REMOVE"]()["#$"]() as HTMLElement;
                if (cntHT['length'] != undefined) cntHT = cntHT[0];
                const elements = Array.from(cntHT.querySelectorAll(`[${ATTR_OF.X_NAME}]`));
                for (let i = 0, iObj = elements, len = iObj.length; i < len; i++) {
                    const element = iObj[i];
                    onSelect_xName.fire([element as HTMLElement, _row]);
                    let scope = element.getAttribute(ATTR_OF.SCOPE_KEY) as ScopeType;
                    if (scope == undefined)
                        scope = 'public';
                    let _generic = element.getAttribute('x-generic');
                    _generic = _generic == null ? '' : '<' + _generic + '>';
                    let ctr = Object.assign(new Control(), {
                        name: element.getAttribute("x-name"),
                        nodeName: element.nodeName,
                        generic: _generic,
                        proto: objectOpt.getClassName(element),
                        scope: scope,
                    });
                    //-controls.push(ctr);
                }

                tpts.push({
                    name: template.accessKey,
                    scope: "public",
                    controls: controls
                });
            });

            /*let subTemplates = Template.GetArrayOfTemplate(_row.src);

            let tpts = _row.designer.templetes;
            subTemplates.forEach(template => {
                let rolelwr = template.accessKey;
                if (tpts.findIndex(s => s.name["#equalIgnoreCase"](rolelwr)) != -1) return;
                let controls: Control[] = [];
                template.
                if (template.htmlContents == '' || template.htmlContents == undefined) {
                    //debugger;
                    template.htmlContents = `<wrapper   x-at="${rootpath}"  >
<!-- DONT MODIFY "x-at" ATTRIBUTE FROM PRIMARY FILE -->
</wrapper>`;
                }
                let cntHT = template.htmlContents["#PHP_REMOVE"]()["#$"]() as HTMLElement;
                if (cntHT['length'] != undefined) cntHT = cntHT[0];
                const elements = Array.from(cntHT.querySelectorAll(`[${ATTR_OF.X_NAME}]`));
                for (let i = 0, iObj = elements, len = iObj.length; i < len; i++) {
                    const element = iObj[i];
                    onSelect_xName.fire([element as HTMLElement, _row]);
                    let scope = element.getAttribute(ATTR_OF.SCOPE_KEY) as ScopeType;
                    if (scope == undefined)
                        scope = 'public';
                    let _generic = element.getAttribute('x-generic');
                    _generic = _generic == null ? '' : '<' + _generic + '>';
                    let ctr = Object.assign(new Control(), {
                        name: element.getAttribute("x-name"),
                        nodeName: element.nodeName,
                        generic: _generic,
                        proto: objectOpt.getClassName(element),
                        scope: scope,
                    });
                    controls.push(ctr);
                }

                tpts.push({
                    name: template.accessKey,
                    scope: "public",
                    controls: controls
                });
            });*/
        } else {
            _row.baseClassName = Usercontrol.name;
            let outHT = code["#devEsc"]()["#PHP_REMOVE"]()["#$"]() as HTMLElement;

            const elements = Array.from(outHT.querySelectorAll(`[${ATTR_OF.X_NAME}]`));
            let accessKeys = `"` + Array.from(this.codeHT.querySelectorAll(`[${ATTR_OF.ACCESSIBLE_KEY}]`))
                .map(s => s.getAttribute(ATTR_OF.ACCESSIBLE_KEY))
            ["#distinct"]().join(`" | "`) + `"`;
            _row.designer.getterFunk = accessKeys;

            let im = _row.designer.importClasses;

            _row._extends.addImport(['Usercontrol'], this.uc('./node_modules/ucbuilder/out/Usercontrol.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['intenseGenerator'], this.uc('./node_modules/ucbuilder/out/intenseGenerator.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['IUcOptions'], this.uc('./node_modules/ucbuilder/out/enumAndMore.js', DESIGNER_DIR_PATH));
            _row._extends.addImport(['VariableList'], this.uc('./node_modules/ucbuilder/out/StylerRegs.js', DESIGNER_DIR_PATH));
            for (let i = 0, iObj = elements, len = iObj.length; i < len; i++) {
                const element = iObj[i];
                onSelect_xName.fire([element as HTMLElement, _row]);
                let nameAttr = element.getAttribute(ATTR_OF.X_NAME);
                let nodeName = element.nodeName;
                let scope = element.getAttribute(ATTR_OF.SCOPE_KEY) as ScopeType;
                if (scope == undefined)
                    scope = 'public';
                let proto = Object.getPrototypeOf(element).constructor.name;
                let _generic = element.getAttribute('x-generic');
                _generic = _generic == null ? '' : '<' + _generic + '>';
                if (element.hasAttribute("x-from")) {
                    /* let _subpath = element.getAttribute("x-temp-path")["#devEsc"]();
                     let path = nodeFn.path.join(nodeFn.path.dirname(nodeFn.path.resolve()), _subpath)["#toFilePath"]();
                     _subpath = path["#toFilePath"]() + '.html';
                     let uFInf = new codeFileInfo(codeFileInfo.getExtType(_subpath));
                     console.log(_subpath);*/
                    //console.log(uFInf);  

                    let _subpath = element.getAttribute("x-from")["#devEsc"]();
                    _subpath = nodeFn.path.resolveFilePath(filePath, _subpath);//["#toFilePath"]();
                    let uFInf = new codeFileInfo(codeFileInfo.getExtType(_subpath));
                    uFInf.parseUrl(_subpath, 'src', filePath);

                    if (nodeFn.fs.existsSync(uFInf.pathOf[".ts"]) ||
                        nodeFn.fs.existsSync(uFInf.pathOf[".html"]) ||
                        nodeFn.fs.existsSync(uFInf.pathOf[".designer.ts"])) {
                        let ctrlNode = Object.assign(new Control(), {
                            name: nameAttr,
                            proto: proto,
                            generic: _generic,
                            scope: scope,
                            type: uFInf.extCode,
                            nodeName: uFInf.name,
                            src: uFInf,
                        });
                        let fullcodePath = uFInf.pathOf['.ts'];
                        //console.log(_row.src.pathOf);
                        
                        let nws = ucUtil.changeExtension(nodeFn.path.relativeFilePath(_row.src.pathOf['.designer.ts'], fullcodePath), '.ts', '.js');

                        ctrlNode.codeFilePath = nws; //   oldone;
                        ctrlNode.importedClassName = _row._extends.addImport([uFInf.name],
                            ctrlNode.codeFilePath)![0];
                        _row.designer.controls.push(ctrlNode);
                    }
                } else {
                    _row.designer.controls.push(Object.assign(new Control(), {
                        name: nameAttr,
                        proto: proto,
                        generic: _generic,
                        scope: scope,
                        type: 'none',
                        nodeName: nodeName,
                    }));
                }
            }
            //  console.log(_row.src.codeSrc.rootPath);
            //  console.log(im);

        }
        _row._extends.addImport([_row.src.name], _row.codeFilePath);
        return _row;
    }
    uc(_path: string, fromPath: string) {
        let fpath = nodeFn.path.join(nodeFn.path.resolve(), _path);
        return ucUtil.cleanNodeModulesPath(nodeFn.path.relative(fromPath, fpath))["#toFilePath"]();
    }





    fillDefImports(name: string, url: string, /*aliceNumber: number,*/ classList: ImportClassNode[], ctrlNode?: Control)/*: number */ {
        let _urlLowerCase = url.toLowerCase();
        let _import = classList.find(s => s.url.toLowerCase() == _urlLowerCase);
        if (_import != undefined) {
            //if (_import.names.findIndex(d => d === name) == -1) _import.names.push(name);
        } else {
            /*_import = {
                names: [name],
                url: url,
            }
            classList.push(_import);*/
        }
        if (ctrlNode != undefined) ctrlNode.importedClassName = name;
        /*let _nameLowerCase = name.toLowerCase();
        let _found = classList.find(s => s.name.toLowerCase() == _nameLowerCase);        
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
        if (ctrlNode != undefined) ctrlNode.importedClassName = name;
        classList.push(obj);
        return aliceNumber;*/
    }

}
