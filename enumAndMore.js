const { newObjectOpt } = require('@ucbuilder:/global/objectOpt');

/**
 * @typedef {import ('@ucbuilder:/Usercontrol').Usercontrol} Usercontrol
 * @typedef {import ('@ucbuilder:/Template').Template} Template
 * @typedef {import ('@ucbuilder:/build/codeFileInfo').codeFileInfo} codeFileInfo 
 */

const sessionOptions = {
    addNodeToParentSession: false,
    loadBySession: false,
    uniqueIdentity: "",
};
const sourceOptions = {
    /** @type {codeFileInfo}  */
    cfInfo: undefined,

    
    /** @type {"wrapper"|"targetElement"|"random"}  */
    nodeNameAs: 'wrapper',

    targetElementNodeName: "as",


    templateName: "",

    reloadKey: "",
    reloadDesign: false,


    /** @type {string}  */
    htmlContents: undefined,

    /** @type {string}  */
    cssContents: undefined,

    /**
    * @param {string} uc content which is being Initlize for html tag  
    */
    beforeContentAssign: (uc) => {

    },
}


const ucOptions = {
    /** @type {UCGenMode}  */ 
    mode: 'client',
    session: newObjectOpt.clone(sessionOptions),
    source: newObjectOpt.clone(sourceOptions),
    /** @type {Usercontrol}  uc parent `Usercontrol` object reference */
    parentUc: undefined,
    /** @type {HTMLElement}  */
    loadAt: undefined,

    events: {
        /** @param {Usercontrol} uc uc which is being Initlize  */
        beforeInitlize: (uc) => {

        },
      
    },

    /** @type {HTMLElement}  */
    wrapperHT: undefined,

};

const templatePathOptions = {
    name: "",
    mainFilePath: "",
    htmlContents: "",
    cssContents: "",
    /** @type {Template}  */
    mainTpt: undefined,

}
const tptOptions = {
    /** @type {HTMLElement}  */
    elementHT: undefined,

    source: newObjectOpt.clone(sourceOptions),

    /** @type {Usercontrol}  */
    parentUc: undefined,


};



module.exports = {
    /** @type {'client'|'designer'}  */ 
    UCGenerateMode : 'client',
    templatePathOptions,
    rootPathParam,
    ucOptions,
    tptOptions,
    sessionOptions,
    sourceOptions,
    /** @type {"normal"|"dock"|"minimize"|"maximize"}  */
    ucStates: "normal",
}