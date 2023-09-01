import "../../../components/GComponent"
import { _decorator, Button, Node, EditBox, Toggle, Label, Sprite, Slider, ToggleContainer, ProgressBar, Layout, js, Prefab } from "cc";
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
    public updateOptions(arg: any, ...args: any) {
        this.options = arg as any;
    }


    /**
     * 注册节点触摸事件
     *
     * @param {NodeNoun<Node>} node
     * @param {ITouch} touch
     * @param {*} [target]
     * @param {Node} [parent]
     * @param {boolean} [useCapture]
     * @memberof UIBase
     */
    public registerNodeTouchEvent(node: NodeNoun<Node>, touch: ITouch, target?: any, parent?: Node, useCapture?: boolean) {
        tnt.componentUtils.registerNodeTouchEvent(node, touch, target || this, this.node, parent, useCapture);
    }

    /**
     * 注册按钮点击事件
     *
     * @param {NodeNoun<Button>} node
     * @param {Runnable1<Button>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof UIBase
     */
    public registerButtonClick(node: NodeNoun<Button>, callback: Runnable1<Button>, target?: any, parent?: Node) {
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
    public registerNodeLongTouchEvent(node: NodeNoun<Node>, touchInterval: number, callback: Runnable1<number>, target?: any, parent?: Node) {
        tnt.componentUtils.registerNodeLongTouchEvent(node, touchInterval, callback, target || this, this.node, parent);
    }

    /**
     * 注册编辑框输入完成事件
     *
     * @param {NodeNoun<EditBox>} node
     * @param {Runnable1<EditBox>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof UIBase
     */
    public registerEditBoxDidEnd(node: NodeNoun<EditBox>, callback: Runnable1<EditBox>, target?: any, parent?: Node) {
        tnt.componentUtils.registerEditBoxDidEnd(node, callback, target || this, this.node, parent);
    }

    /**
     * 注册选框点击事件
     *
     * @param {NodeNoun<Toggle>} node
     * @param {Runnable1<Toggle>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof UIBase
     */
    public registerToggleClick(node: NodeNoun<Toggle>, callback: Runnable1<Toggle>, target?: any, parent?: Node) {
        tnt.componentUtils.registerToggleClick(node, callback, target || this, this.node, parent);
    }

    /**
     * 注册选框组事件
     *
     * @param {NodeNoun<ToggleContainer>} node
     * @param {Runnable1<string>} callback
     * @param {*} [target]
     * @param {Node} [parent]
     * @memberof UIBase
     */
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, callback: Runnable2<Toggle, string>, target?: any, parent?: Node)
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions, target?: any, parent?: Node)
    public registerToggleGroupEvent(node: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions | Runnable2<Toggle, string>, target?: any, parent?: Node) {
        tnt.componentUtils.registerToggleGroupEvent(node, options, target || this, this.node, parent);
    }

    /**
     * 手动设置选中选框，搭配 `registerToggleGroupEvent` 使用，只有在需要代码设置选中的时候才需要调用
     *
     * @param {NodeNoun<ToggleContainer>} toggleContainerOrName
     * @param {string} toggleName
     * @param {Node} [parent]
     * @memberof UIBase
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
     * @memberof UIBase
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

    public getProgressBarByName(name: string, parent?: Node): ProgressBar {
        return this.findComponent(name, ProgressBar, parent);
    }

    public getSliderByName(name: string, parent?: Node): Slider {
        return this.findComponent(name, Slider, parent);
    }

    public setLabelText(name: NodeNoun<Node>, text: string | number, parent?: Node) {
        let label: Label = null;
        if (name instanceof Node) {
            label = name.getComponent(Label);
        } else {
            label = this.getLabelByName(name, parent);
        }
        if (label) {
            label.string = text.toString();
        } else {
            console.error(`UIBase-> 无法找到 label ${name}`);
        }
    }

    /**
     * 更新节点 SpriteFrame
     *
     * @param {(Node | Sprite)} node
     * @param {string} url
     * @param {Runnable} cb
     * @memberof UIBase
     */
    public updateSpriteFrame(node: Node | Sprite, url: string, cb: Runnable)
    public updateSpriteFrame(node: Node | Sprite, url: string, bundle: string)
    public updateSpriteFrame(node: Node | Sprite, url: string, cb: Runnable, bundle: string)
    public updateSpriteFrame(node: Node | Sprite, url: string, callbackOrBundle?: Runnable | string, bundle?: string) {
        tnt.resourcesMgr.updateSpriteFrame(this, node, url, callbackOrBundle, bundle)
    }

    /**
     * 添加预制体面板，没有真正创建实例，会预加载
     *
     * @param {(string | Node)} container 容器节点
     * @param {GConstructor} uiPanelCtor 
     * @param {string} [uiPanelName]
     * @param {Options} [param]
     * @memberof UIWindowBase
     */
    public addPanel<Options, T extends tnt.UIPanel<Options>>(container: string | Node, uiPanelCtor: GConstructor<T> | string, uiPanelName?: string, param?: Options): boolean {

        if (!this.uiPanelPackMap) {
            console.error(`UIBase-> [ uiPanelPackMap ] 未初始化`);
            return false;
        }

        let _uiPanelCtor: GConstructor<T> = null;
        if (typeof uiPanelCtor === 'string') {
            _uiPanelCtor = js.getClassByName(uiPanelCtor) as GConstructor<T>;
        } else {
            _uiPanelCtor = uiPanelCtor;
        }
        if (!uiPanelName) {
            uiPanelName = js.getClassName(_uiPanelCtor);
        }
        let parent: Node = null;
        if (typeof container === 'string') {
            parent = this.find(container);
        } else {
            parent = container;
        }
        if (!parent) {
            console.error(`UIBase-> 容器节点不存在`);
            return false;
        }
        let groupName = parent.name;
        let uiPanelPackArray = this.uiPanelPackMap[groupName];
        if (!uiPanelPackArray) {
            uiPanelPackArray = [];
            this.uiPanelPackMap[groupName] = uiPanelPackArray;
        }

        if (this.uiPanelParentMap[uiPanelName]) {
            console.error(`UIBase-> 已存在同名面板 ${uiPanelName}`);
            return false;
        }
        this.uiPanelParentMap[uiPanelName] = groupName;


        let findPanel = uiPanelPackArray.find((item) => { item.name === uiPanelName });
        if (findPanel) {
            console.log(`UIBase-> 已存在相同名称的内嵌节点 ${findPanel.name}`);

            return false;
        }

        uiPanelPackArray.push({
            ctor: _uiPanelCtor,
            name: uiPanelName,
            instance: null,
            container: parent,
            param: param,
            isChecked: false,
        });

        // 预加载
        let { prefabUrl, bundle } = tnt.resourcesMgr._parseAssetUrl(_uiPanelCtor, param);
        tnt.loaderMgr.get(this.loaderKey).preload(prefabUrl, Prefab, bundle);

        return true;
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
            let __switch = true; // 常量 true
            let _name = tnt.uiMgr._getClassName(key);
            let groupName = this.uiPanelParentMap[_name];
            let uiPanelPackArray = this.uiPanelPackMap[groupName] as UIPanelPack<T>[];
            if (!uiPanelPackArray) {
                console.error(`UIMgr-> showPanel [${groupName}]`);
                return;
            }
            let length = uiPanelPackArray.length;
            for (let i = 0; i < length; i++) {
                const pack = uiPanelPackArray[i];
                if (pack.name === _name) {
                    if (pack.isChecked) {
                        continue;
                    }
                    if (pack.instance) {
                        pack.instance.node.active = true;
                        pack.isChecked = true;
                        pack.instance.updateOptions(options);
                        pack.instance.onActive?.();
                        resolve(pack.instance);
                    } else {
                        pack.isChecked = true;
                        // 创建
                        this._createPanel(this, pack, (uiEmbed) => {
                            pack.instance.node.active = pack.isChecked;
                            if (!pack.isChecked) {
                                pack.instance.onFreeze?.();
                            }
                            tnt.btnCommonEventMgr.bind(pack.instance.node);
                            resolve(pack.instance);
                        });
                    }
                    continue;
                }
                if (__switch) {
                    if (pack.instance && pack.isChecked) {
                        pack.instance.onFreeze?.();
                        // 隐藏其他
                        pack.instance.node.active = false;
                    }
                    pack.isChecked = false;
                }
            }
        })
    }


    private _createPanel<T extends tnt.UIPanel>(uiAble: IUIAble, pack: UIPanelPack<T>, callback: Runnable1<T>) {
        let clazz = pack.ctor;

        tnt.resourcesMgr.addPrefabNode(uiAble, clazz, pack.container, pack.param).then((uiPanel) => {
            pack.instance = uiPanel;
            callback?.(uiPanel);
        });
    }
    /**
     * 内嵌预制体 ui，添加并显示
     *
     * @template T
     * @param {T} clazz
     * @param {string | Node} parentNode
     * @param {Key_Global_UI_Item_Options<T>} [options]
     * @return {*}  {Promise<Key_Global_UI_Item_Ctor<T>>}
     * @memberof UIBase
     */
    public addUI<T extends Key_Global_UI_Type>(clazz: T, parentNode: string | Node, options?: Key_Global_UI_Item_Options<T>): Promise<Key_Global_UI_Item_Ctor<T>> {
        return new Promise<Key_Global_UI_Item_Ctor<T>>((resolve, reject) => {
            if (typeof parentNode == 'string') {
                parentNode = this.find(parentNode);
            }
            tnt.resourcesMgr.addPrefabNode(this, clazz, parentNode, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result as Key_Global_UI_Item_Ctor<T>);
            });
        })
    }

    /**
     * 加载预制体 ui
     *
     * @template T
     * @param {T} clazz
     * @param {Key_Global_UI_Item_Options<T>} [options]
     * @return {*}  {Promise<Key_Global_UI_Item_Ctor<T>>}
     * @memberof UIBase
     */
    public loadUI<T extends Key_Global_UI_Type>(clazz: T, options?: Key_Global_UI_Item_Options<T>): Promise<Key_Global_UI_Item_Ctor<T>> {
        return new Promise<Key_Global_UI_Item_Ctor<T>>((resolve, reject) => {
            tnt.resourcesMgr.loadPrefabNode(this, clazz, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result as Key_Global_UI_Item_Ctor<T>);
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
            tnt.resourcesMgr.addPrefabNode(this, clazz, parentNode, options).then((result) => {
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
            tnt.resourcesMgr.loadPrefabNode(this, clazz, options).then((result) => {
                tnt.btnCommonEventMgr.bind(result);
                resolve(result);
            });
        })
    }

}

tnt.UIBase = UIBase;
export { };