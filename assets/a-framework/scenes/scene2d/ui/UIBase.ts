import "../../../components/GComponent"
import { _decorator, Button, Node, EditBox, Toggle, Label, Sprite, Slider, ToggleContainer } from "cc";
const { ccclass, } = _decorator;



declare global {

    interface ITNT {
        UIBase: typeof UIBase;
    }

    namespace tnt {
        type UIBase<Options = any> = InstanceType<typeof UIBase<Options>>;
    }
}

type NodeNoun<T> = Node | T | string;
type ToggleGroupEventOptions = { onChecked: Runnable2<Toggle, string>, onUnChecked?: Runnable2<Toggle, string> }

@ccclass("UIBase")
class UIBase<Options = any> extends tnt.GComponent<Options> implements IUIAble {

    uiPanelPackMap: Record<string, Array<UIPanelPack<tnt.UIPanel>>> = {};
    uiPanelParentMap: Record<string, string> = {};

    protected __preload(): void {
        super.__preload();
        tnt.btnCommonEventMgr.bind(this);
    }

    /**
     * 更新参数
     * @param {*} args
     * @memberof UIBase
     */
    public updateOptions(arg, ...args) {
        this.options = arg as any;
    }


    /**
     * 注册节点触摸事件
     *
     * @param {NodeNoun<Node>} node
     * @param {ITouch} touch
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registerNodeTouchEvent(node: NodeNoun<Node>, touch: ITouch, target?: any, parent?: Node) {
        tnt.componentUtils.registerNodeTouchEvent(node, touch, target || this, this.node, parent);
    }

    /**
     * 注册按钮点击事件
     *
     * @param {NodeNoun<Button>} node
     * @param {Runnable1<Button>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registeButtonClick(node: NodeNoun<Button>, callback: Runnable1<Button>, target?: any, parent?: Node) {
        tnt.componentUtils.registerButtonClick(node, callback, target || this, this.node, parent);
    }

    /**
     * 注册长按事件
     *
     * @param {NodeNoun<Node>} node
     * @param {number} touchInterval
     * @param {Runnable1<number>} callback
     * @param {*} target
     * @param {Node} [parent]
     * @memberof UIBase
     */
    public registerNodeLongTouchEvent(node: NodeNoun<Node>, touchInterval: number, callback: Runnable1<number>, target: any, parent?: Node) {
        tnt.componentUtils.registerNodeLongTouchEvent(node, touchInterval,callback, target || this, this.node, parent);
    }

    /**
     * 注册编辑框输入完成事件
     *
     * @param {NodeNoun<EditBox>} node
     * @param {Runnable1<EditBox>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registeEditBoxDidEnd(node: NodeNoun<EditBox>, callback: Runnable1<EditBox>, target?: any, parent?: Node) {
        tnt.componentUtils.registeEditBoxDidEnd(node, callback, target || this, this.node, parent);
    }

    /**
     * 注册复选框点击事件
     *
     * @param {NodeNoun<Toggle>} node
     * @param {Runnable1<Toggle>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registeToggleClick(node: NodeNoun<Toggle>, callback: Runnable1<Toggle>, target?: any, parent?: Node) {
        tnt.componentUtils.registerToggleClick(node, callback, target || this, this.node, parent);
    }

    /**
     * 注册复选框组事件
     *
     * @param {NodeNoun<ToggleContainer>} node
     * @param {Runnable1<string>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, callback: Runnable2<Toggle, string>, target?: any, parent?: Node)
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions, target?: any, parent?: Node)
    public registerToggleGroupEvent(node: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions | Runnable2<Toggle, string>, target?: any, parent?: Node) {
        tnt.componentUtils.registerToggleGroupEvent(node, options, target || this, this.node, parent);
    }

    /**
     * 手动设置选中复选框，搭配 `registerToggleGroupEvent` 使用，只有在需要代码设置选中的时候才需要调用
     *
     * @param {NodeNoun<ToggleContainer>} toggleContainerOrName
     * @param {string} toggleName
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public toggleCheck(toggleContainerOrName: NodeNoun<ToggleContainer>, toggleName: string, parent?: Node) {
        tnt.componentUtils.toggleCheck(toggleContainerOrName, toggleName, this.node, parent);
    }

    /**
     * 注册滑块事件
     *
     * @param {NodeNoun<Slider>} node
     * @param { Runnable1<Slider>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof GComponent
     */
    public registerSliderEvent(node: NodeNoun<Slider>, callback: Runnable1<Slider>, target?: any, parent?: Node) {
        tnt.componentUtils.registerSliderEvent(node, callback, target || this, this.node, parent);
    }

