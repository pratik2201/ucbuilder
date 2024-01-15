const aliceRow = {
    /** @type {":"|"-"}  */
    identifier: "",
    /** @type {string}  */
    alice: "",

    path: "",
};
class aliceManager {
    /** @type {aliceRow[]}  */
    source = [];
    patterns = {
        alice: /(\w+?)([-:])$/g,
        tag: /^(\w+)+(:|-)(\w+)/gi,
    }
    constructor() { }
    /** @param {HTMLElement} htEle */
    fillAlices(htEle) {
        this.source = [];        
        let alsPtn = this.patterns.alice;
        Array.from(htEle.attributes)
            .forEach(attr => {
                let ar = [...attr.nodeName.matchAll(alsPtn)];
                ar.forEach(row => {
                    let alice = row[1];
                    this.source.push({
                        path: attr.value,
                        alice: alice
                    })
                })
            });
    }

    /** 
     * @param {HTMLElement} HtEle
     */
    getAliceInfo(HtEle) {
        /** @type {string[]}  */ 
        let ar = [...HtEle.nodeName.matchAll(this.patterns.tag)];
        let fpath = "";
        if (ar.length != 1) return undefined;
        
        let row = ar[0];
        let match = row[0],alice = row[1].toLowerCase(),  identifier = row[2], controlName = row[3];
        
        let als = this.source.find(s => s.alice == alice);
        if (als == undefined) return undefined;
        
        switch (match.identifier) {
            case ':':
                fpath = als.path + '/' + controlName + ".uc";
                break;
            case '-':
                fpath = als.path + '/' + controlName + ".tpt";
                break;
        }
        return {
            controlName: controlName,
            identifier: identifier,
            fullPath: als.path + "/" + controlName + "." + (identifier == ':' ? "uc" : "tpt"),
        }
    }
}
module.exports = { aliceManager };