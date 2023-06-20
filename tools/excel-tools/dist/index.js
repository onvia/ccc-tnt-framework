"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const Main_1 = require("./Main");
// ##################
// 输入
const oargs = process.argv.slice(2);
const args = (0, minimist_1.default)(oargs);
let main = new Main_1.Main();
if (oargs.length) {
    main.exec(args);
}
else {
    // 测试
    main.test();
}