    public getLabelByName(name: string, parent?: Node): Label {
        return this.findComponent(name, Label, parent);
    }
    public getSpriteByName(name: string, parent?: Node): Sprite {
        return this.findComponent(name, Sprite, parent);
    }

    public getToggleByName(name: string, parent?: Node): Toggle {
        return this.findComponent(name, Toggle, parent);
    }

    public setLabelText(name: string, text: string, parent?: Node) {
        let label = this.getLabelByName(name, parent);
        if (label) {
            label.string = text;
        } else {
            console.error(`GComponent-> 无法找到 label ${name}`);
        }
    }

    /**
     * 添加预制体面板，没有真正创建实例
     *
     * @param {(string | Node)} container 容器节点
     * @param {GConstructor} uiPanelCtor 
     * @param {string} [uiPanelName]
     * @param {Options} [param]
     * @memberof UIWindowBase
     */
    public addPanel<Options, T extends tnt.UIPanel<Options>>(container: string | Node, uiPanelCtor: GConstructor<T> | string, uiPanelName?: string, param?: Options): boolean {
        return tnt.uiMgr.addPanel(this, container, uiPanelCtor, uiPanelName, param);
    }

    /**
     * 显示预制体面板，如果有实例则直接显示，没有实例则创建后显示
     *
     * @template Options
     * @template T
     * @param {(string | GConstructor<T>)} key
     * @param {Options} [options]
     * @return {*}  {Promise<T>}
     * @memberof UIBase
     */
    public showPanel<Options, T extends tnt.UIPanel<Options>>(key: string | GConstructor<T>, options?: Options): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            tnt.uiMgr.showPanel(this, key, options).then((result) => {
                if (result.isInit) {
                    tnt.btnCommonEventMgr.bind(result.ins.node);
                }
                resolve(result.ins);
            });
        })
    }


    /**
     * 内嵌预制体 ui，添加并显示
     *
     * @template T
     * @param {T} clazz
     * @param {string | Node} parentNode
     * @param {Key_Golbal_UI_Item_Options<T>} [param]
     * @return {*}  {Promise<Key_Golbal_UI_Item_Ctor<T>>}
     * @memberof UIBase
     */
    public addUI<T extends Key_Golbal_UI_Type>(clazz: T, parentNode: string | Node, param?: Key_Golbal_UI_Item_Options<T>): Promise<Key_Golbal_UI_Item_Ctor<T>> {
        return new Promise<Key_Golbal_UI_Item_Ctor<T>>((resolve, reject) => {
            if (typeof parentNode == 'string') {
                parentNode = this.find(parentNode);
            }
            tnt.uiMgr.addUI(this, clazz, parentNode, param).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result);
            });
        })
    }

    /**
     * 加载预制体 ui
     *
     * @template T
     * @param {T} clazz
     * @param {Key_Golbal_UI_Item_Options<T>} [options]
     * @return {*}  {Promise<Key_Golbal_UI_Item_Ctor<T>>}
     * @memberof UIBase
     */
    public loadUI<T extends Key_Golbal_UI_Type>(clazz: T, options?: Key_Golbal_UI_Item_Options<T>): Promise<Key_Golbal_UI_Item_Ctor<T>> {
        return new Promise<Key_Golbal_UI_Item_Ctor<T>>((resolve, reject) => {
            tnt.uiMgr.loadUI(this, clazz, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result);
            });
        })
    }

    /**
     * 内嵌预制体 ui，添加并显示
     *
     * @template Options
     * @template T
     * @param {GConstructor<T>} clazz
     * @param {Node} parentNode
     * @param {Options} [options]
     * @return {*}  {Promise<T>}
     * @memberof UIBase
     */
    public addUIWithCtor<Options, T extends UIBase<Options>>(clazz: GConstructor<T>, parentNode: string | Node, options?: Options): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            if (typeof parentNode == 'string') {
                parentNode = this.find(parentNode);
            }
            tnt.uiMgr.addUIWithCtor(this, clazz, parentNode, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result);
            });
        })
    }

    /**
     * 加载预制体 ui
     *
     * @template Options
     * @template T
     * @param {GConstructor<T>} clazz
     * @param {Options} [options]
     * @return {*}  {Promise<T>}
     * @memberof UIBase
     */
    public loadUIWithCtor<Options, T extends UIBase<Options>>(clazz: GConstructor<T>, options?: Options): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            tnt.uiMgr.loadUIWithCtor(this, clazz, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result);
            });
        })
    }

}

tnt.UIBase = UIBase;
export { };