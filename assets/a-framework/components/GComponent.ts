import { _decorator, Component, Node, Button, Scene, __private, js, game } from "cc";
const { ccclass } = _decorator;



//  生命周期 执行顺序
//  
//  onCreate 通过框架加载的预制体组件会有此方法
//  onLoad 组件脚本加到节点上时被调用
//  onEnable 有父节点了，在 enable = true 时会被调用
//  start(onStart) 延迟一帧被调用
//  onDisable 在 enable = false 时会被调用
//  onDestroy 节点销毁时被调用


declare global {

    interface ITNT {
        GComponent: typeof GComponent;
    }

    namespace tnt {
        type GComponent<Options> = InstanceType<typeof GComponent<Options>>;
    }
}



@ccclass('GComponent')
class GComponent<Options = any> extends Component {

    public declare _loaderKey: string;

    public get loaderKey(): string {
        if (!this._loaderKey) {
            this._loaderKey = js.getClassName(this);
        }
        return this._loaderKey;
    }
    /**
     * 尽量不要手动设置
     */
    public set loaderKey(value: string) {
        this._loaderKey = value;
    }

    /** 预制体地址 */
    readonly declare prefabUrl: string | ((options: Options) => string);
    readonly declare bundle: string | ((options: Options) => string);

    declare options: Options;

    private _alreadyBindNode: boolean = false;
    protected __preload(): void {
        this.bindNodes();
    }

    protected start(): void {
        this.onStart();
    }

    /**
     * 仅创建完成，还没有父节点
     *
     * @memberof GComponent
     */
    public onCreate() {

    }

    /**
     * 自动被 start 调用 代替 start
     *
     * @memberof GComponent
     */
    protected onStart() {

    }

    /**
     * 更新参数
     *
     * @param {Options} options
     * @memberof GComponent
     */
    public updateOptions(options: Options) {
        this.options = options as any;
    }

    public find(path: string): Node
    public find(path: string, parent: Node | Scene): Node
    public find(path: string, parent: Node | Scene, root: Node | Scene): Node
    public find(path: string, parent?: Node | Scene, root?: Node | Scene): Node {
        if (!root) {
            root = this.node;
        }
        let node = tnt.componentUtils.findNode(path, root, parent);
        return node;
    }

    public findComponent<T extends Component>(name: string, type: __private._types_globals__Constructor<T>): T
    public findComponent<T extends Component>(name: string, type: __private._types_globals__Constructor<T>, parent: Node | Scene): T
    public findComponent<T extends Component>(name: string, type: __private._types_globals__Constructor<T>, parent: Node | Scene, root: Node | Scene): T
    public findComponent<T extends Component>(name: string, type: __private._types_globals__Constructor<T>, parent?: Node | Scene, root?: Node | Scene): T {

        let node = this.find(name, parent, root);
        if (!node) {
            return null;
        }
        return node.getComponent(type);
    }

    public resetNodeCache(): void
    public resetNodeCache(root: Node | Scene): void
    public resetNodeCache(root?: Node | Scene): void {
        tnt.componentUtils.resetNodeCache(root || this.node);
    }

    public showNodeByName(name: string, active: boolean, parent?: Node) {
        let node = this.find(name, parent);
        if (node) {
            node.active = active;
        }
    }

    /**
     * 获取节点
     *
     * @param {string} name 节点名而非节点路径
     * @param {Node} [parent] 父节点
     * @return {*} 
     * @memberof GComponent
     */
    public getNodeByName(name: string, parent?: Node) {
        return this.find(name, parent);
    }

    /**
     * 仅加载 指定脚本的预制体
     *
     * @template Options
     * @template T
     * @param {(GConstructor<T> | string)} clazz
     * @param {Options} [options]
     * @return {*}  {Promise<T>}
     * @memberof GComponent
     */
    public loadPrefabNode<Options, T extends GComponent<Options>>(clazz: GConstructor<T> | string, options?: Options): Promise<T> {
        return tnt.resourcesMgr.loadPrefabNode(this, clazz, options);
    }

    /**
     * 加载并添加指定脚本的预制体到场景
     *
     * @template Options
     * @template T
     * @param {(GConstructor<T> | string)} clazz
     * @param {Node} parent
     * @param {Options} [options]
     * @return {*}  {Promise<T>}
     * @memberof GComponent
     */
    public addPrefabNode<Options, T extends GComponent<Options>>(clazz: GConstructor<T> | string, parent: Node, options?: Options): Promise<T> {
        return tnt.resourcesMgr.addPrefabNode(this, clazz, parent, options);
    }

    /**
     * 不需要手动调用
     *
     * @public
     * @memberof GComponent
     */
    public bindNodes() {

        if (this._alreadyBindNode) {
            return;
        }
        this._alreadyBindNode = true;

        let comp = this.constructor;
        // @ts-ignore
        let _nodes = comp.__$$50bind__?.data;
        if (_nodes) {
            for (const key in _nodes) {
                let param = _nodes[key];
                this.bindNode(key, param.name, param.type, param.parent);
            }
        }



        // @ts-ignore
        let _btnSounds = comp.__$$50btnSounds__?.data;
        if (_btnSounds) {
            for (const key in _btnSounds) {
                let obj = _btnSounds[key];
                let btn = this[key] as Button;
                btn.__$soundName = obj?.soundName;
            }
        }

        // @ts-ignore
        let btnClicks = comp.__$$50btnClick__?.data;
        if (btnClicks) {
            for (const key in btnClicks) {
                let param = btnClicks[key]
                let parent: Node = null;
                if (param.parent) {
                    parent = this.find(param.parent)
                }

                let node = this.find(param.name, parent);
                if (node?.button) {
                    tnt.componentUtils.registerButtonClick(node, param.func, this, this.node);
                } else if (node) {
                    let touch = {
                        onTouchEnded: param.func,
                    }
                    tnt.componentUtils.registerNodeTouchEvent(node, touch, this, this.node);
                }

            }
        }
    }

    protected bindNode(property: string, nodeName: string, type: GConstructor<Component>, parentName: string = null) {
        let parent: Node = null;
        if (parentName) {
            parent = this.find(parentName)
        }
        if (type) {
            let _comp = this.findComponent(nodeName, type, parent);
            this[property] = _comp;
        } else {

            let node = this.find(nodeName, parent);
            this[property] = node;
        }
    }

    /**
     * 分帧执行
     * @param {*} generator Generator 类型方法
     * @param {*} duration 一帧中给予创建的时间 毫秒
     */
    public async exeGenerator(generator: Generator, duration: number = 10) {
        return await this._exeGenerator(this, generator, duration);
    }

    /** Generator 函数 */
    protected *getGenerator(length: number, callback: Runnable, ...params: any): Generator {
        for (let i = 0; i < length; i++) {
            let result = callback(i, ...params)
            if (result) {
                yield;
            } else {
                return;
            }
        }
    }

    protected _exeGenerator(runComponent: Component, generator: Generator, duration: number) {
        return new Promise<void>((resolve, reject) => {
            let gen = generator;
            //执行
            let execute = () => {
                let startTime = new Date().getTime();
                for (let iter = gen.next(); ; iter = gen.next()) {
                    if (iter == null || iter.done) {
                        resolve();
                        return;
                    }

                    if (new Date().getTime() - startTime > duration) {
                        if (runComponent.scheduleOnce) {
                            runComponent.scheduleOnce(() => execute(), game.deltaTime);
                        } else {
                            setTimeout(() => execute(), game.deltaTime * 1000);
                        }
                        return;
                    }
                }
            }
            execute();
        });
    }
}

tnt.GComponent = GComponent;
export { };