
import { i18n } from "./i18n";
import { CCString, Component, Label, RichText, _decorator } from "cc";
import { EDITOR } from "cc/env";

const { ccclass, property, executeInEditMode, disallowMultiple, menu } = _decorator;

declare global {

    interface ITNT {
        LocalizedLabel: typeof LocalizedLabel;
    }

    namespace tnt {
        type LocalizedLabel = InstanceType<typeof LocalizedLabel>;
    }
}
@ccclass
@menu('本地化语言/LocalizedLabel')
@executeInEditMode
@disallowMultiple
export default class LocalizedLabel extends Component {

    label: Label | RichText = null;

    @property
    private _key = '';

    @property
    set key(value) {
        this._key = value;
        this.updateLabel();
    }

    get key() {
        return this._key;
    }


    @property
    get localizedString() {
        let text = this.getLocalizedOriginText();

        // 对参数进行转换
        let params = this.params.map((param)=>{
            return i18n.t(param);
        });
        if (params && params.length > 0) {
            text = tnt.stringUtils.format_0(text, ...params);
        }
        // 编辑器 加上这一句才能更新
        EDITOR && this.label && (this.label.string = text);
        return text; 
    };


    @property([CCString])
    params: string[] = [];


    font: string = "";


    lazyInit() {
        if (this.label) {
            return;
        }
        this.label = this.node.getComponent(Label);
        if (!this.label) {
            this.label = this.node.getComponent(RichText);
        }
    }
    onLoad() {
        this.lazyInit();
        this.updateLabel();
    }

    start() {

    }

    onEnable() {
        i18n.on(i18n.EVENT_UPDATE_I18N, this.forceUpdateRenderData, this);
    }

    onDisable() {
        i18n.targetOff(this);
    }

    setKey(key: string, ...params) {

        if (params && params.length) {
            this.params = params;
        }
        this.key = key;
    }
    setParams(...params) {
        this.params = params;
        this.updateLabel(false);
    }

    updateParamByIdx(idx, val) {
        this.params[idx] = val;
    }



    updateLabel(b = true) {
        this.lazyInit();
        this.label && (this.label.string = this.localizedString);
        // b && this.onUpdateOriginText();
        this.updateFont();

    }

    forceUpdateRenderData() {
        this.lazyInit();
        this.label && (this.label.string = '');
        this.updateLabel();
        if (this.label instanceof Label) {
            this.label.updateRenderData(true);
        } else if (this.label instanceof RichText) {

        }
    }

    getKey() {
        return this.key;
    }
    getLocalizedOriginText() {
        let text = this._key ? i18n.t(this._key) : '';
        return text;
    }
    updateParamsByLabelEntity(params: any[]) {
        this.params = [...params];
    }
    async updateFont() {
        let pack = i18n.getFontPack();
        if (!pack) {
            return;
        }
        if (this.font === pack.font) {
            return;
        }
        this.font = pack.font;
        let font = await i18n.config.load(`font/${pack.font}`, pack.type, pack.bundle || "resources");
        font && (this.label.font = font);
    }
}

tnt.LocalizedLabel = LocalizedLabel;