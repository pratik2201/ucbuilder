const path = require('path');
let getCaller = function (level = 1) {
  var stack, traceFn;
  traceFn = Error.prepareStackTrace;
  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };
  stack = (new Error()).stack;
  Error.prepareStackTrace = traceFn;
  return stack[level].getFileName();
};

module.exports = {
  getbasedir: (level) => {
    var base;
    return path.dirname(getCaller(level));
  },
  /**
   * 
   * @param {string} file  
   */
  resolve: (file) => {
    var base;
    base = path.dirname(getCaller());
    //console.log(module.require(file));
    //console.log(base);
    // console.log(path.resolve(base, file));
    return path.resolve(base, file);//require(path.resolve(base, file));
  }
}