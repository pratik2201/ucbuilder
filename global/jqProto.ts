
interface HTMLElement {
    index(): number,
    selector(): string,
    find(selector: string, exclude?: string): HTMLElement[],
    fireEvent<K extends keyof HTMLElementEventMap>(eventName: K, bubble?: boolean, cancable?: boolean): void,
    delete(): void,
    stamp(): string,
    data(key?: string, value?: any): any
    is(target: HTMLElement): boolean,
    $(): HTMLElement,
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
    off<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}

interface SVGElement {
    data(key?: string, value?: any): any
}
interface String {
    $(): HTMLElement,
    _trim(charlist?: string): string,
    trim_(charlist?: string): string,
    __(jsonRow: {}): string,
}
interface NodeList {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}
interface Array<T> {
    on<K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void,
}