import { _decorator, Component, Node, EventTouch, Layout, instantiate } from 'cc';
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
        this.registerToggleClick("Toggle", (toggle) => {
            this.setLabelText("labelToggleState1", "复选状态：" + toggle.isChecked);
        });

        // 滑块
        this.registerSliderEvent("Slider", (slider) => {
            this.setLabelText("labelSliderState", `滑块进度：${slider.progress.toFixed(2)}`);

        });

        this.registerEditBoxDidEnd("EditBox", (editBox) => {
            this.setLabelText("labelEditBoxState", `输入：${editBox.string}`);
        });


        // let layout1 = this.getNodeByName("Layout1");
        // let layout2 = this.getNodeByName("Layout2");
        // let labelTest = this.getNodeByName("labelTest");
        // labelTest.label.string = "0";

        // let copy1 = instantiate(labelTest);
        // copy1.name = "labelTest";
        // copy1.parent = layout1;
        // copy1.label.string = "1";


        // let findCopy1 = this.getNodeByName("labelTest", layout1);

        // console.log(`BaseDemo-> `);


        // let copy2 = instantiate(labelTest);
        // copy2.name = "labelTest";
        // copy2.parent = layout2;
        // copy2.label.string = "2";
        // let findCopy2 = this.getNodeByName("labelTest", layout2);

        // console.log(`BaseDemo-> `);

    }

}

