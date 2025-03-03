<?php for(let i=0;i<designer.importClasses.length;i++){ let $rw=designer.importClasses[i]; 
?>import { <?=$rw.importText?> } from "<?=$rw.url?>";
<?php } ?>
/**
 *  code filename must same and case sensitive with classname 
 */
import { <?=src.name?> } from "<?=src.mainFileRootPath?>";


export class <?=designer.className ?> extends Usercontrol {    
    private static _FILE_PATH = '<?=src.mainFileRootPath?>'; 
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    static get designerToCode(): string {
        return Usercontrol.designerToCode;
    }
    static setCSS_globalVar (varList:VariableList /*key: string, value: string*/): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: IUcOptions, ...args: any[]): <?=src.name ?> { 
        /** <?=src.mainFileRootPath?> */
        return intenseGenerator.generateUC(this.FILE_PATH,<?=src.name?>,pera,...args) as <?=src.name?>;
    }
    get(id:<?=designer.getterFunk ?>) {
        return this.ucExtends.find(`[id="${id}"]`)[0];
    }

    <?php 
    for(let i=0;i<designer.controls.length;i++){  let $rw=designer.controls[i];
        switch($rw.type){ 
            case "none": ?>
            <?=$rw.scope?>&nbsp;<?=$rw.nameQT?>: <?=$rw.proto?><?=$rw.generic?>;
    <?php   break;
            case ".tpt": ?>
            <?=$rw.scope?>&nbsp;<?=$rw.nameQT?>: import('<?=$rw.src.mainFileRootPath?>').<?=$rw.src.name?>;
    <?php   break;
            case ".uc": ?>
            <?=$rw.scope?>&nbsp;<?=$rw.nameQT?>: import('<?=$rw.src.mainFileRootPath?>').<?=$rw.src.name?>;
    <?php   break; 
        }
    } ?>
    
    constructor(){ super(); }
    initializecomponent(argsLst: IArguments, form: <?=src.name?>) {
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        <?php 
        for(let i=0;i<designer.controls.length;i++){  let $rw=designer.controls[i];
            switch($rw.type){ ?>
                <?php case "none": ?>
        this<?=$rw.nameThis?> = CONTROLS<?=$rw.nameThis?> as <?=$rw.proto?>;<?php   break; ?>
                <?php case ".tpt": ?>
        this<?=$rw.nameThis ?> = <?=$rw.importedClass.objText?>.Create({ 
            parentUc: this, 
            accessName:"<?=$rw.name?>" , 
            elementHT :CONTROLS<?=$rw.nameThis?> as any
        });<?php   break; ?>
                <?php case ".uc": ?>
        this<?=$rw.nameThis?> = <?=$rw.importedClass.objText?>.Create({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"<?=$rw.name?>" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"<?=$rw.name?>" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS<?=$rw.nameThis?> as any
            });
        this<?=$rw.nameThis ?>.ucExtends.show();<?php   break;  

            }
        }
        ?>
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
    }
}