import { _decorator, Component, Node, Label, ProgressBar, Sprite, SpriteFrame, UIOpacity } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('ListTestItem')
export class ListTestItem extends Component {
    
    @type(Label)
    rankText:Label = null;

    @type(Label)
    goldText:Label = null;

    @type(Sprite)
    flagImage:Sprite = null;

    @type(Label)
    levelText:Label = null;
    
    @type(ProgressBar)
    levelBar:ProgressBar = null;
    
    @type(Label)
    descText:Label = null;
    
    @type(UIOpacity)
    uiOpacity:UIOpacity = null;
    
    randomData(index:number, flagSpriteFrame:SpriteFrame){
        this.rankText.string = String(index);
        this.goldText.string = String(Math.floor(1000 + Math.random()* 1000));
        this.flagImage.spriteFrame = flagSpriteFrame;
        this.levelText.string = `lv.${Math.floor(Math.random()* 100)}`;
        this.levelBar.progress = Math.random();
        this.descText.string = `什么也没留下 - ${index}`;
        this.uiOpacity.opacity = 100 + Math.floor(Math.random() * 155);
    }
}
