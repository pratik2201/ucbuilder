const { codeFileInfo } = require("@ucbuilder:/build/codeFileInfo")
const { buildOptions } = require("@ucbuilder:/build/common")

class buildRow {
    static templeteControls = {
        name:"",
        nodeName:"",
        /** @type {"private"|"protected"|"package"|"public"} */
        scope:"",

        proto:"",
        
    };
    static templete = {
        name: "",

        /** @type {"private"|"protected"|"package"|"public"} */
        scope:"",
        /** @type {buildRow.templeteControls[]}  */ 
        controls:[]
    }
    static control = {
        name: "",
        /** @type {buildOptions.controlType}  */
        type: buildOptions.controlType.elementHT,
        /** @type {"private"|"protected"|"package"|"public"} */
        scope:"",

        proto:"",
        

        /** @type {codeFileInfo} */
        src: undefined,

        /** @type {string} */
        nodeName: "",
    }
   /* static refer = {
        name: [],
        sepName: "",
        filePath: "",
        useBrackets: false,
        relativePath: "",
    }*/
    static commonRow = {
        /** @type {codeFileInfo}  */ 
        src : undefined,       
       
        htmlFile:{
            reGenerate:false, 
            //stamp:"",
            content:"",        
        },

        designer : {            
            extType : "",
            /**
            * BASE CLASS OF CURRENT CLASS I.E Usercontrol
            */
            baseClassName: "",
            className: "",
            /** @type {buildRow.templete[]} */
            templetes : [],
            /** @type {buildRow.control[]} */
            controls: [],
            /**  @type {buildRow.refer[]} 
             * refList: [],*/
        },
        codefile : {           
            baseClassName: "",
            className: "",            
        },
    }
}
module.exports = { buildRow }