
# CocosCreator 3.x 游戏开发框架

### 介绍

 TNT 是基于 Cocos Creator 3.x 的游戏框架。  

使用本框架可以不再深度依赖编辑器，不需要在编辑器中挂载脚本到节点（多语言还是需要的），在运行时会自动挂载脚本到节点。  
这样做的优势在于可控性高，团队协作方便。  
框架所有管理者单例和大部分类都挂载到了全局变量 `tnt` 上。  
游戏启动需要有一个启动类和启动场景，将启动类挂载到启动场景中，在后续使用过程中，基本不再需要手动在节点挂载组件了。  


### 安装

#### 方式一 (推荐)
通过 Cocos Store 下载 TNT 插件安装

#### 方式二
通过 仓库 Release 直接下载解压


### 启动

框架启动需要实现 `IStartupOptions`  
详细的使用可以启动实例 `Launcher.scene` 查看，脚本同名。

```

// 框架初始化
tnt.startup(startupOptions);

```

>本框架作为单独的 Bundle 使用，Bundle 名为 `framework`  
>`Releases` 中发布的 `tnt.zip` 已内置 `preload-tnt.js` 脚本，作用是在引擎加载阶段加载 `framework` Bundle  
>为保证在编辑器内优先加载框架代码，这里名为 `framework` 的 Bundle 使用了 `a-framework` 作为文件夹名，开发过程中其他 Bundle 尽量保证在框架 Bundle 后加载

> 从本仓库获取到的插件请在插件目录 `./extensions/{插件}` 下执行 `npm install` 进行安装所需要的包

### 文档目录
- [CocosCreator 3.x 游戏开发框架](#cocoscreator-3x-游戏开发框架)
    - [基类](./docs/%E5%9F%BA%E7%B1%BB.md)
    - [资源管理](./docs/%E8%B5%84%E6%BA%90%E7%AE%A1%E7%90%86.md)
    - [场景管理](./docs/%E5%9C%BA%E6%99%AF%E7%AE%A1%E7%90%86.md)
    - [弹窗管理](./docs/%E5%BC%B9%E7%AA%97%E7%AE%A1%E7%90%86.md)
    - [事件管理](./docs/%E4%BA%8B%E4%BB%B6%E7%AE%A1%E7%90%86.md)
    - [音效管理](./docs/%E9%9F%B3%E6%95%88%E7%AE%A1%E7%90%86.md)
    - [网络管理](./docs/%E7%BD%91%E7%BB%9C%E7%AE%A1%E7%90%86.md)
    - [输入](./docs/%E8%BE%93%E5%85%A5.md)
    - [全局定时器](./docs/%E5%85%A8%E5%B1%80%E5%AE%9A%E6%97%B6%E5%99%A8.md)
    - [池管理](./docs/%E6%B1%A0%E7%AE%A1%E7%90%86.md)
    - [拖放管理](./docs/Drag%26Drop.md)
    - [截图管理](./docs/%E6%88%AA%E5%9B%BE%E7%AE%A1%E7%90%86.md)
    - [按钮通用事件管理](./docs/%E6%8C%89%E9%92%AE%E9%80%9A%E7%94%A8%E4%BA%8B%E4%BB%B6%E7%AE%A1%E7%90%86.md)
    - [多语言](./docs/%E5%A4%9A%E8%AF%AD%E8%A8%80.md)
    - [TiledMap](./docs/TiledMap.md)
    - [MVVM](./docs/MVVM.md)
    - [装饰器](./docs/%E8%A3%85%E9%A5%B0%E5%99%A8.md)
    - [热更新](./docs/%E7%83%AD%E6%9B%B4%E6%96%B0.md)
    - [工具类](./docs/%E5%B7%A5%E5%85%B7%E7%B1%BB.md)
    - [引擎扩展](./docs/%E5%BC%95%E6%93%8E%E6%89%A9%E5%B1%95.md)
    - [工具插件](./docs/%E5%B7%A5%E5%85%B7%E6%8F%92%E4%BB%B6.md)
      - [PSD2Prefab工具](./docs/%E6%8F%92%E4%BB%B6%26%E5%B7%A5%E5%85%B7/PSD2Prefab%E5%B7%A5%E5%85%B7.md)
    - [参考](#参考)
      - [MVVM](#mvvm)
      - [其他](#其他)
### 在线示例
https://onvia.gitlab.io/ccc-demo/tnt-example/


### 感谢
[Preview 插件](https://github.com/kaxifakl/cocos-preview) 由 [卡西法](https://github.com/kaxifakl) 提供


### QQ群
- 858173205



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
https://github.com/mapeditor/tiled