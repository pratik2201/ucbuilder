interface EventTarget  {
    index(): number,
    bindEventWithUC<K extends keyof HTMLElementEventMap>(event:K,handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,parentUserControlRef:any, options?: boolean | AddEventListenerOptions):void,
    selector(): string,
    find(selector: string, exclude?: string): HTMLElement[],
    fireEvent<K extends keyof HTMLElementEventMap>(eventName: K, bubble?: boolean, cancable?: boolean): void,
    delete(): void,
    
    stamp(): string,
    contain(child:EventTarget):boolean,
    parseUc(uc:any):HTMLElement|HTMLElement[],
    data(key?: string, value?: any): any
    is(target: any): boolean,    
    $(): HTMLElement,
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
    off<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface HTMLElement extends EventTarget {}
interface Element extends EventTarget { }
interface HTMLInputElement {
    capitalizeHandle():void,
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
    parseUc<T=import ("ucbuilder/Usercontrol").Usercontrol>(uc:T):string,
    toFilePath(): string,
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
    fillInto:(target:Array<T>)=>void,
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
    RemoveAtMultiple(...indexes:number[]):T[],
}
interface JQuery{
    css(args:any):void,
    position(): { left: number, top: number },
    height(): number,
    width(): number,
    
}