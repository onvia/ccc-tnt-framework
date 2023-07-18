"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
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
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('psd2ui', {
                template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/vue/psd2ui.html'), 'utf-8'),
                data() {
                    return {
                        isImgOnly: false,
                        isForceImg: false,
                        isProcessing: false,
                        outputPath: "",
                    };
                },
                created() {
                    console.log(`index-> created`);
                    let str = localStorage.getItem(`${Editor.Project.name}_psd2ui_output`);
                    if (str) {
                        console.log(`index-> created  `, str);
                        this.outputPath = str;
                    }
                },
                beforeUnmount() {
                    localStorage.setItem(`${Editor.Project.name}_psd2ui_output`, this.outputPath);
                },
                methods: {
                    async onClickCache() {
                        if (this.isProcessing)
                            return;
                        this.isProcessing = true;
                        console.log(`index-> onClickCache  `, this.isForceImg, this.isImgOnly);
                        await Editor.Message.request("psd2ui", "on-click-cache");
                        console.log(`index-> onClickCache end`);
                        this.isProcessing = false;
                    },
                    onForceChanged(e) {
                        this.isForceImg = !this.isForceImg;
                    },
                    onImgOnlyChanged() {
                        this.isImgOnly = !this.isImgOnly;
                    },
                    onDragEnter(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        console.log(`index->onDragEnter `, event);
                        // event.target.add("drag-hovering")
                    },
                    onDragLeave(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        console.log(`index->onDragEnter `);
                        // event.target.remove("drag-hovering")
                    },
                    async onDropFiles(event) {
                        if (this.isProcessing) {
                            return;
                        }
                        let files = [];
                        [].forEach.call(event.dataTransfer.files, function (file) {
                            files.push(file.path);
                        }, false);
                        this.isProcessing = true;
                        await Editor.Message.request("psd2ui", "on-drop-file", { output: this.outputPath, files, isForceImg: this.isForceImg, isImgOnly: this.isImgOnly });
                        this.isProcessing = false;
                    },
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
