
import { EventTarget, Asset, AssetManager, Font, JsonAsset, TTFFont, __private, sys } from "cc";
import { EDITOR } from "cc/env";
import { Polyglot } from "./polyglot";

type CCAssetType<T = Asset> = __private._types_globals__Constructor<T>;
declare global {
    interface ITNT {
        i18n: I18N;
    }
    type FontPack = {
        font: string,
        type?: typeof Font | typeof TTFFont;
        bundle?: string;
    }
    interface I18NConfig {
        language: string;
        load<T extends Asset>(path: string, type: CCAssetType<T>, bundle: string | AssetManager.Bundle): Promise<T>;
        releaseBundle(bundle: string);
        fontMap?: Record<string, FontPack>;
    }
}

let data = {};
let polyglot = new Polyglot({ phrases: data, allowMissing: true });
const STORAGE_KEY = "tnt-language";
class I18N extends EventTarget {
    readonly EVENT_UPDATE_I18N = 'EVENT_UPDATE_I18N';
    language: string = "zh";
    lastLanguage: string = "";
    enable = true;
    fontMap: Record<string, FontPack> = {};
    config: I18NConfig = null;
    languagePack: string;

    public init(config?: I18NConfig) {
        if (!config) {
            return;
        }
        let storage_language = !EDITOR && sys.localStorage.getItem(STORAGE_KEY);

        this.enable = true;
        this.config = config;
        let language = storage_language || config.language || "zh";
        this.fontMap = config.fontMap || {};
        this.updateI18N(language);
    }

    public changeLanguage(language) {
        if (this.language === language) {
            return;
        }
        this.updateI18N(language);
    }

    private async updateI18N(language: string) {
        this.lastLanguage = this.language;
        this.language = language ? language : this.language;
        if (this.config.language != language) {
            this.config.language = language;
        }
        let jsonAsset = await this.loadLanguagePack(language);
        polyglot.replace(jsonAsset.json);
        
        this.emit(this.EVENT_UPDATE_I18N);

        if(!EDITOR){
            sys.localStorage.setItem(STORAGE_KEY,language)
        }
    }

    /** 下载语言包 */
    // public downloadLanguagePack(language: string){
    // this.languagePack = this.formatLanguagePackName(language);

    // }

    /** 加载语言包 */
    private async loadLanguagePack(language: string) {
        return new Promise<JsonAsset>((resolve, reject) => {
            this.languagePack = this.formatLanguagePackName(language);
            console.log(`i18n-> 加载 ${`text/${language}`}, bundle: ${this.languagePack}`);
            
            this.config.load(`text/${language}`, JsonAsset, this.languagePack).then(asset => {
                resolve(asset);
                console.log(`i18n-> 加载成功 `);
            }).catch(() => {
                console.log(`i18n-> 加载失败 `);
            });
        })
    }

    /** 格式化语言包名称 */
    private formatLanguagePackName(language: string) {
        return `language-${language}`;
    }

    public t(key, opt?) {
        let text = polyglot.t(key, opt);
        return text;
    }

    public t2(key, ...params) {
        let text = i18n.t(key);
        if (typeof params != 'undefined') {
            text = tnt.stringUtils.format_1(text, params);
        }
        return text;
    }

    public getFontPack() {
        return this.fontMap[this.language];
    }

    public releaseLanguagePack() {
        if (this.lastLanguage != this.language) {
            let languagePack = this.formatLanguagePackName(this.language);
            this.config.releaseBundle(languagePack);
        }
    }


    private static instance: I18N = null;
    public static getInstance(): I18N {
        if (!this.instance) {
            this.instance = new I18N();
        }
        return this.instance;
    }
}
export let i18n = I18N.getInstance();
tnt.i18n = i18n;
if (EDITOR) {
    i18n.enable = true;

    i18n.enable && i18n.init({
        language: sys.language,
        load<T extends Asset>(path: string, type: CCAssetType<T>, bundle: string) {
            return new Promise<T>((resolve, reject) => {
                tnt.AssetLoader.loadResInEditor(path, type, (err, asset: T) => {
                    err && console.warn(`i18n-> `, err);
                    
                    resolve(asset);
                }, bundle);
            })
        },
        releaseBundle(bundle) {

        },
    });
}
