
interface ISceneConfig {
    scene: string;
    button: string;
    bundle: string;
}

export const SceneConfig: ISceneConfig[] = [
    {
        scene: "BaseDemo",
        button: "基础接口",
        bundle: "test-example"
    },
    {
        scene: "DragDropScene",
        button: "拖放",
        bundle: "drag-drop-example",
    },
    {
        scene: "WindowScene",
        button: "弹窗",
        bundle: "window-example"
    },
    {
        scene: "RedPointDemo",
        button: "红点管理",
        bundle: "red-point-example",

    },
    {
        scene: "CaptureScene",
        button: "截屏",
        bundle: "capture-example"
    },
    {
        scene: "MVVMDemoList",
        button: "MVVM",
        bundle: "mvvm-example"
    },
    {
        scene: "TiledMapOrientationDemo",
        button: "TiledMap",
        bundle: "tiled-map-example"
    }, {
        scene: "PathFindingDemo",
        button: "寻路",
        bundle: "tiled-map-example"
    }, {
        scene: "FloodFillDemo",
        button: "洪水填充",
        bundle: "flood-fill"
    },
    {
        scene: "LongPressDemo",
        button: "长按",
        bundle: "test-example"
    },
    {
        scene: "CameraShakeDemo",
        button: "屏幕震动",
        bundle: "camera-controls",

    },
    {
        scene: "RVO2Scene",
        button: "RVO2",
        bundle: "rvo2-example",
    },
    {
        scene: "PixelClickDemo",
        button: "像素点击",
        bundle: "pixel-click-example"
    },
    {
        scene: "CCGUITestScene",
        button: "cc-gui",
        bundle: "cc-gui-test"
    },
    {
        scene: "ShaderTest",
        button: "shader",
        bundle: "shader-test",
    },
    {
        scene: "BasisTest",
        bundle: "basis-test",
        button: "basis"
    }
]