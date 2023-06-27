
# CocosCreator 3.7.x 游戏开发框架

- [CocosCreator 3.7.x 游戏开发框架](#cocoscreator-37x-游戏开发框架)
    - [介绍](#介绍)
    - [基类](#基类)
      - [`GComponent`](#gcomponent)
      - [`UIBase`](#uibase)
    - [资源管理](./docs/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86.md)
    - [场景管理](#场景管理)
    - [弹窗管理](./docs/%E5%BC%B9%E7%AA%97%E7%AE%A1%E7%90%86.md)
    - [输入](./docs/%E8%BE%93%E5%85%A5.md)
    - [事件管理](#事件管理)
    - [全局定时器](./docs/%E5%85%A8%E5%B1%80%E5%AE%9A%E6%97%B6%E5%99%A8.md)
    - [池管理](#池管理)
    - [拖放管理](./docs/Drag%26Drop.md)
    - [截图管理](./docs/%E6%88%AA%E5%9B%BE%E7%AE%A1%E7%90%86.md)
    - [按钮通用事件管理](#按钮通用事件管理)
    - [红点管理](#红点管理)
    - [网络管理](./docs/%E7%BD%91%E7%BB%9C%E7%AE%A1%E7%90%86.md)
    - [多语言](./docs/%E5%A4%9A%E8%AF%AD%E8%A8%80.md)
    - [TiledMap](./docs/TiledMap.md)
    - [MVVM](./docs/MVVM.md)
    - [装饰器](./docs/%E8%A3%85%E9%A5%B0%E5%99%A8.md)
    - [热更新](./docs/%E7%83%AD%E6%9B%B4%E6%96%B0.md)
    - [工具类](./docs/%E5%B7%A5%E5%85%B7%E7%B1%BB.md)
    - [引擎扩展](./docs/%E5%BC%95%E6%93%8E%E6%89%A9%E5%B1%95.md)
    - [工具插件](./docs/%E5%B7%A5%E5%85%B7%E6%8F%92%E4%BB%B6.md)
    - [参考](#参考)
      - [MVVM](#mvvm)
      - [其他](#其他)
### 介绍

使用本框架在开发过程中远离编辑器，不在编辑器中挂载脚本到节点，但是在运行时会自动挂载脚本到节点。  
框架所有管理者单例和大部分类都挂载到了全局变量 `tnt` 上。  
游戏启动需要有一个启动类和启动场景，将启动类挂载到启动场景中，在后续使用过程中，基本不再需要手动在节点挂载组件了。  


>为保证在编辑器内优先加载框架代码，这里名为 `framework` 的 Bundle 使用了 `a-framework` 作为文件夹名，开发过程中其他 Bundle 尽量保证在框架 Bundle 后加载

框架启动需要实现 `IStartupOptions`  
详细的使用可以启动实例 `Launcher.scene` 查看，脚本同名。

```
// 首先加载框架 Bundle
assetManager.loadBundle("framework", () => {

    // 启动框架 
    tnt.startup(startupOptions);
});

```



### 基类
#### `GComponent` 
继承自 `Component`  

属性
- `prefabUrl`，`bundle`：需要子类搭配【类装饰器】 `@prefabUrl("xxx/xxx","bundle")` 或者 `@prefabUrl("bundle#xxx/xxx")` 使用。  
- `loaderKey`： 属性为 资源管理器的键值，用以保证资源能够正确的加载和释放，尽量不要手动去设置这个值  
为保持接口风格统一，使用 onStart 代理 start ， 也可以直接使用 start ，不影响。

方法  

- `getNodeByName`： 获取节点，等同于 `find`， 这里传入的是节点名而非节点路径
- `loadPrefabNode`： 使用当前脚本的加载器加载预制体
- `addPrefabNode`： 使用当前脚本的加载器加载预制体并添加到指定节点


>在首次调用 `getNodeByName` 或 `find` 时，框架会自动创建节点树缓存，减小后续使用此接口的开销。  
>
>注意：  
如果想查找动态添加的节点，需要先调用 `resetNodeCache` 清理缓存，否则无法查找到。  
如果提供了动态添加节点的父节点，则可以不用调用 `resetNodeCache`，方法会自动对缓存打补丁。     
>  
>例如：  
在节点 `NodeA` 上动态添加了节点 `NodeB`  
调用 `this.getNodeByName("NodeB",NodeA)` 能够正常查找到节点 `NodeB`  
调用 `this.getNodeByName("NodeB")` 则无法查找到，这时候需要调用 `this.resetNodeCache()`。


####  `UIBase` 
继承自 `GComponent`

实现了大部分 `ComponentUtils` 中的功能

`UIBase` 的子类  
- `UIItem` 小部件
- `UIPanel` 面板
- `UIWindowBase` 弹窗基类
  - `UIPopup` 模态窗口 会自动生成半透明蒙版
  - `UIWindow` 全屏窗口 需要手动设置背景图

1. UI 基类
每一个作为预制体的小部件、面板、弹窗都需要对应一个脚本  
当前类所在的节点添加预制体时，提供了以下几个方法

- `addPanel`    预添加可切换的面板，没有真正创建实例，使用示例可参考 `EmbedWindow` 
- `showPanel`   显示预制体面板，如果有实例则直接显示，没有实例则创建后显示，使用示例可参考 `EmbedWindow` 
- `addUI`       添加预制体节点，直接加载并创建实例，有参数提示，使用示例可参考 `EmbedWindow` 
- `loadUI`      加载预制体节点，只加载不进行创建实例



2. 弹窗  
在弹窗关闭时，默认会自动释放弹窗的预制体资源，如果需要关闭可以调用 `setReleaseWindowPrefab` 进行设置  

使用示例 PauseWindow.ts
```

const { prefabUrl } = tnt._decorator;

// 外部需要传入的参数
// 参数接口命名规则：弹窗名+Options，如弹窗名为 `PauseWindow` 则接口命名为 `PauseWindowOptions`
// 注意需要使用 declare global {} ，否则智能提示不生效

declare global { 
  interface PauseWindowOptions{
    pauseBgm: boolean;
  }
}

//@prefabUrl("window-example#prefabs/PauseWindow")// 预制体路径  写法1 
@prefabUrl("prefabs/window/PauseWindow","window-example") // 预制体路径，写法2 两种写法都可以
@ccclass('PauseWindow')
export class PauseWindow extends tnt.UIPopup<PauseWindowOptions> {
    
    onActive(): void {
      // 窗口激活, 首次打开和从冻结状态激活都会被调用
      if(this.options.pauseBgm){
        // ...
      }
    }
    onFreeze(): void {
      // 窗口冻结，窗口被关闭时不会被自动调用
    }

    onShowCallback() {
      // 界面完整显示的回调
    }
    onCloseCallback() {
      // 界面完全关闭的回调
    }
    
    _playShowAnimation(tag: number, callback: () => void) {
      // 定制显示动效
      callback();
    }
    _playCloseAnimation(tag: number, callback: () => void) {
      // 定制关闭动效
      callback();
    }
    // ... 其他方法请直接查看 UIWindowBase 源码 
}

```


### 场景管理
每个场景要对应一个同名脚本，用框架插件生成 Scene 声明文件后，调用时会有代码提示

![img2](./readme-img/img2.gif)




### 事件管理
类 `EventMgr`  
使用方式与引擎的事件管理基本一致，尽量保证 `on、off ` 成对出现，或者直接使用 `targetOff`
```
  tnt.eventMgr.on("key1",()=>{},this);
  tnt.eventMgr.on("key2",()=>{},this);
  tnt.eventMgr.on("key3",()=>{},this);

  
  tnt.eventMgr.targetOff(this);
```


### 池管理
类 `PoolMgr`
对 Pool 进行统一管理，方便任意地方去使用



### 按钮通用事件管理
类 `BtnCommonEventMgr` 
内置按钮音效插件


### 红点管理

### 寻路


### 相机控制
#### 相机跟随
#### 相机缩放/双指缩放
#### 屏幕震动
 


### 活动管理

### 参考  
#### MVVM  
https://forum.cocos.org/t/topic/78821  
https://github.com/wsssheep/cocos_creator_mvvm_tools  
https://github.com/vuejs/core.git  
https://github.com/sl1673495/typescript-proxy-reactive.git


#### 其他  
https://github.com/AILHC/EasyGameFrameworkOpen   
https://blog.csdn.net/xzben/article/details/120039818   
https://github.com/1226085293/nodes/blob/master/assets/essential/engine/node/nodes.js   
https://github.com/fairygui/FairyGUI-cocoscreator/blob/master/source/src/fairygui/GObject.ts   
https://github.com/fairygui/FairyGUI-cocoscreator/blob/master/source/src/fairygui/DragDropManager.ts   