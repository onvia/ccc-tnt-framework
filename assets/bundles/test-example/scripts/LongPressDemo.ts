import { Label, Node, tween, v3, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass('LongPressDemo')
export class LongPressDemo extends tnt.SceneBase implements IMVVMObject {


    btnLongPress: Node = null;

    data = {
        count: 0,
        totalCount: 0
    }

    onEnterTransitionStart(sceneName?: string): void {

        tnt.vm.observe(this);
        this.btnLongPress = this.find("btnLongPress");
        let labelCount = this.findComponent("labelCount", Label);
        let labelTotalCount = this.findComponent("labelTotalCount", Label);

        tnt.vm.label(this, labelCount, "*.count");
        tnt.vm.label(this, labelTotalCount, "*.totalCount");

        // 注册长按
        tnt.touch.onLongPress(this.btnLongPress, (count) => {
            this.data.count = count;
            this.data.totalCount++;
            tween(this.btnLongPress).to(0.04, { scale: v3(1.1, 1.1, 1.1) }).to(0.04, { scale: v3(1, 1, 1) }).start();
        }, this, 0.1);
    }

    onEnter(): void {
    }

    onExit(): void {
    }

    onExitTransitionStart(sceneName?: string): void {
        tnt.vm.violate(this);
        // 取消长按
        tnt.touch.offLongPress(this.btnLongPress);
    }
}
