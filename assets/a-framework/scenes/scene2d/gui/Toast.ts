import { Node, Canvas, director, instantiate, Layers, Prefab, resources, UITransform, v3, Label, UIOpacity, tween, Tween, easing, Director } from "cc";



declare global {
    interface ITNT {
        toast: Toast;
    }
}


enum Gravity {
    DEFAULT = 999,
    CENTER = 0,
    TOP = 3,
    BOTTOM = 4,
}


//规则：如果 要显示的提示和正在显示的提示一致，则直接对当前显示的提示重复出现动作，
//      否则新创建一条提示，当前提示向上移动一个位置

class Toast {

    public static LENGTH_LONG = 3;
    public static LENGTH_SHORT = 1.5;
    public static LENGTH_DEFAULT = 1.5;
    public static Gravity = Gravity;

    public static PREFAB_PATH = "framework#resources/prefabs/Toast";

    public Gravity = Gravity;

    private prefab: Prefab = null;
    private gravity: Gravity = Gravity.CENTER;
    private toastArray: Array<Node> = [];
    private singleMap: Record<string, Node> = {};


    public show(text: string, duration: number = 1.5, gravity: Gravity = Gravity.DEFAULT, isSingle = false) {

        if (!this.prefab) {//预制体存在
            let loader = tnt.loaderMgr.share;
            loader.load(Toast.PREFAB_PATH, Prefab, (err, prefab: Prefab) => {
                if (err) {
                    console.error('Toast-> ', JSON.stringify(err) || err);
                    return;
                }
                prefab.addRef();
                this.prefab = prefab;
                this.show(text, duration, gravity);
            });
            return;
        }
        if (isSingle && this.singleMap[text]) {
            let toast = this.singleMap[text];
            let opacityCom = toast.getComponent(UIOpacity)
            Tween.stopAllByTarget(toast);
            Tween.stopAllByTarget(opacityCom);
            this._show(toast, text, duration, gravity);
            return;
        }
        let toast = instantiate(this.prefab);
        if (isSingle) {
            this.singleMap[text] = toast;
        }
        this._show(toast, text, duration, gravity);
    }
    private _show(toast: Node, text: string, duration: number = 1.5, gravity: Gravity = Gravity.DEFAULT) {

        if (gravity == Gravity.DEFAULT) {
            gravity = Gravity.CENTER;
        }
        this.gravity = gravity;

        let scene = director.getScene();
        let canvases = scene.getComponentsInChildren(Canvas);
        let canvas = canvases.find((canvas) => {
            return canvas.cameraComponent.visibility & Layers.BitMask.UI_2D
        });
        if (!canvas) {
            canvas = canvases?.[0];
        }
        // let canvas = scene.getComponentInChildren(Canvas);
        let trans = canvas.getComponent(UITransform);
        var width = trans.width;
        var height = trans.height;

        let toastTrans = toast.getComponent(UITransform);
        let text_label = toast.getChildByName("text").getComponent(Label);
        text_label.string = text;
        let text_label_trans = text_label.getComponent(UITransform);
        // toast.width = text_label.node.width + 50;
        text_label.updateRenderData(true);
        if (text_label_trans.width > width / 3 * 2) {
            text_label.overflow = Label.Overflow.RESIZE_HEIGHT;
            text_label_trans.width = width / 3 * 2;
            text_label.lineHeight = 48;
            //@ts-ignore
            text_label.updateRenderData(true);
        }


        toastTrans.width = text_label_trans.width + 60;
        toastTrans.height = text_label_trans.height + 60;



        toast.parent = canvas.node;

        switch (gravity) {
            case Gravity.BOTTOM:
                toast.position = v3(0, height - height * (1 - 0.2));
                break;
            case Gravity.CENTER:
                toast.position = v3(0, 0);
                break;

            case Gravity.TOP:
                toast.position = v3(0, height * 0.5 * 0.8);
                break;
            default:
                break;
        }

        toast.attr({
            gravity: this.gravity,
            text: text,
            duration: duration,
            bourn: toast.position.y,
        });
        let toastArray = this.toastArray;
        let space = 5;
        let idx = this.toastArray.indexOf(toast);
        if (idx != -1) {
            this.toastArray.splice(idx, 1);
        }
        this.toastArray.push(toast);

        // 做位置的排列，这里测试位置没问题，如果显示位置不正确，是因为两个 toast 出现的时间间隔太短，暂时没有好的处理方法
        for (let j = toastArray.length - 1; j > 0; j--) {
            const node1 = toastArray[j];
            const node2 = toastArray[j - 1];
            let height1 = node1.getComponent(UITransform).height;
            let height2 = node2.getComponent(UITransform).height;
            // @ts-ignore
            node2.bourn = node1.bourn + (height2 + height1) / 2 + space;
        }

        for (let i = 0; i < toastArray.length - 1; i++) {
            const child = toastArray[i];
            // @ts-ignore
            tween(child).to(0.1, { position: v3(child.position.x, child.bourn, child.position.z) }).start();
        }

        toast.scale = v3(0.6, 0.6, 0.6);
        let opacityCom = toast.getComponent(UIOpacity)
        Tween.stopAllByTarget(opacityCom);
        opacityCom.opacity = 160;
        let t = tween;
        t(opacityCom).parallel(
            t(opacityCom).to(0.1, { opacity: 255 }),
            t(opacityCom).delay(duration),
        ).to(0.3, { opacity: 0 }).start();

        Tween.stopAllByTarget(toast);
        tween(toast).parallel(
            tween(toast).to(0.2, { scale: v3(1, 1, 1) }, { easing: easing.bounceOut }),
            tween(toast).delay(duration),
        ).by(0.3, { position: v3(0, 100, 0) })
            .call(() => {

                var index = this.toastArray.indexOf(toast);
                if (index > -1) {
                    this.toastArray.splice(index, 1);
                }

                delete this.singleMap[text];
                toast.destroyAllChildren();
                toast.destroy();
            })
            .start();
        toast.layer = Layers.Enum.UI_2D;
    }


    clear() {        
        this.toastArray.forEach((toast) => {
            let opacityCom = toast.getComponent(UIOpacity)
            Tween.stopAllByTarget(toast);
            Tween.stopAllByTarget(opacityCom);
            toast.destroy();
        });
        this.toastArray.length = 0;
        this.singleMap = {};
    }


    private static instance: Toast = null;
    public static getInstance(): Toast {
        if (!this.instance) {
            this.instance = new Toast();
            // 加载新场景前清空当前显示的 Toast
            director.on(Director.EVENT_BEFORE_SCENE_LOADING,()=>{
                this.instance.clear();
            })
        }
        return this.instance;
    }
}


tnt.toast = Toast.getInstance();

export { };