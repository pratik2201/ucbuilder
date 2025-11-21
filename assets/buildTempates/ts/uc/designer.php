<?php for(let i=0;i<designer.importClasses.length;i++){ let $rw=designer.importClasses[i]; 
?>import { <?= $rw.names.map(s=>s.asText).join(',') ?> } from "<?=$rw.url?>";
<?php } ?>


export class <?=designer.className ?> extends <?= baseClassName ?> {    
    private static _FILE_PATH = '<?=htmlFilePath?>'; 
    public static get FILE_PATH() {
        return this._FILE_PATH;
    }
    public static get AbsolutePath() {
        return Usercontrol.Resolver(import.meta.url, this.FILE_PATH);
    }
    static get designerToCode(): string {
        return Usercontrol.designerToCode;
    }
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }   
    static Create(pera: IUcOptions, ...args: any[]): <?=src.name ?> { 
        /** <?=src.mainBase.rootWithExt?> */
        return intenseGenerator.generateUC(this.FILE_PATH,<?=src.name?>,import.meta.url,pera,...args) as <?=src.name?>;
    }
    static async CreateAsync(pera: IUcOptions, ...args: any[]): Promise<<?=src.name ?>> {
        return (await intenseGenerator.generateUCAsync( this.FILE_PATH, <?=src.name ?>, import.meta.url, pera, ...args)) as <?=src.name ?>;
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
            <?=$rw.scope?>&nbsp;<?=$rw.nameQT?>: import('<?=$rw.codeFilePath?>').<?=$rw.src.name?>;
    <?php   break;
            case ".uc": ?>
            <?=$rw.scope?>&nbsp;<?=$rw.nameQT?>: import('<?=$rw.codeFilePath?>').<?=$rw.src.name?>;
    <?php   break; 
        }
    } ?>
    
    constructor(){ super(); }

    async initializecomponentAsync(args: IUcOptions, form: <?=src.name?>) {
        /*let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions; */
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        await Usercontrol.GenerateControls(this,args,args.cfInfo.pathOf[".js"]/*Usercontrol.Resolver(args.source.htmlImportMetaUrl ?? import.meta.url,<?=designer.className ?>.FILE_PATH)*/);
       
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
    }

    initializecomponent(/*argsLst: IArguments,*/args: IUcOptions, form: <?=src.name?>) {
        //return;
        /*let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions; */
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        <?php 
        for(let i=0;i<designer.controls.length;i++){  let $rw=designer.controls[i];
            switch($rw.type){ ?>
                <?php case "none": ?>
        this<?=$rw.nameThis?> = CONTROLS<?=$rw.nameThis?>  as unknown as <?=$rw.proto?>;<?php   break; ?>
                <?php case ".tpt": ?>
        this<?=$rw.nameThis ?> = <?=$rw.importedClassName?>.Create({ 
            parentUc: this, 
            accessName:"<?=$rw.name?>" , 
            elementHT :CONTROLS<?=$rw.nameThis?> as any
        });<?php   break; ?>
                <?php case ".uc": ?>
        this<?=$rw.nameThis?> = <?=$rw.importedClassName?>.Create({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"<?=$rw.name?>" , 
                //session:{
                //    loadBySession:args.session.loadBySession,
                //    uniqueIdentity:"<?=$rw.name?>" , 
                //    addNodeToParentSession:true,
                //},    
                targetElement : CONTROLS<?=$rw.nameThis?> as any
            });
        this<?=$rw.nameThis ?>.ucExtends.show({decision : 'replace'});<?php   break;  

            }
        }
        ?>
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;

    }
}