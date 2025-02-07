<?php for(let i=0;i<designer.importClasses.length;i++){ let $rw=designer.importClasses[i]; ?>
import { <?=$rw.importText?> } from '<?=$rw.url?>';<?php } ?>
 /**
 *  code filename must same and case sensitive with classname   ---------------
 */
import { <?=src.name?> } from '<?=src.mainFileRootPath?>';

    
<?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
type <?=$tpt.name?>_ELEMENT_MAP = { <?php for(let i=0;i<$tpt.controls.length;i++){ let $rw=$tpt.controls[i]; ?>
    <?=$rw.name?> : <?=$rw.proto?><?=$rw.generic?>,<?php } ?>}
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

export class <?=designer.className ?> extends Template {
    /** <?=src.mainFileRootPath?>
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH =  '<?=src.mainFileRootPath?>'; //window.atob('<?=src.mainFileRootPath_btoa?>');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: TptOptions): <?=src.name?> { 
        return intenseGenerator.generateTPT(this.FILE_PATH,pera) as <?=src.name?>;
    }

    
    <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
    public&nbsp;<?=$tpt.name?>:<?=$tpt.name?>_TEMPLATE;<?php } ?>

    constructor(args:IArguments){    
        super();    
        let aargs = Template.extractArgs(arguments);
        let fargs = aargs[aargs.length - 1] as TptOptions;
        this.extended.parentUc = fargs.parentUc;
        //let fargs = Template.extractArgs(arguments) as TptOptions;
        
        //fargs = fargs[fargs.length-1] as TptOptions;
        let ext = this.extended;
        let tpts = Template.getTemplates.byDirectory(fargs.source.cfInfo.code.fullPath, false);
        let mtpt = Template.byHTMLFileObject(fargs.source.cfInfo);
        console.log(tpts);
        console.log(mtpt);
        console.log("--");
        <?php for(let j=0;j<designer.templetes.length;j++){ let $tpt=designer.templetes[j]; ?>
        // ext._templeteNode = new <?=$tpt.name?>_TEMPLATE(this);
        this.<?=$tpt.name ?> = new <?=$tpt.name ?>_TEMPLATE(this); // ext._templeteNode as <?=$tpt.name?>_TEMPLATE;
        this.<?=$tpt.name?>.extended.initializecomponent(fargs,tpts['<?=$tpt.name?>'],"<?=$tpt.name?>"); 
        <?php } ?>

        fargs.elementHT.remove();
    }
}