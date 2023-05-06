
// 多语言 图片 也要配置 在多语言Excel 里面，需要配置填写 多语言文件夹下的路径import * as cc from "cc";
import { Component, log, Sprite, SpriteFrame, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { i18n } from "./i18n";

const {ccclass, property,executeInEditMode, menu,disallowMultiple,requireComponent} = _decorator;
@ccclass
@menu('本地化语言/LocalizedSprite')
@executeInEditMode
@disallowMultiple
@requireComponent(Sprite)
export default class LocalizedSprite extends Component {

    
    sprite: Sprite = null;

    @property
    _key = '';
    
    @property
    set key(value){
        this._key = value;
        this.updateSprite();
    };

    get key(){
        return this._key;
    }

    // @property({
    //     displayName: 'Asset Bundle'
    // })
    private bundle = '';
   
    _localizedString = '';

    @property
    get localizedString(){
        let text = i18n.t(this.key);
        if(EDITOR){
            if(this._localizedString != text){
                this._localizedString = text;            
                this._updateSprite(text); 
            }
        }
        return text;
    };


    onLoad () {
        this.sprite = this.node.getComponent(Sprite);
    }

    
    onEnable(){        
        i18n.on(i18n.EVENT_UPDATE_I18N,this.updateSprite,this);
    }
    
    onDisable(){
        i18n.targetOff(this);
    }
    
    
    local(key){
        this.key = key;
    }
    updateSprite(){
        let text = i18n.t(this._key);
        this._updateSprite(text);
    }

    private async _updateSprite(text){
        log('LocalizedSprite-> updateSprite');

        if(!this.key || this.key == ''){
            this.sprite.spriteFrame = null;
            return;
        }     
        log('LocalizedSprite-> updateSprite ',text);
        
        let spriteFrame = await i18n.config.load(`image/${text}`,SpriteFrame,i18n.languagePack);
        this.sprite.spriteFrame = spriteFrame;
    }
        
}
