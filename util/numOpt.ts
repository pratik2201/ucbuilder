namespace ucbuilder.util {
  export class numOpt {
    static addFloat(actualNum: number): number {
      let floatNumber = "" + actualNum;
      let position = floatNumber.indexOf(".");
      if (position == -1) {
        return +floatNumber + 1;
      } else {
        let len = floatNumber.length;
        let a = "0".repeat(len - 2) + "1";
        let dec = len - position - 1;
        let add = [a.slice(0, position), ".", a.slice(position)].join("");
        return parseFloat(
          (parseFloat(floatNumber) + parseFloat(add)).toFixed(dec)
        );
      }
    }
    static gtv(
      ifBeingThis: number,
      equalToThis: number,
      thanHowMuchAboutThis: number
    ): number {
      return this.getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis);
    }
    static getThirdValue(
      ifBeingThis: number,
      equalToThis: number,
      thanHowMuchAboutThis: number
    ): number {
      return this.SafeDivision(equalToThis * thanHowMuchAboutThis, ifBeingThis);
    }
    static gtvc(
      ifBeingThis: number,
      equalToThis: number,
      thanHowMuchAboutThis: number
    ): number {
      return this.getThirdValueCheck(
        ifBeingThis,
        equalToThis,
        thanHowMuchAboutThis
      );
    }
    static getThirdValueCheck(
      ifBeingThis: number,
      equalToThis: number,
      thanHowMuchAboutThis: number
    ): number {
      if (thanHowMuchAboutThis < ifBeingThis)
        return this.SafeDivision(
          equalToThis * thanHowMuchAboutThis,
          ifBeingThis
        );
      else {
        //return this.SafeDivision(thanHowMuchAboutThis,equalToThis);
        return (
          this.SafeDivision(thanHowMuchAboutThis, ifBeingThis) * equalToThis
        );
      }
    }
    static SafeDivision(Numerator: number, Denominator: number): number {
      return Denominator == 0 ? 0 : Numerator / Denominator;
    }
  }
}
