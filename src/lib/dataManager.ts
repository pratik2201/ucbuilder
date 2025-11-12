import { GetUniqueId } from "../ipc/enumAndMore.js";

 

export class dataManager {
    source: {} = {};
    map: {} = {};
    static ATTR = {
        DM_DATA: "dm" + GetUniqueId(),
    };
    eventIncrementId: number = 0;
    elementIncrementId: number = 1;

    getId = (element: HTMLElement): rowInfo => {
        let row: rowInfo = element[dataManager.ATTR.DM_DATA];
        if (row == undefined) {
            this.elementIncrementId++;
            let _id = "id_" + this.elementIncrementId;
            row = new rowInfo();
            row.id = _id;
            //console.log(this.source);
            // console.log(this.elementIncrementId.toAlphabate()+"  ("+this.elementIncrementId+")");
            element[dataManager.ATTR.DM_DATA] = row;
            //this.source[_id] = element;
        }
        return row;
    };

    getElement(id: string): HTMLElement {
        return this.source[id];
    }

    fillObjectRef(targetObject: HTMLElement, arr: string[]): void {
        arr.push(this.getId(targetObject).id);
        for (let i = 0, iObj = targetObject.children, ilen = iObj.length; i < ilen; i++) {
            const iItem = iObj[i];
            this.fillObjectRef(iItem as HTMLElement, arr);
        }
        //looping.htmlChildren(targetObject, s => this.fillObjectRef(s, arr));
    }

    deleteObjectRef(targetObject: HTMLElement): void {
        //console.log('deleting.,');
        let keylist: string[] = [];
        this.fillObjectRef(targetObject, keylist);
        keylist.forEach(e => delete this.source[e]);
    }

    getData(targetObject: HTMLElement, key?: string): any {
        let row: rowInfo = this.getId(targetObject);
        switch (arguments.length) {
            case 2:
                return row.data[key];
            case 1:
                return row.data;
            default:
                return row;
        }
    }

    setData(targetObject: HTMLElement, key: string, value?: any): void {
        let row: rowInfo = this.getId(targetObject);
        switch (arguments.length) {
            case 3:
                row.data[key] = value;
                break;
            case 2:
                row.data = value;
                break;
        }
    }

    compareElements(ele1: HTMLElement, ele2: HTMLElement): boolean {
        return this.getId(ele1).id === this.getId(ele2).id;
    }

    initElement(target: HTMLElement & HTMLElement[]): void {
        if (target.length == undefined) {
            [target, target.querySelectorAll('*')].forEach((ele) => {
                this.getId(ele as HTMLElement);
            });
        } else {
            for (let i = 0, iObj = target, ilen = iObj.length; i < ilen; i++) {
                target = iObj[i] as any;
                [target, target.querySelectorAll('*')].forEach((ele) => {
                    this.getId(ele as HTMLElement);
                });

            }

        }
    }

    setEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, key: string, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let evt: {} = {};
        let row: rowInfo = this.getId(element);
        if (eventName in row.event) {
            evt = row.event[eventName];
            evt[key] = handler;
        } else {
            evt[key] = handler;
            row.event[eventName] = evt;
        }
        element.addEventListener(eventName, handler as any, false);
    }

    unSetEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, key?: string, handler?: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let evt: {} = {};
        if (handler == undefined) {
            let row: rowInfo = this.getId(element);
            if (eventName in row.event) {
                evt = row.event[eventName];
                if (key == undefined) {
                    Object.keys(evt).forEach(s => element.removeEventListener(eventName, evt[s], false));
                }
                else {
                    handler = evt[key];
                    element.removeEventListener(eventName as any, handler as any, false);
                }
            }
        } else element.removeEventListener(eventName as any, handler as any, false);
    }

    onHandler<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let eType: string[] = eventName.split(".");
        if (eType.length == 0) {
            this.setEvent(element, eType[0] as any, `dataManager_onHandler_${GetUniqueId()}`, handler);
        } else {
            this.setEvent(element, eType[0] as any, eType[1], handler);
        }
    }

    offHandler<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let eType: string[] = eventName.split(".");
        if (eType.length == 0) {
            this.unSetEvent(element, eType[0] as any, undefined, handler);
        } else {
            this.unSetEvent(element, eType[0] as any, eType[1], handler);
        }
    }
}
export class rowInfo {
    id: string = "";
    data: {} = {};
    event: { [key: string]: {}; } = {};
}

