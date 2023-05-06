"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const FileUtils_1 = require("../../FileUtils");
const weakMap = new WeakMap();
const AssetDir = `${Editor.Project.path}/assets`;
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        text: '#text',
    },
    methods: {
        hello() {
            if (this.$.text) {
                this.$.text.innerHTML = 'hello';
                console.log('[cocos-panel-html.default]: hello');
            }
        }
    },
    ready() {
        Editor.Message.broadcast("ccc-fw-tree:open");
        if (this.$.text) {
            this.$.text.innerHTML = 'Hello Cocos.';
        }
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('my-counter', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/counter.html'), 'utf-8'),
                data() {
                    return {
                        counter: 0,
                    };
                },
                methods: {
                    addition() {
                        this.counter += 1;
                    },
                    subtraction() {
                        this.counter -= 1;
                    },
                    async createNode() {
                        this.queryClass();
                        // let scene = await Editor.Message.request("scene","query-node-tree");
                        // let hasCanvas = false;
                        // let canvas = null;
                        // for (let i = 0; i < scene.children.length; i++) {
                        //     const child = scene.children[i];
                        //     if(child.name === "Canvas"){
                        //         canvas = child;
                        //        let uiwindow = child.children.find((node)=>{
                        //             return node.name === "UIWindow";
                        //         });
                        //         let uiblockinput = child.children.find((node)=>{
                        //             return node.name === "UIBlockInput";
                        //         });
                        //         if(!uiwindow){
                        //         }
                        //         if(!uiblockinput){
                        //         }
                        //     }
                        // }
                        // let queryNode = await Editor.Message.request("scene","query-node",canvas?.uuid);
                        // console.log(`index-> `);
                        // let createNodeRes = await Editor.Message.request("scene","create-node",{
                        //     parent: queryNode.uuid.value,
                        //     name: "UIRoot",
                        //     components: ["cc.UITransform"],
                        //     dump: {
                        //         layer: { value: 1 << 8},
                        //     },
                        //     canvasRequired: true,
                        // });
                        // console.log(`index-> createNode`); 
                        // let type = Editor.Selection.getLastSelectedType();
                        // let ids = Editor.Selection.getSelected(type);
                        // console.log(`index-> `);
                    },
                    async queryClass() {
                        // 查询所有 继承自 UIBase 的类
                        let _queryClassesRes = await Editor.Message.request("scene", "query-classes", { extends: "UIBase" });
                        // 查询所有 bundle
                        let _queryBundlesRes = await Editor.Message.request("asset-db", "query-assets", { isBundle: true, });
                        // 查询类的全路径
                        let scripts = FileUtils_1.fileUtils.getAllFiles(AssetDir, (isDirectory, file) => {
                            if (isDirectory) {
                                return true;
                            }
                            let _extname = (0, path_1.extname)(file);
                            if (_extname === ".ts") {
                                let _parse = (0, path_1.parse)(file);
                                let checked = _queryClassesRes.find((_class) => {
                                    return _parse.name === _class.name;
                                });
                                return !!checked;
                            }
                            return false;
                        });
                        let scriptBundles = [];
                        let scriptMap = {};
                        for (let i = 0; i < scripts.length; i++) {
                            const script = scripts[i];
                            let check = _queryBundlesRes.find((bundle) => {
                                return script.includes(bundle.file);
                            });
                            let scriptBunlde = {
                                className: (0, path_1.parse)(script).name,
                                bundle: check ? check.name : "",
                            };
                            scriptBundles.push(scriptBunlde);
                            if (scriptMap[scriptBunlde.className]) {
                                console.warn(`index-> 同名脚本 ${scriptBunlde.className} ,file: ${script}`);
                            }
                            scriptMap[scriptBunlde.className] = scriptBunlde.bundle;
                            console.log(`index-> `);
                        }
                        console.log(`index-> `);
                    }
                },
            });
            app.mount(this.$.app);
            weakMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = weakMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
