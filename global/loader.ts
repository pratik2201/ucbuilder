import path from 'path';

const getCaller = (level: number = 1): string => {
  let stack: NodeJS.CallSite[] | string;
  const traceFn = Error.prepareStackTrace;
  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };
  stack = (new Error()).stack;
  Error.prepareStackTrace = traceFn;
  
  return ((stack as unknown as NodeJS.CallSite[])[level]).getFileName();
};

export const getbasedir = (level: number): string => {
  const base: string = path.dirname(getCaller(level));
  return base;
};

export const resolve = (file: string): string => {
  const base: string = path.dirname(getCaller());
  return path.resolve(base, file);
};