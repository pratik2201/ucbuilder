//namespace ucbuilder.global.objectOptions {
  const getC = (c: any): string | undefined => {
    if (c === undefined || c === null || isNaN(c)) return "";
    return Object.getPrototypeOf(c).constructor.name;
  }

  export class newObjectOpt {
    static copyProps<T = Object>(from: T, to: T): T {
      let rtrn = this.clone(to);
      this.recursiveProp(from, rtrn);
      return rtrn;
    }
    static recursiveProp(from: Object, to: Object): void {
      try {
        for (const key in from) {
          if (Object.hasOwnProperty.call(from, key)) {
            const element = from[key];
            if (getC(element) == "Object") {
              let sobj = to[key];
              if (sobj != undefined) this.recursiveProp(element, sobj);
              else to[key] = element;
            } else {
              to[key] = element;
            }
          }
        }
      } catch (ex) {
        if (from === undefined) to = from;
        return;
      }
    }
    static clone<T>(obj: T): T {
      return JSON.parse(JSON.stringify(obj));
    }
    static copyAttr(from: HTMLElement, to: HTMLElement): void {
      Array.from(from.attributes).forEach(s =>
        to.setAttribute(s.name, s.value)
      );
    }
    static getClassName(obj: object): string {
      return Object.getPrototypeOf(obj).constructor.name;
    }
    static analysisObject(obj: object): { key: string, value: object, type: string }[] {
      let rtrn: { key: string, value: object, type: string }[] = [];
      let npro: any;
      do {
        for (const key in Object.getOwnPropertyDescriptors(obj)) {
          let val = undefined;
          try { val = obj[key]; } catch (excp) { }
          let type = val != undefined ? this.getClassName(obj[key]) : "undefined";
          rtrn.push({
            key: key,
            type: type,
            value: val
          });
        }
        obj = Object.getPrototypeOf(obj);
        npro = Object.getPrototypeOf(obj);
      } while ((npro != null || npro != undefined));

      return rtrn;
    }
  }
//}
