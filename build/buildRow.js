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
        /** @type {buildRow.control[]}  */ 
        controls:[]
    }
    static control = {
        name: "",
        /** @type {buildOptions.extType}  */
        type:  buildOptions.extType.none,
        /** @type {"private"|"protected"|"package"|"public"} */
        scope:"",

        proto:"",
        
        /** @type {codeFileInfo} */
        src: undefined,

        /** @type {string} */
        nodeName: "",
    }
 
    static commonRow = {
        /** @type {codeFileInfo}  */ 
        src : undefined,       
       
        htmlFile:{
            reGenerate:false, 
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
            
        },
        codefile : {           
            baseClassName: "",
            className: "",            
        },
    }
}
module.exports = { buildRow }