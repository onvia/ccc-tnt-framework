import { _decorator, Component, Node } from 'cc';
import { CaptureScreenMaskLayerController } from './plugins/CaptureScreenMaskLayerController';
import { VictoryWindow } from './VictoryWindow';
const { ccclass, property } = _decorator;

@ccclass('WindowScene')
export class WindowScene extends tnt.SceneBase {

    onEnterTransitionStart(sceneName?: string): void {
        tnt.uiMgr.setMaskLayerController(CaptureScreenMaskLayerController.getInstance());
    }

    onEnterTransitionFinished(sceneName?: string): void {

        this.registerButtonClick("btnPause", () => {
            tnt.uiMgr.showWindow('PauseWindow', { pauseBgm: true });
        })

        this.registerButtonClick("btnWindowEmbed", () => {
            
            tnt.uiMgr.showWindow('EmbedWindow');
        });

        this.registerButtonClick("btnAutoCloseWindow", () => {
            tnt.uiMgr.showWindow("AutoCloseWindow");
        });

        this.registerButtonClick("btnVictory", () => {
            tnt.uiMgr.showWindowByClass(VictoryWindow);
        });

        this.registerButtonClick("btnMsg",()=>{
            tnt.uiMgr.showWindow('DialogWindow',{'text': "通过按钮打开的信息弹窗"})
        });


        // ------------  使用弹窗队列  -------------
        // 效果为  在进入 WindowScene 之后自动弹出 PauseWindow，关闭后显示 DialogWindow，最后显示 VictoryWindow
        //在队列后追加弹窗
        tnt.uiMgr.addToQueue('PauseWindow', { 'pauseBgm': true }, () => {
            // 插入到队列最前面，这里会在  PauseWindow  关闭之后显示 "DialogWindow"
            tnt.uiMgr.insertToQueue('DialogWindow', {'text': "自动打开的信息弹窗"},(_window)=>{
                console.log(`WindowScene->显示 `,_window.name);
            });
        });
        //在队列后追加弹窗
        tnt.uiMgr.addToQueue('VictoryWindow', { 'awards': [] });

        // 开始显示
        tnt.uiMgr.showQueue(() => {
            console.log(`弹窗队列完成`);
        });


        let timerId = tnt.timerMgr.startTimer(()=>{  },this);

        tnt.timerMgr.removeTimer(timerId);

        
    }

    onExit(): void {
        tnt.uiMgr.setMaskLayerController(null);
    }
}

