import { _decorator, Component, Node, __private, Button, EditBox, Toggle, Slider, Scene, ToggleContainer, isValid } from "cc";
declare module 'cc' {
    interface Node {
        __$nodes: Record<string, Node[]>;

        // 节点点击事件
        __$50NodeTouch: ITouch;
        __$50NodeTouchTarget: ITouch;

        // 按钮点击事件
        __$50BtnClickFn: Runnable,
        __$50BtnClickTarget: Object,

        // EidtBox 输入完成
        __$50EditingDidEndedFn: Runnable,
        __$50EditingDidEndedTarget: Object,

        // Toggle 点击事件
        __$50ToggleClickFn: Runnable,
        __$50ToggleClickTarget: Object,


        // ToggleContainer 事件
        __$50ToggleGroupFn: Runnable1<Toggle>,
        __$50ToggleGroupTarget: Object,

        // Slider 滑动事件
        __$50SliderEventFn: Runnable,
        __$50SliderEventTarget: Object,

    }
}

type NodeNoun<T> = Node | T | string;
type ToggleGroupEventOptions = { onChecked: Runnable2<Toggle, string>, onUnChecked?: Runnable2<Toggle, string> }

declare global {
    interface ITNT {
        componentUtils: ComponentUtils;
    }
}

class ComponentUtils {

    public findNode(name: string, _root: Node | Scene, parent?: Node | Scene): Node {
        let root = _root as Node;
        if(!isValid(root) || (parent && !isValid(parent))){
            return null;
        }
        let isInited = false;
        if (!root.__$nodes) {
            root.__$nodes = {};
        } else {
            isInited = true;
        }
        let res = this._checkout(name, root, parent);
        if (res) {
            return res;
        }
        if (isInited) {
            return null;
        }
        let _parent = root;
        if (parent && parent instanceof Scene) {
            _parent = parent;
        }
        this._walk(root, _parent);
        res = this._checkout(name, root, parent);
        return res;
    }
    public resetNodeCache(root: Node) {
        root.__$nodes = null;
    }
    private _checkout(name: string, rootNode: Node, parentNode?: Node) {
        let cacheArr = rootNode.__$nodes[name];
        if (cacheArr && cacheArr.length) {
            if (parentNode) {
                for (let i = 0; i < cacheArr.length; i++) {
                    const element = cacheArr[i];
                    if (element.parent === parentNode) {
                        return element;
                    }
                }
            }
            // 如果没找到，则取第一个
            return cacheArr[0];
        }
        return null;
    }
    private _walk(root: Node, node: Node) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (!root.__$nodes[child.name]) {
                root.__$nodes[child.name] = [];
            }
            root.__$nodes[child.name].push(child);

