import { readFileSync } from 'fs-extra';
import { extname, join, parse } from 'path';
import { createApp, App } from 'vue';
const weakMap = new WeakMap<any, App>();

const AssetDir = `${Editor.Project.path}/assets`;




/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {  },
        hide() {  },
    },
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',

    },
    methods: {
    },
    ready() {
        if (this.$.app) {
            const app = createApp({});
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.component('psd2ui', {
                template: readFileSync(join(__dirname, '../../../static/template/vue/psd2ui.html'), 'utf-8'),
                data() {
                    return {
                        isImgOnly: false,
                        isForceImg: false,
                        isProcessing: false,
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
                        if (this.isProcessing) return;
                        this.isProcessing = true;

                        await Editor.Message.request("ccc-tnt-psd2ui", "on-click-cache");
                        this.isProcessing = false;
                    },
                    onForceChanged(e: any) {
                        this.isForceImg = !this.isForceImg;
                    },
                    onImgOnlyChanged() {
                        this.isImgOnly = !this.isImgOnly;
                    },

                    async onClickDropArea(event: any) {
                        if(this.isProcessing){
                            Editor.Dialog.warn("当前有正在处理的文件，请等待完成。\n如果已完成，请关闭 DOS 窗口。")
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
                    onDragEnter(event: any) {
                        event.stopPropagation()
                        event.preventDefault()
                        // event.target.add("drag-hovering")
                    },
                    onDragLeave(event: any) {
                        event.stopPropagation()
                        event.preventDefault()
                        // event.target.remove("drag-hovering")
                    },
                    async onDropFiles(event: any) {
                      
                        let files: any[] = [];
                        [].forEach.call(event.dataTransfer.files, function (file: any) {
                            files.push(file.path);
                        }, false);
                        this.processPsd(files);
                    },

                    async processPsd(files: any[]){
                        if(!files.length){
                            return;
                        }
                        if (this.isProcessing) {
                            Editor.Dialog.warn("当前有正在处理的文件，请等待完成。\n如果已完成，请关闭 DOS 窗口。")
                            return;
                        }
                        this.isProcessing = true;
                        await Editor.Message.request("ccc-tnt-psd2ui", "on-drop-file", { output: this.outputPath, files, isForceImg: this.isForceImg, isImgOnly: this.isImgOnly });
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
