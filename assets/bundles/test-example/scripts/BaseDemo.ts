import { _decorator, Component, Node, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseDemo')
export class BaseDemo extends tnt.SceneBase {


    onEnterTransitionFinished(sceneName?: string): void {
        let btnCount = 0;
        // 按钮
        this.registerButtonClick("button", () => {
            this.setLabelText("labelBtnState", "按钮点击: " + btnCount++);
        });
        // ToggleGroup
        this.registerToggleGroupEvent("ToggleGroup", (toggle) => {
            this.setLabelText("labelToggleState0", "选中：" + toggle.node.name);
        });
        // 设置默认选中 Toggle3
        this.toggleCheck("ToggleGroup", "Toggle3");

        // 触摸
        this.registerNodeTouchEvent("SpriteTouch", {
            onTouchBegan: (event: EventTouch) => {
                this.setLabelText("labelSpriteTouchState", `触摸状态：按下`);
            },
            onTouchMoved: (event: EventTouch) => {
                let dis = event.getUIStartLocation().subtract(event.getUILocation()).length();

                if (dis > 10) {
                    this.setLabelText("labelSpriteTouchState", `触摸状态：移动`);
                }
            },
            onTouchEnded: (event: EventTouch) => {
                this.setLabelText("labelSpriteTouchState", `触摸状态：结束`);
            },
            onTouchCancel: (event: EventTouch) => {
                this.setLabelText("labelSpriteTouchState", `触摸状态：取消`);
            }
        });

        // 长按
        let longPressCount = 0;
        this.registerNodeLongTouchEvent("SpriteLongTouch", 0.1, () => {

            this.setLabelText("labelLongPress", `长按：${longPressCount++}`);
        });

        // Toggle
        this.registerToggleClick("Toggle",(toggle)=>{
            this.setLabelText("labelToggleState1", "复选状态：" + toggle.isChecked);
        });
        
        // 滑块
        this.registerSliderEvent("Slider",(slider)=>{
            this.setLabelText("labelSliderState",`滑块进度：${slider.progress.toFixed(2)}`);
            
        });

        this.registerEditBoxDidEnd("EditBox",(editBox)=>{
            this.setLabelText("labelEditBoxState",`输入：${editBox.string}`);
        });
    }

}

