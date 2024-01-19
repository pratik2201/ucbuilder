"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.getbasedir = void 0;
const path_1 = __importDefault(require("path"));
const getCaller = (level = 1) => {
    let stack;
    const traceFn = Error.prepareStackTrace;
    Error.prepareStackTrace = function (err, stack) {
        return stack;
    };
    stack = (new Error()).stack;
    Error.prepareStackTrace = traceFn;
    return (stack[level]).getFileName();
};
const getbasedir = (level) => {
    const base = path_1.default.dirname(getCaller(level));
    return base;
};
exports.getbasedir = getbasedir;
const resolve = (file) => {
    const base = path_1.default.dirname(getCaller());
    return path_1.default.resolve(base, file);
};
exports.resolve = resolve;
