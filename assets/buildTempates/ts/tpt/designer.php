<?php for(let i=0;i<designer.importClasses.length;i++){ let $rw=designer.importClasses[i]; 
?>import { <?= $rw.names.map(s=>s.asText).join(',') ?> } from "<?=$rw.url?>";
<?php } ?>

    
<?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
type <?=$tpt.name?>_ELEMENT_MAP = { <?php for(let i=0;i<$tpt.controls.length;i++){ let $rw=$tpt.controls[i]; ?>
    <?=$rw.nameQT?> : <?=$rw.proto?><?=$rw.generic?>,<?php } ?>}
class <?=$tpt.name?>_TEMPLATE extends TemplateNode{
    constructor(tpt:Template) { super(tpt);   }
   
    getAllControls(elementHT?: HTMLElement): <?=$tpt.name?>_ELEMENT_MAP {
        return this.extended.getAllControls(undefined,elementHT) as <?=$tpt.name?>_ELEMENT_MAP;
    }
}
<?php } ?>



export const cMap_<?=src.name?>: {
    <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
    <?=$tpt.name?>?: <?=$tpt.name?>_ELEMENT_MAP;
    <?php } ?>
} = {};

export class <?=designer.className ?> extends <?= baseClassName ?> {
    /** <?=src.mainBase.rootWithExt?>
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH = '<?=htmlFilePath?>'; //window.atob('<?=src.mainFileRootPath_btoa?>');
    public static get FILE_PATH() {
        return this._FILE_PATH;
    }
    
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: ITptOptions): <?=src.name?> { 
        return intenseGenerator.generateTPT(this.FILE_PATH,<?=src.name?>,import.meta.url,pera) as <?=src.name?>;
    }
    static async CreateAsync(pera: ITptOptions): Promise<<?=src.name?>> {
        return await intenseGenerator.generateTPTAsync(this.FILE_PATH, <?=src.name?>, import.meta.url, pera);
    }
     
    <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
    public&nbsp;<?=$tpt.name?>:<?=$tpt.name?>_TEMPLATE;<?php } ?>
    

     private _tptOpt: ITptOptions;
    constructor(args: IArguments) {
        let aargs = Template.extractArgs(arguments);
        let fargs = aargs[aargs.length - 1] as ITptOptions;
        super(fargs);   
        this._tptOpt = fargs;
    }

     async initializecomponentAsync(){ 
        let fargs  = this._tptOpt; delete this._tptOpt;
        //this.extended.parentUc = fargs.parentUc;
        //let fargs = Template.extractArgs(arguments) as TptOptions;
        if(fargs.MakeEmptyTemplate)return;
        //fargs = fargs[fargs.length-1] as TptOptions;
        //let ext = this.extended;
        let oot = Template.GetObjectOfTemplate(fargs.cfInfo);
        let tpts = oot.tptObj;
       
        <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
        this.<?=$tpt.name ?> = new <?=$tpt.name ?>_TEMPLATE(this); // ext._templeteNode as <?=$tpt.name?>_TEMPLATE;
        this.<?=$tpt.name?>.extended.initializecomponent(fargs,tpts['<?=$tpt.name?>']); 
        <?php } ?>

        if (oot.outerCSS.trim() != '')
            this.pushTemplateCss(oot.outerCSS,fargs.cfInfo.pathOf['.scss']);

        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
        //console.log(oot.outerCSS);
        //fargs.elementHT.remove();
    }
    initializecomponent(){ 
        let fargs  = this._tptOpt; delete this._tptOpt;
        //this.extended.parentUc = fargs.parentUc;
        //let fargs = Template.extractArgs(arguments) as TptOptions;
        if(fargs.MakeEmptyTemplate)return;
        //fargs = fargs[fargs.length-1] as TptOptions;
        //let ext = this.extended;
        let oot = Template.GetObjectOfTemplate(fargs.cfInfo);
        let tpts = oot.tptObj;
       
        <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
        this.<?=$tpt.name ?> = new <?=$tpt.name ?>_TEMPLATE(this); // ext._templeteNode as <?=$tpt.name?>_TEMPLATE;
        this.<?=$tpt.name?>.extended.initializecomponent(fargs,tpts['<?=$tpt.name?>']); 
        <?php } ?>

        if (oot.outerCSS.trim() != '')
            this.pushTemplateCss(oot.outerCSS,fargs.cfInfo.pathOf['.scss']);

        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
        //console.log(oot.outerCSS);
        //fargs.elementHT.remove();
    }
}