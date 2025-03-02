type AliceIdentifier = ":" | "-";
interface AliceRow {
    identifier?: AliceIdentifier;
    alice: string;
    path: string;
}

export class AliceManager {
    source: AliceRow[] = [];
    patterns = {
        alice: /(\w+?)([-:])$/g,
        tag: /^(\w+)+(:|-)(\w+)/gi,
    }

    constructor() { }

    fillAlices(htEle: HTMLElement) {
       
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

    getAliceInfo(HtEle: HTMLElement) {
        let ar = [...HtEle.nodeName.matchAll(this.patterns.tag)];
        let fpath = "";
        if (ar.length != 1) return undefined;

        let row = ar[0];
        let match = row[0], alice = row[1].toLowerCase(), identifier = row[2] as AliceIdentifier, controlName = row[3];

        let als = this.source.find(s => s.alice == alice);
        if (als == undefined) return undefined;

        switch (identifier) {
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