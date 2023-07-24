import { _decorator } from "cc";
const { plugin } = tnt._decorator;
const { ccclass } = _decorator;

@plugin("UIMgr")
@ccclass("TopMenuBarPlugin")
export default class TopMenuBarPlugin implements IUIMgrPlugin {
    name: string = "TopMenuBarPlugin";

    constructor() {

    }
    onUIMgrReInit() {
        tnt.topMenuBarMgr.createTopMenuBar();
    }

    onPluginRegister() {
        tnt.uiMgr.on(tnt.uiMgr.Event.All_VIEW_CLOSED, this.onAllWindowClosed, this)
    }

    onWindowCreated(view: tnt.UIWindowBase<any>, name: string) {
    }
    onWindowShowBefore(view: tnt.UIWindowBase<any>, name: string) {

        this.adapterTopMenuBar(view, 0);
    }

    onWindowShowAfter(view: tnt.UIWindowBase<any>, name: string) {
    }

    onWindowClose(view: tnt.UIWindowBase<any>, name: string) {
        let topWindow = tnt.uiMgr.getTopWindow();
        this.adapterTopMenuBar(topWindow, 1);
    }

    // 所有弹窗关闭
    onAllWindowClosed() {
        tnt.topMenuBarMgr.hideTopMenuBar();
    }

    adapterTopMenuBar(view: tnt.UIWindowBase, offset: number) {
        let topBarNode = tnt.topMenuBarMgr.topMenuBar?.node;
        if (!topBarNode) {
            return;
        }
        if (view instanceof tnt.UIWindow) {
            if (view.topMenuBarOptions) {
                tnt.topMenuBarMgr.showTopMenuBar({ view, ...view.topMenuBarOptions });
                topBarNode.setSiblingIndex(topBarNode.parent.children.length);
            } else {
                tnt.topMenuBarMgr.hideTopMenuBar();
            }
        } else if (view instanceof tnt.UIPopup) {
            if (topBarNode.parent) {
                let index = topBarNode.parent.children.indexOf(view.root);
                topBarNode.setSiblingIndex(index - 1 + offset);
            }
        } else {

            tnt.topMenuBarMgr.hideTopMenuBar();
        }
    }

    onWindowDestroy(view: tnt.UIWindowBase<any>, name: string) {
    }

    onBeClean(view: tnt.UIWindowBase<any>, name: string) {

    }

    onPluginUnRegister() {

    }
}