            this._walk(root, child);
        }
    }

    public findNodes(locators: string[], root: Node | Scene, parent?: Node) {
        let fnarray = [];
        locators.forEach((value) => {
            fnarray.push((this.findNode(value, root, parent)));
        })
        return fnarray;
    }
    /** 获取节点完整路径 */
    public getNodeFullPath(node) {
        let array = [];
        let temp = node;
        do {
            array.unshift(temp.name);
            temp = temp.parent;
        } while (temp && temp.name !== 'Canvas')
        return array.join('/');
    }

    /**
     * 查找组件
     *
     * @template T
     * @param {string} name
     * @param {__private._types_globals__Constructor<T>} type
     * @param {(Node | Scene)} rootNode
     * @param {Node} [parentNode]
     * @return {*}  {(T | null)}
     * @memberof ComponentUtils
     */
    public findComponent<T extends Component>(name: string, type: __private._types_globals__Constructor<T>, rootNode: Node | Scene, parentNode?: Node): T | null {
        let node: Node = this.findNode(name, rootNode, parentNode);
        if (!node) {
            return null;
        }
        return node.getComponent(type);
    }

    private _convertToNode<T>(node: NodeNoun<T>, root: Node, parent?: Node): Node {
        let name = "";
        if (typeof node === 'string') {
            name = node;
            node = this.findNode(name, root, parent);
        }
        if (node instanceof Component) {
            node = node.node;
        }
        if (!node) {
            console.error(`ComponentUtils-> 无法找到指定节点 ${name}`);
            return null;
        }
        return node as Node;
    }

    /**
     * 注册按钮事件
     *
     * @param {NodeNoun<Button>} name
     * @param {Runnable1<Button>} callback
     * @param {*} target
     * @param {Node} root
     * @param {Node} [parent]
     * @return {*} 
     * @memberof ComponentUtils
     */
    public registerButtonClick(name: NodeNoun<Button>, callback: Runnable1<Button>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }

        // 先注销掉之前注册的事件
        if (node.__$50BtnClickFn) {
            node.off(Button.EventType.CLICK, node.__$50BtnClickFn, node.__$50BtnClickTarget);
        }

        node.__$50BtnClickFn = callback;
        node.__$50BtnClickTarget = target;
        node.on(Button.EventType.CLICK, callback, target);

    }
    /**
     * 注册节点触摸事件
     *
     * @param {NodeNoun<Node>} name
     * @param {ITouch} touch
     * @param {*} target
     * @param {Node} root
     * @param {Node} [parent]
     * @return {*} 
     * @memberof ComponentUtils
     */
    public registerNodeTouchEvent(name: NodeNoun<Node>, touch: ITouch, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }
        let _touch = node.__$50NodeTouch;
        if (_touch) {
            let _target = node.__$50NodeTouchTarget;
            node.off(Node.EventType.TOUCH_START, _touch.onTouchBegan, _target);
            node.off(Node.EventType.TOUCH_MOVE, _touch.onTouchMoved, _target);
            node.off(Node.EventType.TOUCH_END, _touch.onTouchEnded, _target);
            node.off(Node.EventType.TOUCH_CANCEL, _touch.onTouchCancel, _target);
        }
        node.__$50NodeTouch = touch;
        node.__$50NodeTouchTarget = target;
        node.on(Node.EventType.TOUCH_START, touch.onTouchBegan, target);
        node.on(Node.EventType.TOUCH_MOVE, touch.onTouchMoved, target);
        node.on(Node.EventType.TOUCH_END, touch.onTouchEnded, target);
        node.on(Node.EventType.TOUCH_CANCEL, touch.onTouchCancel, target);
    }

    /**
     * 注册节点长按事件
     *
     * @param {NodeNoun<Node>} name
     * @param {number} touchInterval
     * @param {Runnable1<number>} callback
     * @param {*} target
     * @param {Node} root
     * @param {Node} [parent]
     * @return {*} 
     * @memberof ComponentUtils
     */
    public registerNodeLongTouchEvent(name: NodeNoun<Node>, touchInterval: number, callback: Runnable1<number>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }
        tnt.touch.offLongPress(node);
        tnt.touch.onLongPress(node, callback, target, touchInterval);
    }
    /**
     * 注册 EditBox 完成事件 
     *
     * @param {NodeNoun<EditBox>} name
     * @param {Runnable1<EditBox>} callback
     * @param {*} target
     * @param {Node} root
     * @param {Node} [parent]
     * @return {*} 
     * @memberof ComponentUtils
     */
    public registeEditBoxDidEnd(name: NodeNoun<EditBox>, callback: Runnable1<EditBox>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }

        // // 先注销掉之前注册的事件
        if (node.__$50EditingDidEndedFn) {
            node.off(EditBox.EventType.EDITING_DID_ENDED, node.__$50EditingDidEndedFn, node.__$50EditingDidEndedTarget);
        }
        node.__$50EditingDidEndedFn = callback;
        node.__$50EditingDidEndedTarget = target;
        node.on(EditBox.EventType.EDITING_DID_ENDED, callback, target);
    }
    public registerToggleClick(name: NodeNoun<Toggle>, callback: Runnable1<Toggle>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }
        // 先注销掉之前注册的事件
        if (node.__$50ToggleClickFn) {
            node.off(Toggle.EventType.TOGGLE, node.__$50ToggleClickFn, node.__$50ToggleClickTarget);
        }
        node.__$50ToggleClickFn = callback;
        node.__$50ToggleClickTarget = target;
        node.on(Toggle.EventType.TOGGLE, callback, target);
    }


    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, callback: Runnable2<Toggle, string>, target: any, root: Node, parent?: Node)
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions, target: any, root: Node, parent?: Node)
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions | Runnable2<Toggle, string>, target: any, root: Node, parent?: Node)
    public registerToggleGroupEvent(name: NodeNoun<ToggleContainer>, options: ToggleGroupEventOptions | Runnable2<Toggle, string>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }
        if (node.__$50ToggleGroupFn) {
            node.children.forEach((child) => {
                let toggle = child.getComponent(Toggle);
                if (toggle) {
                    child.off(Toggle.EventType.TOGGLE, node.__$50ToggleGroupFn, node.__$50ToggleGroupTarget);
                }
            });
        }
        let _options: ToggleGroupEventOptions = null;
        if (typeof options == "function") {
            _options = {
                onChecked: options.bind(target),
                onUnChecked: null,
            };
        } else if (typeof options == "object") {
            _options = options;
        }

        node.__$50ToggleGroupFn = (toggle: Toggle) => {
            if (toggle.isChecked) {
                _options.onChecked.call(target, toggle, toggle.node.name);
            } else {
                _options.onUnChecked?.call(target, toggle, toggle.node.name);
            }
        }
        node.__$50ToggleGroupTarget = target;
        node.children.forEach((child) => {
            let toggle = child.getComponent(Toggle);
            if (toggle) {
                child.on(Toggle.EventType.TOGGLE, node.__$50ToggleGroupFn, target);
            }
        });
    }

    /**
     * 使用代码选中一个 Toggle
     *
     * @param {NodeNoun<ToggleContainer>} toggleContainerOrName
     * @param {string} toggleName
     * @param {Node} root
     * @param {Node} [parent]
     * @memberof ComponentUtils
     */
    public toggleCheck(toggleContainerOrName: NodeNoun<ToggleContainer>, toggleName: string, root: Node, parent?: Node) {
        let toggleContainerNode = this._convertToNode(toggleContainerOrName, root, parent);
        let toggleNode = this._convertToNode(toggleName, root, toggleContainerNode);
        let toggle = toggleNode.getComponent(Toggle);
        if (toggle.isChecked) {
            toggleContainerNode.__$50ToggleGroupFn(toggle);
        }
        toggle.isChecked = true;
    }

    /**
     * 注册滑块事件
     *
     * @param {NodeNoun<Slider>} name
     * @param {Runnable1<Slider>} callback
     * @param {*} target
     * @param {Node} root
     * @param {Node} [parent]
     * @return {*} 
     * @memberof ComponentUtils
     */
    public registerSliderEvent(name: NodeNoun<Slider>, callback: Runnable1<Slider>, target: any, root: Node, parent?: Node) {
        let node = this._convertToNode(name, root, parent);
        if (!node) {
            return;
        }
        // 先注销掉之前注册的事件
        if (node.__$50SliderEventFn) {
            node.off("slide", node.__$50SliderEventFn, node.__$50SliderEventTarget);
        }

        node.__$50SliderEventFn = callback;
        node.__$50SliderEventTarget = target;
        node.on("slide", callback, target);
    }


    private static _instance: ComponentUtils = null
    public static getInstance(): ComponentUtils {
        if (!this._instance) {
            this._instance = new ComponentUtils();
        }
        return this._instance;
    }
}

export { };
tnt.componentUtils = ComponentUtils.getInstance();