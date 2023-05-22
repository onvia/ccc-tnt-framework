import { _decorator, Component, Node, Label, Rect, Color, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MVVMScene')
export class MVVMScene extends tnt.SceneBase implements IMVVM {
    data = {
        name: '',
        info: 'xin',
        gold: 0,
        diamond: 9000,
        progress: 0,
        icon: 0,
        check: {
            selectA: true,
            selectB: false,
            selectC: false,
        },
        obj: {
            progress: 0
        },
        array: [
            { name: 's1', age: 18, sex: 0 },
            { name: 's2', age: 16, sex: 1 },
            { name: 's3', age: 12, sex: 2 },
        ],
        index: [2, 1, 6, 3, 7, 5, 4],
        color: new Color(255, 1, 234, 255)
    }

    onEnterTransitionStart(sceneName?: string): void {
        // let proxy = tnt.vm._reactive(this.data);
        tnt.vm.observe(this);
        // this.data.name
        // this.data.name = "123";
        // this.data.obj.progress
        // this.data.obj.progress = 1;
        // this.data.index[0];
        // this.data.index.push(8);
        // this.data.index.splice(0,1);
        // let idx = this.data.index.indexOf(6);
        this.data.index.length = 20;
        console.log(`MVVMScene-> `);
        
        // this.data.array[0].age;
        // this.data.array[1].age = 22;

        // proxy.obj.progress
        // proxy.obj.progress = 1;

        // let label: Label = this.getLabelByName("label");
        // let sprite: Sprite = this.getSpriteByName("sprite");
        // // tnt.vm.bind(this, label, "*.name");
        // // tnt.vm.bind(this, label, {
        // //     color: "*.color"
        // // });
        // // tnt.vm.bind(this, label, {
        // //     'string': {
        // //         watchPath: "",
        // //         // tween: 
        // //         formator(options) {
        // //             return "";
        // //         },
        // //     },
        // //     'color': "*.color"
        // // });
        // tnt.vm.label(this, label, "*.array.0.age", () => {
        //     return Promise.resolve("");
        // });


        // tnt.vm.bind(this, sprite, {
        //     'spriteFrame': {
        //         watchPath: "",
        //         formator: async (options) => {
        //             return Promise.resolve(new SpriteFrame());
        //         },
        //     }
        // });

        // tnt.vm.observe(this);
        // tnt.vm.observe(this, "MVVMScene");
        // tnt.vm.observe(this.data, "MvvmData");
        // tnt.vm.observe(this, { xxx: 11, ddd: 22 });
        // tnt.vm.observe(this, { xxx: 11, ddd: 22 },"MVVMTag");
    }
}

