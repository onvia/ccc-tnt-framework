import { _decorator, Component, Label, Slider, ProgressBar, EventHandler, EditBox } from 'cc';
import { userData } from './UserData';
const { ccclass, inspector, property } = _decorator;
const { node, label, button, slider, progressBar, editBox } = tnt._decorator;

@ccclass('DemoVMProgress')
export default class DemoVMProgress extends tnt.SceneBase implements IMVVMObject {


    @label()
    HPLabel: Label = null;

    @slider()
    HPController: Slider = null;

    @progressBar()
    HPProgress: ProgressBar = null;


    @label()
    MPLabel: Label = null;


    @progressBar()
    MPProgress: ProgressBar = null;

    @slider()
    MPController: Slider = null;

    
    @editBox()
    HPEditBox: EditBox = null;

    @editBox()
    MPEditBox: EditBox = null;


    data = {
        hp: 90,
        mp: 1,
    }

    protected onStart(): void {
        super.onStart();
        window["demovmprogress"] = this;
    }

    onEnable() {
        {

            // 手动添加 滑块的滑动事件
            let handler = new EventHandler();
            handler.target = this.node;
            handler.component = "DemoVMProgress";
            handler.handler = "onHPControllerEvent";
            this.HPController.slideEvents.push(handler);
        }
        {

            // 手动添加 滑块的滑动事件
            let handler = new EventHandler();
            handler.target = this.node;
            handler.component = "DemoVMProgress";
            handler.handler = "onMPControllerEvent";
            this.MPController.slideEvents.push(handler);
        }

        this.registerEditBoxDidEnd(this.HPEditBox,this.onHPEditBoxEnded);
        this.registerEditBoxDidEnd(this.MPEditBox,this.onMPEditBoxEnded);


        tnt.vm.observe(this);
        tnt.vm.observe(userData, "userData");
        tnt.vm.label(this, this.HPLabel, ['*.hp', 'userData.maxHP']);
        tnt.vm.progressBar(this, this.HPProgress, ['*.hp', 'userData.maxHP']);
        tnt.vm.slider(this, this.HPController, ['*.hp', 'userData.maxHP']);


        tnt.vm.label(this, this.MPLabel, '*.mp');
        
     
        tnt.vm.progressBar(this, this.MPProgress, {
            progress: {
                watchPath: '*.mp',
                isBidirectional: true,
            }
        });
        tnt.vm.slider(this, this.MPController, '*.mp');
    }

    onDisable() {
        tnt.vm.violate(this);
        tnt.vm.violate("userData");
        window["demovmprogress"] = undefined;
    }


    onHPEditBoxEnded(event) {
        console.log('DemoVMProgress-> ', event.string);

        let num = parseInt(event.string);
        if (isNaN(num)) {
            return;
        }
        this.data.hp = Math.min(num, userData.maxHP);

    }

    onMPEditBoxEnded(event) {
        console.log('DemoVMProgress-> ', event.string);

        let num = parseFloat(event.string);
        if (isNaN(num)) {
            return;
        }
        this.data.mp = Math.min(num, 1);
    }

    onHPControllerEvent(event: Slider) {
        let hp = Math.round(userData.maxHP * event.progress);
        this.data.hp = hp;
    }
    onMPControllerEvent(event: Slider) {
        this.data.mp = event.progress;
        console.log('DemoVMProgress-> ', this.data.mp);
    }
}

