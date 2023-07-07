import { Node, AssetManager, assetManager, BlockInputEvents, Canvas, Color, director, find, game, js, Layers, log, Scene, SceneAsset, Sprite, SpriteFrame, tween, UIOpacity, UITransform, view, _decorator, Director } from "cc";
const { ccclass } = _decorator;
const { pluginMgr } = tnt._decorator;




declare global {
    interface ITNT {
        sceneMgr: SceneMgr;
    }
    interface IPluginType {
        SceneMgr: ISceneMgrPlugin;
    }
    
}

interface SceneOptions<Options> {
    /** 传递给下一个场景的参数 */
    sceneOptions?: Options;
    /** 过渡动画所属图层 */
    layer?: any;
    /** 过渡动画颜色 */
    color?: Color;
    /** 是否是纯净模式 -- 直接跳转不播放动画 */
    pure?: boolean;
    /** 从哪个 bundle 加载场景资源 */
    bundle?: string,
    /** 跳转动画持续时间 */
    duration?: number;
    /** 是否暂存弹窗状态 */
    stageWindow?: boolean;
}
type SceneBase<T = any> = tnt.SceneBase<T>;

@pluginMgr("SceneMgr")
@ccclass('SceneMgr')
class SceneMgr extends tnt.EventMgr implements ISceneMgrPlugin, IPluginMgr{
    name: string = "SceneMgr";
    
    public static ___plugins: ISceneMgrPlugin[] = [];

    readonly EVENT_EXIT_SCENE = "EVENT_EXIT_SCENE";

    private currentScene: SceneBase = null; //当前的场景类


    private previousSceneName: string = null;
    private currentSceneName: string = null;
    private transition: Node = null;
    private _canvas: Node = null;

    public get canvas(): Node {
        if (!this._canvas) {
            let canvasNode = new Node();
            canvasNode.addComponent(Canvas);

            let canvas = find("Canvas");
            canvasNode.position = canvas.position.clone();
            canvasNode.name = "PersistRootCanvas";
            director.addPersistRootNode(canvasNode);
            this._canvas = canvasNode;
        }
        
        return this._canvas;
    }
    public set canvas(value: Node) {
        this._canvas = value;
    }

    public layer = Layers.Enum.UI_2D;


    isTransform = false;



    public async to<T extends string & keyof GlobalSceneType>(sceneName: T, options?: SceneOptions<GlobalSceneType[T]["options"]>) {
        return this.toScene(sceneName, options);
    }

