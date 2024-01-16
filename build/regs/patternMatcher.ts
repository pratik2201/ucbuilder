export class patternMatcher {
    prePattern: RegExp = /{=/;
    centerPattern: RegExp = /(\w+?)/;
    postPattern: RegExp = /}/g;
    pattern: RegExp;

    constructor(prePattern: RegExp, centerPattern: RegExp, postPattern: RegExp) {
        this.prePattern = prePattern;
        this.centerPattern = centerPattern;
        this.postPattern = postPattern;
        this.concatRegexp();
    }

    concatRegexp() {
        let flags: string = this.prePattern.flags + this.centerPattern.flags + this.postPattern.flags;
        flags = Array.from(new Set(flags.split(''))).join('');
        this.pattern = new RegExp(this.prePattern.source + this.centerPattern.source + this.postPattern.source, flags);
    }
}
