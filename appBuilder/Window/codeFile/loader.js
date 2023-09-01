//var getCaller, path;


const path = require('path');

let getCaller = function() {
  var stack, traceFn;
  traceFn = Error.prepareStackTrace;
  Error.prepareStackTrace = function(err, stack) {
    return stack;
  };
  stack = (new Error()).stack;
  Error.prepareStackTrace = traceFn;
  return stack[2].getFileName();
};

module.exports = 
/**
 * 
 * @param {string} file  
 */
function(file) {
  var base;
  base = path.dirname(getCaller());
  console.log(module.require(file));
  
 // console.log(path.resolve(base, file));
  return path.resolve(base, file);//require(path.resolve(base, file));
};