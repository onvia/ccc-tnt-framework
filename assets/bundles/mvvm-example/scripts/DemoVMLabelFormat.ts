import { _decorator, Component, Node, Vec3, Label } from 'cc';
const { ccclass, property } = _decorator;

type AttrBind<T> = {
    [P in keyof T]?: string;
};

@ccclass('DemoVMLabelFormat')
export class DemoVMLabelFormat extends tnt.SceneBase {

    data = {

    }
    onEnterTransitionStart(sceneName?: string): void {
        // tnt.vm.bindData(this);
        // tnt.vm.bind(this,this.label,{

        // });
        let att: AttrBind<Node> = {
            position: "",
        };
        let label: Label = null;
        this.bind(label, {
            'string': "",
        });
    }

    bind<T>(component: T, attr: AttrBind<T>) {
        
    }
}

