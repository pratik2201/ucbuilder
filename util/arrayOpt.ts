namespace ucbuilder.util {
  export class arrayOpt {
    /**
    * @param {Array} currentArr
    * @param {Array} elementToPush
    * @param {number} atPosition
    */
    pushRange(
      currentArr: any[],
      elementToPush: any[],
      atPosition: number
    ): void {
      currentArr.splice(atPosition, 0, ...elementToPush);
    }
    /**
     *
     * @param {Array} source
     * @param {number|Array} indexToDelete
     * @returns
     */
    removeAt(source: any[], deleteIndex: number | number[]): any[] {
      if (typeof deleteIndex == "number") source.splice(deleteIndex, 1);
      else {
        deleteIndex.forEach((indTodelete) => {
          source.splice(indTodelete, 1);
        });
      }
      return source;
    }

    moveElement(arr: any[], old_index: number, new_index: number): any[] {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    }
    /**
     * @template T
     * @param {T[]} arr
     * @param {(ele:T)=>{ }} callback
     * @returns
     */
    removeByCallback(arr: any[], callback: (ele: any) => boolean): any[] {
      let i = 0;
      while (i < arr.length) {
        if (callback(arr[i])) {
          arr.splice(i, 1);
        } else {
          ++i;
        }
      }
      return arr;
    }
    /** @param {Array} array */
    Max(array: any[], propName: string): number {
      return Math.max(...array.map((o) => o[propName]));
    }
  }
}
