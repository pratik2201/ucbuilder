import { arrayOpt, uniqOpt, objectOpt } from "ucbuilder/build/common";
import { Usercontrol } from "ucbuilder/Usercontrol";

interface EventRecord {
    callback: Function;
    stamp: string;
}
const eventRecord: EventRecord = {
    callback: () => { },
    stamp: '',
}
type ResultCallback = (returnedValue: any) => boolean;
const resultCallback: ResultCallback = (returnedValue: any) => false;
type Parameter<T> = T extends (...arg: infer T) => any ? T : never;
type CtorType<T> = { new (): T;  };  // GET CLASS REFERENCE OF GIVEN CLASS    
export class CommonEvent<F extends (...arg: any) => void> {
    isSingleEvent: boolean = false;
   
    Events = {
        onChangeEventList: () => { },
        afterFireCallbacks: () => { }
    };
    private _eventList: EventRecord[] = [];
    private _onCounter: number = 0;
    public get onCounter(): number {
        return this._onCounter;
    }
    private set onCounter(value: number) {
        this._onCounter = value;
    }

    constructor(isSingleEvent: boolean = false) {
        this.isSingleEvent = isSingleEvent;
    }

    /**
     * 
     * @param callback 
     * @param uc give usercontrol reference if want to remove event from event caller list when given `Usercontrol` close
     * @param stamp 
     * @returns 
     */
    on(callback: F,uc?:Usercontrol, stamp: string = uniqOpt.guid): string {
        if (this.isSingleEvent) this._eventList = [];
        this.onCounter++;
        let index = this._eventList.length;
        let _this = this;
        this._eventList.push({
            callback: callback as Function,
            stamp: stamp
        });
        if (uc != undefined) {
            uc.ucExtends.Events.afterClose.on(() => { 
                _this._eventList.splice(index, 1);
                _this.onCounter--;
                _this.Events.onChangeEventList();
            },undefined);
        }
        this.Events.onChangeEventList();
        return stamp;
    }

    removeByStamp(stamp: string): void {
        let fIndex: number = this._eventList.findIndex(s => s.stamp === stamp);
        if (fIndex != -1) {
            arrayOpt.removeAt(this._eventList, fIndex);
            this.Events.onChangeEventList();
        }
    }

    off(callback: Function): void {
        let fIndex: number = this._eventList.findIndex(s => s.callback === callback);
        if (fIndex != -1) {
            this._eventList.RemoveAtMultiple(fIndex);
            this.Events.onChangeEventList();
        }
    }

    get length(): number {
        return this._eventList.length;
    }
    /**
     * @returns `true` if any of callback from list returned `true` 
     */
    fire(args: Parameter<F> | void): boolean {
        let elist = this._eventList;
        let handeled = false;
        for (let i = 0, len = elist.length; i < len; i++) {
            const s = elist[i];
            let rval = s.callback.apply(this, args);
            if (rval === true) { handeled = true; break; }
        }
        this.Events.afterFireCallbacks();
        return handeled;
    }

    fireWithResult(
        _resultCallback: ResultCallback = resultCallback
    ): boolean {
        let ar: any[] = Array.from(arguments);
        ar.shift();
        for (let i = 0; i < this._eventList.length; i++) {
            let s = this._eventList[i];
            if (_resultCallback(s.callback(...ar)) === true) return true;
        }
        return false;
    }

    clear(): void {
        this._eventList = [];
        this.Events.onChangeEventList();
    }
}