    public async toScene<Options, T extends SceneBase = any>(clazz: GConstructor<T> | string, nextSceneOrOptions?: string | SceneAsset | SceneOptions<Options>, options?: SceneOptions<Options>) {
        if (this.isTransform) {
            log(`SceneMgr-> 正在跳转场景`);
            return;
        }
        console.time('[tnt] loadScene');
        
        this.onSceneChangeBegin(this.currentSceneName,typeof clazz === 'string' ? clazz : js.getClassName(clazz));

        this.isTransform = true;

        let bundleName = null;
        if (options) {
            bundleName = options.bundle;
        } else if (nextSceneOrOptions && !(nextSceneOrOptions instanceof SceneAsset) && typeof nextSceneOrOptions !== 'string') {
            bundleName = nextSceneOrOptions.bundle;
        }

        if (bundleName) {
            let loadedBundle = await new Promise<boolean>((resolve, reject) => {
                tnt.AssetLoader.loadBundle(bundleName, (err, bundle) => {
                    if (err) {
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            })
            if (!loadedBundle) {
                console.error(`SceneMgr-> 加载 Bundle ${bundleName} 失败`);
                this.isTransform = false;
                return;
            }
        }
        let sceneAsset: SceneAsset = null;
        let nextSceneName: string = null;

        if (typeof clazz === 'string') {
            clazz = js.getClassByName(clazz) as GConstructor<T>;
            if (!clazz) {
                console.error(`SceneMgr-> 没有找到场景 ${clazz} 类`);
                this.isTransform = false;
                return;
            }
        }

        if (nextSceneOrOptions instanceof SceneAsset) {
            sceneAsset = nextSceneOrOptions;
            nextSceneName = sceneAsset.name;
        } else if (typeof nextSceneOrOptions === 'string') {
            nextSceneName = nextSceneOrOptions;
        } else {
            if (!options) {
                options = nextSceneOrOptions;
                nextSceneName = js.getClassName(clazz);
            }
        }


        let color = (options && options.color && options.color) || new Color(0, 0, 0, 255);
        let pure = (options && options.pure) || false;
        let duration = (options && options.duration) || 1;
        let layer = (options && options.layer) || this.layer;

        let { transition, sprite, uiOpacity, uiTransform } = await this.updateTransition(color, layer);


        this.previousSceneName = this.currentSceneName;
        this.currentSceneName = nextSceneName;


        let onLaunched = (error: null | Error, scene?: Scene) => {
            let enterSceneName = scene.name;

            let canvases = scene.getComponentsInChildren(Canvas);
            let canvas = canvases.find((canvas) => {
                return canvas.cameraComponent?.visibility & Layers.BitMask.UI_2D;
            });

            let root: Node = null;
            if (!canvas) {
                root = canvases.length ? canvases[0].node : scene.children[0] as any;
            } else {
                root = canvas.node;
            }
            // 重新获取 弹窗根节点
            tnt.uiMgr._initialize();
            let nextScene = root.addComponent(clazz as GConstructor<T>);
            (clazz as GConstructor<T>).prototype.prefabUrl = enterSceneName;
            (clazz as GConstructor<T>).prototype.bundle = options?.bundle || "main";


            nextScene.updateOptions(options?.sceneOptions);
            nextScene.onCreate();
            nextScene.onLaunch(scene);
            nextScene.onEnter();
            this.currentScene = nextScene;
            tnt.uiMgr._recoverStaged(enterSceneName, this.previousSceneName);
            this.onEnterTransitionStart(enterSceneName);
            // 蒙版渐隐
            tween(uiOpacity)
                .to(pure ? 0 : 0.627 * duration, { opacity: pure ? 0 : 160 })
                .call(() => {
                    this.onEnterTransitionWillFinished(enterSceneName);
                    this.isTransform = false;
                })
                .to(pure ? 0 : 0.372 * duration, { opacity: 0 })
                .call(() => {
                    this.canvas.active = false;
                    this.onEnterTransitionFinished(enterSceneName);
                    this.onSceneChangeEnd(this.previousSceneName,enterSceneName);
                })
                .start();
        }

        if (!sceneAsset) {            
            director.emit(Director.EVENT_BEFORE_SCENE_LOADING, nextSceneName);
            sceneAsset = await new Promise<SceneAsset>((resolve, reject) => {
                let loader = tnt.loaderMgr.share;
                loader.loadScene(nextSceneName,
                    (finish: number, total: number, item: AssetManager.RequestItem) => {

                    },
                    (err, sceneAsset: SceneAsset) => {
                        resolve(sceneAsset);

                        let bundleName = options?.bundle;
                        if (!bundleName) {
                            let bundle = assetManager.bundles.find((bundle) => {
                                return !!bundle.getSceneInfo(nextSceneName);
                            });
                            bundleName = bundle.name;
                            // 设置 bundle
                            options = Object.assign(options || {}, { bundle: bundleName });
                        }

                        // bundle 增加引用
                        let bundleWrap = tnt.AssetLoader.getBundleWrap(bundleName);
                        bundleWrap?.addRef();
                    }, options?.bundle);
            })
        }


        if (sceneAsset) {
            let exitScene = this.currentScene;
            let exitSceneName = exitScene?.scene?.name;

            let exitBundleName = exitScene?.bundle as any;
            if (typeof exitBundleName == 'function') {
                exitBundleName = exitBundleName(exitScene.options);
            }
            let exitBundleWrap = tnt.AssetLoader.getBundleWrap(exitBundleName);
            console.timeEnd('[tnt] loadScene');
            this.onExitTransitionStart(exitSceneName);
             // 蒙版渐显
            tween(uiOpacity)
                .to(pure ? 0 : 0.5 * duration, { opacity: pure ? 0 : 255 })
                .call(() => {
                    this.onExitTransitionWillFinished(exitSceneName);
                    tnt.eventMgr.emit(this.EVENT_EXIT_SCENE);
                    this.emit(this.EVENT_EXIT_SCENE);
                    // 默认暂存弹窗
                    if (!options || (options.stageWindow || typeof options.stageWindow === 'undefined')) {
                        // 暂存弹窗
                        tnt.uiMgr._stageState(exitSceneName, nextSceneName);
                    }
                    // 这里调用关闭所有弹窗
                    tnt.uiMgr.closeAllWindow();
                    director.runSceneImmediate(sceneAsset, () => {
                        this.onExitTransitionFinished(exitSceneName);
                        exitScene?.onExit();
                        // 释放当前场景所加载的资源
                        exitScene && tnt.loaderMgr.releaseLoader(exitScene?.loaderKey);

                        // Bundle 减小引用
                        exitBundleWrap?.decRef();
                        tnt.loaderMgr.scene = null;
                    }, onLaunched);
                })
                .start();
        }

    }

    async updateTransition(color: Color, layer: number) {

        let size = view.getVisibleSize();
        let transition = this.transition;
        let sprite: Sprite = null;
        let uiTransform: UITransform = null;
        let uiOpacity: UIOpacity = null;

        let updateSize = () => {
            uiTransform.width = size.width;
            uiTransform.height = size.height;
        }
        if (!transition) {
            transition = new Node();
            sprite = transition.addComponent(Sprite);
            uiOpacity = transition.addComponent(UIOpacity);
            uiTransform = transition.getComponent(UITransform);
            if (!uiTransform) {
                uiTransform = transition.addComponent(UITransform);
            }
            transition.addComponent(BlockInputEvents);

            transition.name = "transition";
            this.transition = transition;

            assetManager.loadBundle("framework", (err, bundle) => {
                bundle.load("resources/texture/default_sprite_splash/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                    sprite.spriteFrame = spriteFrame;
                    spriteFrame.addRef();
                    sprite.sizeMode = Sprite.SizeMode.CUSTOM;

                    updateSize();
                });
            });

            transition.parent = this.canvas;
        } else {
            sprite = transition.getComponent(Sprite);
            uiOpacity = transition.getComponent(UIOpacity);
            uiTransform = transition.getComponent(UITransform);
        }

        uiOpacity.opacity = 0;
        sprite.color = color;
        updateSize();
        transition.layer = layer;

        // transition.scale = 10;
        // transition.x = transition.width / 2;
        // transition.y = transition.height / 2; 

        uiTransform.setContentSize(size);

        this.canvas.active = true;
        return {
            transition,
            sprite,
            uiOpacity,
            uiTransform
        };
    }

    getPreviousScene() {
        return this.previousSceneName;
    }

    getCurrentScene() {
        return this.currentSceneName;
    }


    onSceneChangeBegin(currentScene: string, nextScene: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onSceneChangeBegin(currentScene,nextScene);
        });
    }
    onSceneChangeEnd(previousScene: string, currentScene: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onSceneChangeEnd(previousScene,currentScene);
        });
    }
    
    /** 进入场景，过渡动画开始 */
    onEnterTransitionStart(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onEnterTransitionStart(sceneName);
        });
        this.currentScene?.onEnterTransitionStart();
    }

    /** 进入场景，过渡动画将要结束 */
    onEnterTransitionWillFinished(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onEnterTransitionWillFinished(sceneName);
        });
        this.currentScene?.onEnterTransitionWillFinished();
    }
    /** 进入场景，过渡动画结束 */
    onEnterTransitionFinished(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onEnterTransitionFinished(sceneName);
        });
        this.currentScene?.onEnterTransitionFinished();
    }


    /** 退出场景，过渡动画开始 */
    onExitTransitionStart(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onExitTransitionStart(sceneName);
        });
        this.currentScene?.onExitTransitionStart();
    }
    /** 退出场景，过渡动画将要结束 */
    onExitTransitionWillFinished(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onExitTransitionWillFinished(sceneName);
        });
        this.currentScene?.onExitTransitionWillFinished();
    }
    /** 退出场景，过渡动画结束 */
    onExitTransitionFinished(sceneName: string) {
        SceneMgr.___plugins.forEach((listener) => {
            listener.onExitTransitionFinished(sceneName);
        });
        this.currentScene?.onExitTransitionFinished();
    }
    
    registerPlugin?(plugins: ISceneMgrPlugin | ISceneMgrPlugin[]);
    unregisterPlugin?(plugin: ISceneMgrPlugin | string);
    

    private static _instance: SceneMgr = null
    public static getInstance(): SceneMgr {
        if (!this._instance) {
            this._instance = new SceneMgr();
        }
        return this._instance;
    }
}

tnt.sceneMgr = SceneMgr.getInstance();
export { };