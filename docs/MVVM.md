
# MVVM


## 项目结构
项目所有脚本文件都在 `assets\a-framework\mvvm` 中
- handlers 文件夹为数据处理脚本，你可以增加一些特殊的处理
- reactivity 实现数据监听的核心脚本，改变数据会自动调用相应的处理类
- _mv_declare.ts 类型声明
- _mvvm.ts 暴露给用户的接口，使用中只能调用这里面的方法，调用方法为 `tnt.vm.xxx`
- VMFactory.ts 属性处理的工厂类，数据处理脚本需要注册到工厂类里面
- VMGeneral.ts 通用函数
- VMTween.ts 数据缓动，如果想对数据进行缓动显示，需要这个类。缓动只是一个表现，实际数据已经修改成目标值


## 用法
### 监听数据、取消监听  tnt.vm.observe/tnt.vm.violate

被监听的数据必须是一个对象，而不能是基础类型。原理是使用 `Proxy` 对数据进行代理。

1. 如果是全局数据，调用方式为：
```
class UserData {

    nickName: string = '玩家';
    level: number = 0;
    gold: number = 0;
    gem: number = 0;
    atk: number = 0;
    maxHP: number = 999;
    maxMP: number = 999;

}
let _userData = new UserData();
// 监听，需要传入数据标签
export const userData = tnt.vm.observe(_userData,"userData");

```

在后续使用中，如果想修改数据，就需要使用被处理过的对象 `userData` ，而不能使用原始 `_userData`，否则数据修改无法通知到监听者：

```
userData.level ++; // 数据修改后，会通知监听者
```

也可以使用 `tnt.vm.setValue` 修改数据：
```
// 全局自由使用路径
tnt.vm.setValue("userData.level",2);
```

如果全局用户数据存在于整个游戏生命周期内，则不需要取消监听。
如果想取消监听，可以调用：

```
// 通过标签取消指定的数据监听
tnt.vm.violate("userData");
```


2. 如果是组件脚本中的数据，组件脚本需要实现 `IMVVMObject` 接口

```

let _tempData = {
    distance: 6,
}

@ccclass('Demo')
export default class Demo extends Component implements IMVVMObject {

    // IMVVMObject 需要 data 属性
    data = {
        icon: "textures/star",
        count: 5,
    }

    tempData: typeof _tempData = null;

    onEnable(){
        // 监听 IMVVMObject 对象会对 data 进行监听，并将 data 重新赋值为 Proxy
        tnt.vm.observe(this);

        // 所以后续使用数据可以直接用：
        this.data.count ++;  

        // 监听野生数据
        this.tempData = tnt.vm.observe(_tempData,"tempData");

        // 后续使用
        this.tempData.distance ++; // 直接修改 _tempData 无法通知监听者
        
        //...
        //...
    }

    onDisable(){
        // 取消监听
        tnt.vm.violate(this); // 组件数据可以不取消，框架会自动取消。但是为了完整性，还是建议调用。
        tnt.vm.violate("tempData"); // 野生数据必须取消监听，否则数据模型会一直存在，后续无法监听同名数据
    }
}

```


### 组件绑定数据 

`tnt.vm.bind` 通用方法，当框架提供的接口不满足需求时，可以调用此接口，或自行扩展  
`tnt.vm.node` 绑定 `Node`   
`tnt.vm.sprite` 绑定 `Sprite`   
`tnt.vm.label` 绑定 `Label`   
`tnt.vm.progressBar` 绑定 `ProgressBar`   
`tnt.vm.silder` 绑定 `Silder`   
`tnt.vm.for` 一般用做绑定数组，动态增加，删除，修改节点   

具体使用方式如下：
```

const { node, label, button, slider, progressBar, editBox } = tnt._decorator;

let _tempData = {
    distance: 6,
}

@ccclass('Demo')
export default class Demo extends Component implements IMVVMObject {

    @label("labelCount") // 传入节点名
    label: Label = null;

    @sprite() //节点名和属性同名，不传参数
    icon: Sprite = null;

    @label() 
    labelTest: Label = null;


    // IMVVMObject 需要 data 属性
    data = {
        icon: "textures/star",
        count: 5,
        color: Color.RED,
    }

    tempData: typeof _tempData = null;


    onEnable(){       
        //...
        //...

        // 这里有多种调用方式
        //1. 使用 *.count 的方式监听数据，则监听的当前组件内的 data 数据，程序会自动将 * 替换成 当前 IMVVMObject 的标签
        tnt.vm.label(this, this.label, '*.count'); // 只对 string 进行数据监听
        
        //2. 只对 string 进行数据监听
        tnt.vm.label(this, this.label, '*.count',(opts)=>{
            // 这里可以对数据进行二次处理
            return Math.max(0,opts.newValue);
        }); 
        
        //3. 多个属性的数据监听
        tnt.vm.label(this, this.label, {
            string: {
                watchPath: '*.count',
                isBidirection: true, // 双向绑定
                tween: true, // 缓动，当值为 true 时，缓动时间为默认 0.3 秒。值为 number 类型时，缓动时间为传入的值。如果默认缓动不满足需求，可以实现 IVMTween ，并传入实例
                formator: (opts)=>{
                    // 对数据进行二次处理
                    return opts.newValue;
                }
            },
            color: "*.color", // 对颜色进行监听
        });

        // 监听野生数据， 野生参数需要传入完整监听路径
        tnt.vm.label(this, this.labelTest, 'tempData.distance'); 

        // Sprite 
        tnt.vm.sprite(this,this.icon,"*.icon");


        // 修改数据
        this.data.count ++;
        this.data.icon = "textures/icon";
        this.tempData.distance ++;
    }

    onDisable(){
        // 取消监听
        //...
    }
}
```

具体使用请参考项目示例 `MVVM`