(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('minimist'), require('fs-extra'), require('path'), require('protobufjs-cli')) :
    typeof define === 'function' && define.amd ? define(['exports', 'minimist', 'fs-extra', 'path', 'protobufjs-cli'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.pbTools = {}, global.minimist, global.fs, global.path, global.protobufjsCli));
})(this, (function (exports, minimist, fs, path, protobufjsCli) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var minimist__default = /*#__PURE__*/_interopDefaultLegacy(minimist);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var path__default = /*#__PURE__*/_interopDefaultLegacy(path);

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    class FileUtils {
        checkoutFiles(item, arr) {
            let itemStat = fs__default["default"].statSync(item);
            if (itemStat.isFile()) {
                arr.push(item);
                return;
            }
            let q = fs__default["default"].readdirSync(item); //readdirSync 同步读取文件
            for (let i = 0; i < q.length; i++) {
                let item1 = path__default["default"].join(item, q[i]);
                let stat = fs__default["default"].statSync(item1); //fs.statSync()方法获取路径的详细信息
                if (stat.isDirectory()) { // isDirectory() 检查是否为文件夹
                    this.checkoutFiles(item1, arr);
                }
                else {
                    console.log(item1);
                    arr.push(item1);
                }
            }
        }
        static getInstance() {
            if (!this._instance) {
                this._instance = new FileUtils();
            }
            return this._instance;
        }
    }
    FileUtils._instance = null;
    const fileUtils = FileUtils.getInstance();

    /** 禁止序列化 */
    let nonserialization = function () {
        return (target, propertyKey) => {
            if (!target.__unserialization) {
                target.__unserialization = [];
            }
            target.__unserialization.push(propertyKey);
            if (!target.toJSON) {
                // JSON.stringify 自动调用
                target.toJSON = function () {
                    let data = {};
                    for (const key in this) {
                        if (Object.prototype.hasOwnProperty.call(this, key)) {
                            // @ts-ignore
                            if (this.__unserialization.indexOf(key) !== -1) {
                                continue;
                            }
                            const value = this[key];
                            data[key] = value;
                        }
                    }
                    return data;
                };
            }
        };
    };
    const ConvertTypes = {
        "double": "number",
        "float": "number",
        "int32": "number",
        "uint32": "number",
        "sint32": "number",
        "fixed32": "number",
        "sfixed32": "number",
        "int64": "number",
        "uint64": "number",
        "sint64": "number",
        "fixed64": "number",
        "sfixed64": "number",
        "bool": "boolean",
        "string": "string",
        "bytes": "ArrayBuffer"
    };
    const DefJSTypes = ["number", "bool", "string", "ArrayBuffer"];
    var ObjectType;
    (function (ObjectType) {
        ObjectType[ObjectType["NameSpace"] = 0] = "NameSpace";
        ObjectType[ObjectType["Message"] = 1] = "Message";
        ObjectType[ObjectType["Enum"] = 2] = "Enum";
        ObjectType[ObjectType["Empty"] = 3] = "Empty";
    })(ObjectType || (ObjectType = {}));
    var Rule;
    (function (Rule) {
        Rule[Rule["Repeated"] = 0] = "Repeated";
        Rule[Rule["Required"] = 1] = "Required";
        Rule[Rule["Optional"] = 2] = "Optional";
    })(Rule || (Rule = {}));
    class Format {
        constructor(name, original) {
            this.name = name;
            this.source = (original && (original.nested || original.fields || original.values)) || original;
            this._format();
        }
    }
    __decorate([
        nonserialization()
    ], Format.prototype, "source", void 0);
    class Field extends Format {
        _format() {
            if (!this.source) {
                return;
            }
            this.type = utils.convertToJSTypes(this.source.type);
            this.id = this.source.id;
            this.rule = utils.getRule(this.source.rule);
        }
    }
    class Enum extends Format {
        _format() {
            if (!this.source) {
                return;
            }
            this.map = new Map();
            for (const key in this.source) {
                const element = this.source[key];
                this.map.set(key, element);
            }
        }
    }
    class Message extends Format {
        _format() {
            if (!this.source) {
                return;
            }
            this.fields = [];
            for (const key in this.source) {
                const element = this.source[key];
                this.fields.push(new Field(key, element));
            }
        }
    }
    class Namespace extends Format {
        _format() {
            if (!this.source) {
                return;
            }
            this.messages = [];
            this.enums = [];
            for (const key in this.source) {
                const element = this.source[key];
                let type = utils.getObjectType(element);
                switch (type) {
                    case ObjectType.Message:
                        this.messages.push(new Message(key, element));
                        break;
                    case ObjectType.Enum:
                        this.enums.push(new Enum(key, element));
                        break;
                }
            }
        }
    }
    class Root extends Format {
        constructor(name, source) {
            super(name, source);
        }
        _format() {
            this.namespaces = [];
            if (!this.source) {
                return;
            }
            for (const key in this.source) {
                const element = this.source[key];
                let ns = new Namespace(key, element);
                this.namespaces.push(ns);
            }
            console.log(`prase-> `);
        }
    }
    let utils = {
        getObjectType(data) {
            if ("nested" in data) {
                return ObjectType.NameSpace;
            }
            if ("fields" in data) {
                return ObjectType.Message;
            }
            if ("values" in data) {
                return ObjectType.Enum;
            }
            return ObjectType.Empty;
        },
        getRule(rule) {
            if (rule == "repeated") {
                return Rule.Repeated;
            }
            if (rule == "required") {
                return Rule.Required;
            }
            return Rule.Optional;
        },
        convertToJSTypes(type) {
            return ConvertTypes[type] || type;
        }
    };
    class Prase {
        run(url) {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield this.load(url);
                let json = JSON.parse(res);
                let root = new Root("root", json);
                return root;
            });
        }
        load(url) {
            return new Promise((resolve, reject) => {
                protobufjsCli.pbjs.main(['-t', 'json', url], (err, output) => {
                    if (err) {
                        reject("load err");
                        return;
                    }
                    resolve(output);
                });
            });
        }
    }

    var MessageType;
    (function (MessageType) {
        MessageType[MessageType["C2S"] = 0] = "C2S";
        MessageType[MessageType["S2C"] = 1] = "S2C";
    })(MessageType || (MessageType = {}));
    class GenProtoDeclare {
        parse(url, options) {
            return __awaiter(this, void 0, void 0, function* () {
                let root = yield new Prase().run(url);
                this.options = options;
                this.msgIDProtoType = new Map();
                // this.moduleMap = new Map();
                this.nsItemMap = new Map();
                this.IDContent = "\nexport enum MsgID{\n";
                this.RETContent = "\nexport enum NetMsgErrorID{\n";
                this.messageContent = "declare global{\n";
                this.moduleInterfaceContent = "declare global{\n";
                for (let i = 0; i < root.namespaces.length; i++) {
                    let ns = root.namespaces[i];
                    this.printIDEnum(ns);
                    this.printRETEnum(ns);
                }
                for (let i = 0; i < root.namespaces.length; i++) {
                    let ns = root.namespaces[i];
                    this.printMessage(ns);
                }
                this.printProtoType();
                this.printInterface();
                this.IDContent += "}";
                this.RETContent += "}";
                this.messageContent += "\ttype Keyof_ProtoType = keyof ProtoType;\n";
                this.messageContent += `\t// 客户端请求\n`;
                this.messageContent += `\ttype ProtoTypeReq <T extends Keyof_ProtoType> = ProtoType[T]["req"];\n`;
                this.messageContent += `\t// 服务端响应\n`;
                this.messageContent += `\ttype ProtoTypeRes <T extends Keyof_ProtoType> = ProtoType[T]["res"];\n`;
                this.messageContent += "}\n";
                this.messageContent += "export {};";
                this.moduleInterfaceContent += "}\n";
                this.moduleInterfaceContent += "export {};";
            });
        }
        printMessage(ns) {
            var _a;
            this.messageContent += `\tnamespace ${ns.name}{\n`;
            for (let i = 0; i < ns.messages.length; i++) {
                const message = ns.messages[i];
                this.messageContent += `\t\tinterface ${message.name}{\n`;
                for (let j = 0; j < message.fields.length; j++) {
                    const field = message.fields[j];
                    this.messageContent += `\t\t\t${field.name}`;
                    this.messageContent += (field.rule == Rule.Optional ? "?: " : ": ");
                    let _checkType = DefJSTypes.indexOf(field.type) != -1;
                    if (_checkType) {
                        this.messageContent += field.type;
                    }
                    else {
                        // 查找当前命名空间内是否有相同名字的 结构体
                        let finedItem = ns.messages.find((msg) => {
                            return msg.name == field.type;
                        });
                        if (finedItem) {
                            this.messageContent += field.type;
                        }
                        else {
                            // 判断是否使用了 包名
                            if (field.type.includes(".")) {
                                this.messageContent += field.type;
                            }
                            else {
                                // 如果没有则强制使用 通用内的结构体 
                                let common = ((_a = this.options) === null || _a === void 0 ? void 0 : _a.commonNSName) || "common";
                                this.messageContent += `${common}.${field.type}`;
                            }
                        }
                    }
                    this.messageContent += (field.rule == Rule.Repeated ? "[];" : ";");
                    this.messageContent += "\n";
                }
                this.messageContent += `\t\t}\n`;
                this.collectProtoType(ns, message);
                this.collectModule(ns, message);
            }
            this.messageContent += "\t}\n";
        }
        //  收集模块
        collectModule(ns, message) {
            var _a, _b;
            if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.genModuleInterface) !== undefined && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.genModuleInterface) === false) {
                return;
            }
            let infos = message.name.split("_");
            if (!infos.length) {
                return;
            }
            let msgType = infos[0];
            let moduleName = infos[1];
            let funcName = infos[2];
            if (!moduleName) {
                return;
            }
            let _nsItem = this.nsItemMap.get(ns.name);
            if (!_nsItem) {
                _nsItem = { ns, moduleItems: new Map() };
                this.nsItemMap.set(ns.name, _nsItem);
            }
            let _moduleItem = _nsItem.moduleItems.get(moduleName);
            if (!_moduleItem) {
                _moduleItem = { messages: [] };
                _nsItem.moduleItems.set(moduleName, _moduleItem);
            }
            let moduleItem = {
                message, ns, type: MessageType[msgType], fnName: funcName || "",
            };
            _moduleItem.messages.push(moduleItem);
        }
        //  输出模块接口
        printInterface() {
            var _a, _b;
            if (((_a = this.options) === null || _a === void 0 ? void 0 : _a.genModuleInterface) !== undefined && ((_b = this.options) === null || _b === void 0 ? void 0 : _b.genModuleInterface) === false) {
                return;
            }
            this.nsItemMap.forEach((nsItem, nsKey) => {
                this.moduleInterfaceContent += `\tnamespace ${nsKey}{\n`;
                nsItem.moduleItems.forEach((moduleItem, mKey) => {
                    this.moduleInterfaceContent += `\t\tinterface ${mKey}Handler{\n`;
                    // this.moduleInterfaceContent += `\t\t\tonInit();\n`;
                    moduleItem.messages.forEach((msgItem) => {
                        let _Interface = `${nsKey}.${msgItem.message.name}`;
                        let isC2S = msgItem.type == MessageType.C2S;
                        // this.moduleInterfaceContent += `\t\t\t//@${msgItem.type == MessageType.C2S ? "send" :"recv"}("${nsKey}.${msgItem.message.name.replace("C2S_","").replace("S2C_","")}")\n`;
                        this.moduleInterfaceContent += `\t\t\t//@${isC2S ? "send" : "recv"}("${msgItem.message.name.replace("C2S_", "").replace("S2C_", "")}")\n`;
                        this.moduleInterfaceContent += `\t\t\t${isC2S ? "send" : "recv"}${mKey}${msgItem.fnName}(data: ${_Interface}): ${isC2S ? _Interface : "void"};\n`;
                    });
                    this.moduleInterfaceContent += `\t\t}\n`;
                });
                this.moduleInterfaceContent += "\t}\n";
            });
        }
        collectProtoType(ns, message) {
            let key = null;
            let code = 0;
            if (message.name.startsWith("C2S_")) {
                key = message.name.replace("C2S_", "");
                code = 1;
            }
            if (message.name.startsWith("S2C_")) {
                key = message.name.replace("S2C_", "");
                code = 2;
            }
            if (code != 0) {
                let value = this.msgIDProtoType.get(key);
                if (!value) {
                    console.warn(`gen-declare-> ${key} 消息 ID 不存在 ${message.name}`);
                    return;
                }
                value.ns = ns.name;
                if (code == 1) {
                    value.req = `${ns.name}.${message.name}`;
                }
                else if (code == 2) {
                    value.res = `${ns.name}.${message.name}`;
                }
            }
        }
        printProtoType() {
            this.messageContent += "\n\n\tinterface ProtoType {\n";
            this.msgIDProtoType.forEach((val, key) => {
                if (!val.req || !val.res) {
                    console.warn(`gen-declare-> ${key}, 接口不存在`);
                    return;
                }
                // this.messageContent += `\t\t"${val.ns}.${key}": {\n`;
                this.messageContent += `\t\t"${key}": {\n`;
                this.messageContent += `\t\t\treq: ${val.req},\n`;
                this.messageContent += `\t\t\tres: ${val.res}\n`;
                this.messageContent += "\t\t},\n";
            });
            this.messageContent += "\t}\n";
        }
        printIDEnum(ns) {
            let idEnum = ns.enums.find((val) => {
                return val.name === 'ID';
            });
            // MsgID
            if (idEnum) {
                // this.IDContent += `\n\t// ${ns.name} \n`
                this.IDContent = this.printEnum(ns, idEnum, this.IDContent, this.msgIDProtoType);
            }
        }
        printRETEnum(ns) {
            let retEnum = ns.enums.find((val) => {
                return val.name === 'RET';
            });
            // NetMsgErrorID
            if (retEnum) {
                // this.RETContent += `\n\t// ${ns.name} \n`
                this.RETContent = this.printEnum(ns, retEnum, this.RETContent);
            }
        }
        printEnum(ns, idEnum, content, map) {
            idEnum.map.forEach((val, key) => {
                content += `\t${key} = ${val},\n`;
                // 收集对应的协议
                if (map) {
                    let code = 0;
                    let _key = "";
                    if (key.startsWith("ID_C2S_")) {
                        _key = key.replace("ID_C2S_", "");
                        code = 1;
                    }
                    if (key.startsWith("ID_S2C_")) {
                        _key = key.replace("ID_S2C_", "");
                        code = 2;
                    }
                    if (!code) {
                        return;
                    }
                    if (map.has(_key)) {
                        return;
                    }
                    map.set(_key, { req: null, res: null, ns: null });
                }
            });
            return content;
        }
    }

    const MainProto = "_all.proto";
    class Main {
        constructor() {
            // 
            this.syntax = 3;
            this.output_ts = 'out';
            this.output_dts = 'out';
            this.hasAllProto = false;
        }
        exec(args) {
            if (args.help || args.h) {
                console.log("--input 或者 -i: 输入的 proto 协议位置,\n--outts 或者 -ots: 输出的 ts 文件位置\n--outdts 或者 -odts: 输出的 *.d.ts 文件位置\n--syntax: 语法版本 2 | 3 默认为 3");
                return;
            }
            let input = args.i || args.input;
            if (!input) {
                console.error(`protobuf-tools 没有输入路径`);
                return;
            }
            const output_ts = args.outts || args.ots;
            if (!output_ts) {
                console.error(`protobuf-tools 没有  outts  输出路径`);
                return;
            }
            const output_dts = args.outdts || args.odts || args.outts;
            if (!output_dts) {
                console.error(`protobuf-tools 没有 outdts 输出路径`);
                return;
            }
            this.output_ts = output_ts;
            this.output_dts = output_dts;
            this.syntax = args.syntax || 3;
            // 不再清空文件，会出现清空项目的情况
            // fs.emptyDirSync(output_dts);
            input = input.replace(/\\+/g, "/");
            let inputStat = fs__default["default"].statSync(input);
            if (inputStat.isFile()) {
                let idx = input.lastIndexOf("/");
                input = input.substring(0, idx);
            }
            // 创建主文件
            this.createMainFile(input);
            this.genProtoDeclare(path__default["default"].join(input, MainProto));
            if (!this.hasAllProto) {
                this.delMainFile(input);
            }
        }
        delMainFile(input) {
            fs__default["default"].unlinkSync(path__default["default"].join(input, MainProto));
        }
        // 创建一个主文件
        createMainFile(input) {
            let arr = [];
            fileUtils.checkoutFiles(input, arr);
            let content = `syntax = "proto${this.syntax}";\npackage ${MainProto.split(".")[0]};\n`;
            for (let i = 0; i < arr.length; i++) {
                let filepath = arr[i];
                filepath = filepath.replace(/\\+/g, "/");
                // 跳过已存在 的 MainProto
                if (path__default["default"].basename(filepath) == MainProto) {
                    this.hasAllProto = true;
                    continue;
                }
                filepath = filepath.replace(input + "/", "");
                content += `import "${filepath}";\n`;
            }
            // 如果有则覆盖已存在的 MainProto
            fs__default["default"].writeFileSync(path__default["default"].join(input, MainProto), content, { encoding: "utf-8" });
        }
        genProtoDeclare(protoUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                console.time('print-time');
                let g = new GenProtoDeclare();
                yield g.parse(protoUrl, { genModuleInterface: true });
                // 确保文件夹存在，但是不清空文件夹
                fs__default["default"].mkdirp(this.output_ts);
                fs__default["default"].mkdirp(this.output_dts);
                fs__default["default"].writeFile(path__default["default"].join(this.output_ts, "MsgID.ts"), g.IDContent);
                fs__default["default"].writeFile(path__default["default"].join(this.output_ts, "NetMsgErrorID.ts"), g.RETContent);
                fs__default["default"].writeFile(path__default["default"].join(this.output_dts, "cs.d.ts"), g.messageContent);
                fs__default["default"].writeFile(path__default["default"].join(this.output_dts, "cs.module.d.ts"), g.moduleInterfaceContent);
                console.timeEnd('print-time');
            });
        }
    }
    const oargs = process.argv.slice(2);
    const args = minimist__default["default"](oargs);
    let main = new Main();
    if (oargs.length) {
        main.exec(args);
    }
    else {
        // 测试
        main.genProtoDeclare("./proto/single/*");
    }

    exports.Main = Main;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
