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
        show() { },
        hide() { },
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
                        isPinyin: true,
                        outputPath: "",
                    };
                },
                created() {
                    let str = localStorage.getItem(`${Editor.Project.name}_psd2ui_output`);
                    if (str) {
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
                        await Editor.Message.request("ccc-tnt-psd2ui", "on-click-cache");
                        this.isProcessing = false;
                    },
                    onForceChanged(e) {
                        this.isForceImg = !this.isForceImg;
                    },
                    onImgOnlyChanged() {
                        this.isImgOnly = !this.isImgOnly;
                    },
                    onPinyinChanged() {
                        this.isPinyin = !this.isPinyin;
                    },
                    async onClickDropArea(event) {
                        if (this.isProcessing) {
                            Editor.Dialog.warn("当前有正在处理的文件，请等待完成。\n如果已完成，请关闭 DOS 窗口。");
                            return;
                        }
                        let result = await Editor.Dialog.select({
                            'multi': true,
                            'type': "file",
                            'filters': [
                                {
                                    'extensions': ["psd"],
                                    'name': "请选择 PSD"
                                }
                            ]
                        });
                        let files = result.filePaths;
                        this.processPsd(files);
                    },
                    onDragEnter(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        // event.target.add("drag-hovering")
                    },
                    onDragLeave(event) {
                        event.stopPropagation();
                        event.preventDefault();
                        // event.target.remove("drag-hovering")
                    },
                    async onDropFiles(event) {
                        let files = [];
                        [].forEach.call(event.dataTransfer.files, function (file) {
                            files.push(file.path);
                        }, false);
                        this.processPsd(files);
                    },
                    async processPsd(files) {
                        if (!files.length) {
                            return;
                        }
                        if (this.isProcessing) {
                            Editor.Dialog.warn("当前有正在处理的文件，请等待完成。\n如果已完成，请关闭 DOS 窗口。");
                            return;
                        }
                        this.isProcessing = true;
                        await Editor.Message.request("ccc-tnt-psd2ui", "on-drop-file", { output: this.outputPath, files, isForceImg: this.isForceImg, isImgOnly: this.isImgOnly, isPinyin: this.isPinyin });
                        this.isProcessing = false;
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
