interface EventTarget  {
    index(): number,
    selector(): string,
    find(selector: string, exclude?: string): HTMLElement[],
    fireEvent<K extends keyof HTMLElementEventMap>(eventName: K, bubble?: boolean, cancable?: boolean): void,
    delete(): void,
    stamp(): string,
    data(key?: string, value?: any): any
    is(target: any): boolean,    
    $(): HTMLElement,
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
    off<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface HTMLElement extends EventTarget {}
interface Element extends EventTarget { }

interface SVGElement {
    data(key?: string, value?: any): any
}
interface Number{
    toAlphabate():string
}
interface String {
    $(): HTMLElement,
    toFilePath():string,
    getDriveFromPath():string|undefined,
    _trim(charlist?: string): string,
    trim_(charlist?: string): string,
    _trim_(charlist?: string): string,
    __(jsonRow: {}): string,    
    startsWithI (s: string): boolean,
    endsWithI(s: string): boolean,
    includesI(s: string): { result:boolean,log:RegExpExecArray },
    equalIgnoreCase(s: string): boolean,
}


interface NodeList {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface Array<T> {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface JQuery{
    css(args:any):void,
    position(): { left: number, top: number },
    height(): number,
    width(): number,
    
}