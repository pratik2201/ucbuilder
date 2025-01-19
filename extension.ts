interface EventTarget  {
    index(): number,
    bindEventWithUC<K extends keyof HTMLElementEventMap>(event:K,handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,parentUserControlRef:any, options?: boolean | AddEventListenerOptions):void,
    selector(at?:HTMLElement): string,
    find(selector: string, exclude?: string): HTMLElement[],
    fireEvent<K extends keyof HTMLElementEventMap>(eventName: K, bubble?: boolean, cancable?: boolean): void,
    delete(): void,
    data(): any;
    data(key: string): any;
    data(key: string, val: any): void;
    stamp(): string,
    contain(child:EventTarget):boolean,
    parseUc(uc:any):HTMLElement|HTMLElement[],
    data(key?: string, value?: any): any
    currentStyles(): CSSStyleDeclaration;
    is(target: any): boolean,    
    $(): HTMLElement,
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
    off<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface HTMLElement extends EventTarget {}
interface Element extends EventTarget { }
interface HTMLInputElement {
    getSelectedValue(): string,
}
interface HTMLTextAreaElement extends HTMLInputElement {
}
interface SVGElement {
    data(key?: string, value?: any): any
}
interface Number{
    toAlphabate():string
}
interface String {
    $(): HTMLElement,
    parseUc<T = import("ucbuilder/Usercontrol").Usercontrol>(uc: T): string,
    /**
     * @param trim default `true` this will remove first and last '/' from this string
     */
    toFilePath(trim?:boolean): string,
    replaceAllWithResult(find:string,replace:string): {result:string,hasReplaced:boolean},
    escapeRegs():string,
    getDriveFromPath():string|undefined,
    _trim(charlist?: string): string,
    _trimText(charlist?: string): string,
    trimText_(charlist?: string): string,
    trim_(charlist?: string): string,
    _trim_(charlist?: string): string,
    __(jsonRow: {}): string,    
    toCamelCase(): string,
    templateBind(row:object):string,
    startsWithI (s: string): boolean,
    endsWithI(s: string): boolean,
    includesI(s: string): { result:boolean,index:number },
    equalIgnoreCase(s: string): boolean,
}


interface NodeList {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface Array<T> {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
    fillInto: (target: Array<T>, clearTarget?: boolean) => void,
    fillIntoMultiple: (target: Array<Array<T>>, clearTarget?: boolean) => void,
     distinct(): T[],
    /**
     * @param Eles elements to remove
     * @returns removed elements
     */
    RemoveMultiple(...Eles: T[]): T[],
     /**
     * @param indexes indexes of elements to remove
     * @returns removed elements
     */
    RemoveAtMultiple(...indexes: number[]): T[],
    
   
    RemoveByFilter(callback:(row:T)=>boolean), 
}
interface JQuery{
    css(args:any):void,
    position(): { left: number, top: number },
    height(): number,
    width(): number,
    
}