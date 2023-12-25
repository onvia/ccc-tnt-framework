
# MVVM

## 简介

纯代码方式的 mvvm 工具，对组件属性绑定数据，通过修改数据来控制 UI 表现。  
原理是使用 Proxy 对数据进行代理，当修改数据时调用相应的处理方法对绑定的属性进行设置。

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

装饰器是对普通方法的包装，二者可以混合使用

[普通方法](./%E6%99%AE%E9%80%9A%E6%96%B9%E6%B3%95.md)

[装饰器](./%E8%A3%85%E9%A5%B0%E5%99%A8.md)


具体使用请参考项目示例 `MVVM`


### 关于数组的使用

数组添加元素、删除元素、重新赋值指定索引的元素，都会触发数组数据改变的事件
如果数组元素是对象，修改对象属性不会触发数组的更新

例如
```
    data = {
        array: [
            { name: 'sn1', age: 18, sex: 0 },
            { name: 'sn2', age: 16, sex: 1 },
            { name: 'sn3', age: 12, sex: 2 },
        ],
    }

    // 删除最后一个
    this.data.array.pop()

    // 删除第一个
    this.data.array.splice(0, 1);

    // 只留一个元素
    data.array.length = 1; 

    // 更新元素
    data.array[0] =  { name: 'sn999', age: 999, sex: 2 },

    // 添加元素
    data.array[data.array.length] =  { name: data.array.length, age: 4, sex: 2 },
    data.push({ name: 'sn5', age: 5, sex: 2 });

```