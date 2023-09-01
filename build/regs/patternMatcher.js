class patternMatcher {
    prePattern = /{=/;
    centerPattern = /(\w+?)/;
    postPattern = /}/g;
    constructor(prePattern, centerPattern, postPattern) {
        //      var re = new RegExp("a|b", "i");
        //console.log(prePattern);
        this.prePattern = prePattern;
        this.centerPattern = centerPattern;
        this.postPattern = postPattern;
        this.concatRegexp();
        // console.log(this.pattern); 
    }
    concatRegexp() {
        let flags = this.prePattern.flags + this.centerPattern.flags + this.postPattern.flags;
        flags = Array.from(new Set(flags.split(''))).join('');
       // console.log(flags);
        this.pattern = new RegExp(this.prePattern.source + this.centerPattern.source + this.postPattern.source, flags);
    }
}
module.exports = { patternMatcher };
/*
class patternMatcher{
    prePattern = /{=/;
    centerPattern = /(\w+?)/;
    postPattern = /}/g; 
    constructor(prePattern,centerPattern,postPattern){
        //      var re = new RegExp("a|b", "i");
        //console.log(prePattern);
        this.prePattern = prePattern;
        this.centerPattern = centerPattern;
        this.postPattern = postPattern; 
        this.concatRegexp();      
       // console.log(this.pattern); 
    }
    concatRegexp() {
        let flags = this.prePattern.flags + this.centerPattern.flags + this.postPattern.flags;
        flags = Array.from(new Set(flags.split(''))).join();
        this.pattern =  new RegExp(this.prePattern.source  + this.centerPattern.source + this.postPattern.source, flags);
    }
}*/