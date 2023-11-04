import { _decorator, Component, Node, find, game, sys, view, Rect, Vec2, Color, assetManager, BlockInputEvents, Sprite, SpriteFrame, UIOpacity, UITransform } from 'cc';
const { ccclass, property } = _decorator;

declare global {
    interface IPlatform {
        wechat: WeChat;
    }
}

@ccclass('WeChat')
export class WeChat {

    // 创建一个与微信胶囊位置大小一致的游戏节点
    createMenuButtonTemplate(color: Color = null) {
        if (sys.platform === sys.Platform.WECHAT_GAME) {
            let nodeName = "WECHAT_MENU_BUTTON";
            let node = tnt.game.createPersistRootNode2D(nodeName);
            let rect = this.getMenuButtonBoundingClientRect();
            
            if (color) {
                let sprite = node.addComponent(Sprite);
                sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                sprite.color = color;
                assetManager.loadBundle("framework", (err, bundle) => {
                    bundle.load("resources/texture/default_sprite_splash/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                        sprite.spriteFrame = spriteFrame;
                        spriteFrame.addRef();
                    });
                });
            }

            // 先设置大小，否则位置计算不正确
            node.uiTransform.width = rect.width;
            node.uiTransform.height = rect.height;

            let lbPos = new Vec2(rect.left, rect.bottom);

            let anchor = node.uiTransform.anchorPoint;
            let localPos = node.parent.uiTransform.convertToNodeSpaceAR(lbPos.copyAsVec3());
            node.x = localPos.x + node.uiTransform.width * anchor.x;
            node.y = localPos.y + node.uiTransform.height * anchor.y;
            return node;
        }
        return null;
    }

    getMenuButtonBoundingClientRect() {
        if (sys.platform !== sys.Platform.WECHAT_GAME) {
            return null;
        }
        let visibleSize = view.getVisibleSize(); //游戏显示区域大小
        // @ts-ignore
        const res = wx.getMenuButtonBoundingClientRect();
        // @ts-ignore
        const sysInfo = wx.getSystemInfoSync();

        let width = sysInfo.windowWidth;
        let height = sysInfo.windowHeight;

        //计算微信设备和画布比例
        let ws = width / visibleSize.width;
        let hs = height / visibleSize.height;

        // 微信大小转为画布大小
        let gameWidth = res.width / ws;
        let gameHeight = res.height / hs;


        const canvas = game.canvas;
        const box = canvas.getBoundingClientRect();
        let location = view.convertToLocationInView(res.left, res.bottom, box);

        view['_convertToUISpace'](location);

        return {
            left: location.x,
            bottom: location.y,
            width: gameWidth,
            height: gameHeight
        }
    }

    private static _instance: WeChat = null
    public static getInstance(): WeChat {
        if (!this._instance) {
            this._instance = new WeChat();
        }
        return this._instance;
    }
}

tnt.platform.wechat = WeChat.getInstance();