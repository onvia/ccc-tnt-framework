import { _decorator } from "cc";
import { TopMenuBar } from "./TopMenuBar";

let { ccclass } = _decorator;

declare global{
    interface ITNT{
        topMenuBarMgr: TopMenuBarMgr;
    }
}

@ccclass("TopMenuBarMgr")
export default class TopMenuBarMgr{
    
    private _topMenuBar: TopMenuBar;
    public get topMenuBar(): TopMenuBar {
        return this._topMenuBar;
    }
    
    async createTopMenuBar(){
        if(!this._topMenuBar){
            this._topMenuBar = await tnt.uiMgr.loadUIWithCtor({loaderKey: tnt.loaderMgr.KEY_UI_MGR},TopMenuBar);    
        }
        return this._topMenuBar;
    }

    showTopMenuBar(options: ITopMenuBarOptions){
        let root = tnt.uiMgr.getUIWindowRoot();
        if(root){
            this.topMenuBar.node.parent = root;
            this.topMenuBar.updateTopMenuBar(options);
        }
    }

    hideTopMenuBar(){
        this.topMenuBar && this.topMenuBar.node.removeFromParent();
    }
}

tnt.topMenuBarMgr = new TopMenuBarMgr();