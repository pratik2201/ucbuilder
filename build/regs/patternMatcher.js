"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patternMatcher = void 0;
class patternMatcher {
    constructor(prePattern, centerPattern, postPattern) {
        this.prePattern = /{=/;
        this.centerPattern = /(\w+?)/;
        this.postPattern = /}/g;
        this.prePattern = prePattern;
        this.centerPattern = centerPattern;
        this.postPattern = postPattern;
        this.concatRegexp();
    }
    concatRegexp() {
        let flags = this.prePattern.flags + this.centerPattern.flags + this.postPattern.flags;
        flags = Array.from(new Set(flags.split(''))).join('');
        this.pattern = new RegExp(this.prePattern.source + this.centerPattern.source + this.postPattern.source, flags);
    }
}
exports.patternMatcher = patternMatcher;
