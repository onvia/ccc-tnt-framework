import { _decorator, Node, Label, math, Color, ScrollView } from "cc";
import { VMItem } from "./VMItem";

const { ccclass } = _decorator;
const { prefabUrl, node, sprite, scrollView, button, VMLabel, VMFor, mvvm } = tnt._decorator;


declare global {
    interface VMPanelBaseOptions {

    }
}
const _data = {

    array: [
        { name: 'sn1', age: 18, sex: 0 },
        { name: 'sn2', age: 16, sex: 1 },
        { name: 'sn3', age: 12, sex: 2 },
    ],
}

//@prefabUrl("{bundle}#{path}/VMPanelBase")
@ccclass('VMPanelBase')
@mvvm()
export class VMPanelBase extends tnt.UIPanel<VMPanelBaseOptions> {


    @VMLabel("*.array.0.name")
    title: Label = null;


    @scrollView("ScrollView")
    scrollView: ScrollView = null;

    @VMFor({
        watchPath: "*.array",
        component: VMItem,
        onChange(operate) {
            if (operate == 'delete' || operate === 'add') {
                this.scrollView.scrollToBottom(0.1);
            }
        },
    })
    vmForContent: Node = null;

    data = {
        name: "PanelBase",
        obj: { progress: 1 },
        color: new Color(255, 1, 234, 255),

        array: [
            { name: 's1', age: 18, sex: 0 },
            { name: 's2', age: 16, sex: 1 },
            { name: 's3', age: 12, sex: 2 },
        ],
    }


    protected onStart(): void {
        this.schedule(() => {
            this.data.obj.progress = math.randomRangeInt(0, 100);
        }, 3.5);


        this.registerButtonClick("btnAddItem", () => {
            this.data.array.push(_data.array.random());
        });

        this.registerButtonClick("btnDelItem", () => {
            if (this.data.array.length) {
                this.data.array.removeOne(this.data.array.random());
            }
        });
        this.registerButtonClick("btnUpdateItem", () => {
            this.data.array[0].name = _data.array.random()?.name;
            tnt.vm.trigger(this.data.array);
        });
    }
}
