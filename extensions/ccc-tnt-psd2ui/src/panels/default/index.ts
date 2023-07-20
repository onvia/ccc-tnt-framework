import { readFileSync } from 'fs-extra';
import { extname, join, parse } from 'path';
import { createApp, App } from 'vue';
import { AssetInfo } from '../../../@types/packages/asset-db/@types/public';
const weakMap = new WeakMap<any, App>();

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
                created(){
                        
                    console.log(`index-> created`);
                    let str = localStorage.getItem(`${Editor.Project.name}_psd2ui_output`);
                    if(str){
                        console.log(`index-> created  `,str);
                        this.outputPath = str;
                    }
                },
                beforeUnmount(){
                    localStorage.setItem(`${Editor.Project.name}_psd2ui_output`,this.outputPath);
                },
                
                methods: {
                    async onClickCache(){
                        if (this.isProcessing) return;
                        this.isProcessing = true;
    
                        console.log(`index-> onClickCache  `,this.isForceImg, this.isImgOnly);
                        
                        await Editor.Message.request("ccc-tnt-psd2ui","on-click-cache");
                        console.log(`index-> onClickCache end`);
                        
                        this.isProcessing = false;
                    },
                    onForceChanged(e: any) {
                       this.isForceImg = !this.isForceImg;
                    },
                    onImgOnlyChanged(){
                        this.isImgOnly = !this.isImgOnly;
                    },
                       
                    onDragEnter(event: any) {
                        event.stopPropagation()
                        event.preventDefault()
                        console.log(`index->onDragEnter `,event);
                        // event.target.add("drag-hovering")
                    }, 
                    onDragLeave(event: any) {
                        event.stopPropagation()
                        event.preventDefault()
                        console.log(`index->onDragEnter `);
                        // event.target.remove("drag-hovering")
                    },
                    async onDropFiles(event: any){
                        if(this.isProcessing){
                            return;
                        }
                        let files: any[] = [];
                        [].forEach.call(event.dataTransfer.files, function (file: any) {
                            files.push(file.path);
                        }, false);

                        this.isProcessing = true;
                        await Editor.Message.request("ccc-tnt-psd2ui","on-drop-file",{output: this.outputPath,files,isForceImg: this.isForceImg,isImgOnly: this.isImgOnly});
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
