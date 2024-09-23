import { arrayOpt, uniqOpt, objectOpt } from "ucbuilder/build/common";

interface EventRecord {
    callback: Function;
    stamp: string;
}
const eventRecord: EventRecord = {
    callback: () => { },
    stamp: ''
}
type ResultCallback = (returnedValue: any) => boolean;
const resultCallback: ResultCallback = (returnedValue: any) => false;
type Parameter<T> = T extends (...arg: infer T) => any ? T : never;
export class CommonEvent<F extends (...arg: any) => any> {
    isSingleEvent: boolean = false;
   
    Events = {
        onChangeEventList: () => { }
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

    on(callback: F, stamp: string = uniqOpt.guid): string {
        if (this.isSingleEvent) this._eventList = [];
        this.onCounter++;
        //let row: EventRecord = objectOpt.clone(eventRecord);
        this._eventList.push({
            callback: callback as Function,
            stamp: stamp
        });
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
            arrayOpt.removeAt(this._eventList, fIndex);
            this.Events.onChangeEventList();
        }
    }

    get length(): number {
        return this._eventList.length;
    }

    fire<S = Parameter<F>>(args:Parameter<F>|void): void {
        this._eventList.forEach(s => {
            s.callback.apply(this, args);
        });
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