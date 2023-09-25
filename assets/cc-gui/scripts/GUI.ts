import { _decorator, Component, Node, director, Canvas, find, Widget, Prefab, Layout, Size } from 'cc';
import { GUIWindow } from './GUIWindow';
const { ccclass, property } = _decorator;



declare global {
    interface ITNT {
        gui: GUI;
    }
}
@ccclass('GUI')
class GUI {


    readonly GUICanvasName = "CC-GUI-Canvas";
    private _loader: tnt.AssetLoader;
    public get loader(): tnt.AssetLoader {
        if (!this._loader) {
            this._loader = tnt.loaderMgr.get("GUI");
        }
        return this._loader;
    }

    public windowArray: GUIWindow[] = [];

    isLoaded = false;

    doLayout: Runnable = tnt.functionUtils.debounce(() => {
        let canvasNode = find(this.GUICanvasName);
        canvasNode.layout.updateLayout(true);
        canvasNode.layout.enabled = false;
    }, 1 / 60 * 1000);

    async create(name: string, size?: Size) {
        //
        let canvasNode = this.getGUICanvas();

        if (!this.isLoaded) {
            await new Promise<void>((resolve, reject) => {
                this.loader.loadDir("cc-gui#prefabs", Prefab, () => {
                    resolve();
                });
            })
        }

        let guiWindow = tnt.resourcesMgr.loadPrefabNodeSync(this.loader, GUIWindow, { name, size, isFold: false });


        guiWindow.node.parent = canvasNode;

        this.windowArray.push(guiWindow);

        this.doLayout();
        return guiWindow;
    }


    destroy() {
        for (let i = 0; i < this.windowArray.length; i++) {
            const element = this.windowArray[i];
            element.node.destroy();
        }
        this.windowArray.length = 0;
    }

    private getGUICanvas() {

        let canvasNode = find(this.GUICanvasName);

        if (!canvasNode) {
            canvasNode = new Node();
            canvasNode.addComponent(Canvas);
            let widget = canvasNode.addComponent(Widget);
            widget.bottom = 0;
            widget.top = 0;
            widget.right = 0;
            widget.left = 0;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.isAlignTop = true;
            widget.isAlignBottom = true;

            let canvas = find("Canvas");
            canvasNode.position = canvas.position.clone();
            canvasNode.name = this.GUICanvasName;
            director.addPersistRootNode(canvasNode);

            let layout = canvasNode.addComponent(Layout);
            layout.type = Layout.Type.GRID;
            layout.resizeMode = Layout.ResizeMode.NONE;
            layout.verticalDirection = Layout.VerticalDirection.TOP_TO_BOTTOM;
            layout.horizontalDirection = Layout.HorizontalDirection.RIGHT_TO_LEFT;

            layout.padding = 5;
            layout.spacingX = 5;
            layout.spacingY = 5;

            // layout.enabled = false;
        }

        return canvasNode;
    }

    private static _instance: GUI = null
    public static getInstance(): GUI {
        if (!this._instance) {
            this._instance = new GUI();
        }
        return this._instance;
    }
}

tnt.gui = GUI.getInstance();

export { };