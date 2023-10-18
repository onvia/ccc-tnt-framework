import { _decorator, Node, Prefab, ToggleContainer, Size } from "cc";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global {
    interface CCGUITestSceneOptions {

    }
}

@ccclass('CCGUITestScene')
export class CCGUITestScene extends tnt.SceneBase<CCGUITestSceneOptions> {

    async onEnter(): Promise<void> {
        tnt.resourcesMgr.loadBundle("cc-gui", async () => {
            await this.addDebugWindow();
        });
        // await this.add2Window();
    }


    async addDebugWindow() {
        await new Promise<void>((resolve, reject) => {
            tnt.resourcesMgr.loadBundle("cc-gui", () => {
                resolve();
            });
        });

        let testProgress = 0;
        let guiWindow = await tnt.gui.create("Debug", new Size(360, 9999));
        {

            let group1 = guiWindow.addGroup("Common");
            group1
                .addEditText("edit-box", (text) => {
                    console.log(`CCGUITestScene-> edit-box ${text}`);

                })
                .addCheckbox("check-box0", (isChecked) => {
                    console.log(`CCGUITestScene-> check-box ${isChecked}`);

                }, false)
                .addCheckbox("check-box1", (isChecked) => {
                    console.log(`CCGUITestScene-> check-box1 ${isChecked}`);

                })
                .addToggle("toggle0", (isChecked) => {
                    console.log(`CCGUITestScene-> toggle0 ${isChecked}`);
                }, false)
                .addToggle("toggle1", (isChecked) => {
                    console.log(`CCGUITestScene-> toggle1 ${isChecked}`);
                }, false)
                .addProgressBar("progressBar", {
                    updateProgressFn: () => {
                        return testProgress / 100;
                    },
                    updateLabelFn: () => {
                        return `${testProgress.toFixed(2)}/100`;
                    }
                })
                .addSlider("slider", {
                    defaultValue: 20,
                    maxValue: 99,
                    callback: (value) => {
                        console.log(`CCGUITestScene-> slider  ${value}`);

                    }
                })
                .addGroup("panel1")
                .addItemToggle("item-check1", (isChecked) => { console.log(`CCGUITestScene-> item-check1 ${isChecked}`); })
                .addItemToggle("item-check2", (isChecked) => { console.log(`CCGUITestScene-> item-check2 ${isChecked}`); })
                .addItemToggle("item-check3", (isChecked) => { console.log(`CCGUITestScene-> item-check3 ${isChecked}`); })
                .addItemButton("item-button1", () => { console.log(`CCGUITestScene-> item-button1`); })
                .addItemButton("item-button2", () => { console.log(`CCGUITestScene-> item-button2`); })

            group1.addGroup("panel2")
                .addItemToggle("item-check1", (isChecked) => { console.log(`CCGUITestScene-> item-check1 ${isChecked}`); })
                .addItemToggle("item-check2", (isChecked) => { console.log(`CCGUITestScene-> item-check2 ${isChecked}`); })
                .addItemToggle("item-check3", (isChecked) => { console.log(`CCGUITestScene-> item-check3 ${isChecked}`); })
                .addItemButton("item-button1", () => { console.log(`CCGUITestScene-> item-button1`); })
                .addItemButton("item-button2", () => { console.log(`CCGUITestScene-> item-button2`); })

            group1.addGroup("panel3")
                .addItemToggle("item-check1", (isChecked) => { console.log(`CCGUITestScene-> item-check1 ${isChecked}`); })
                .addItemToggle("item-check2", (isChecked) => { console.log(`CCGUITestScene-> item-check2 ${isChecked}`); })
                .addItemToggle("item-check3", (isChecked) => { console.log(`CCGUITestScene-> item-check3 ${isChecked}`); })
                .addItemButton("item-button1", () => { console.log(`CCGUITestScene-> item-button1`); })
                .addItemButton("item-button2", () => { console.log(`CCGUITestScene-> item-button2`); })

            group1.addGroup("panel4")
                .addItemToggle("item-check1", (isChecked) => { console.log(`CCGUITestScene-> item-check1 ${isChecked}`); })
                .addItemToggle("item-check2", (isChecked) => { console.log(`CCGUITestScene-> item-check2 ${isChecked}`); })
                .addItemToggle("item-check3", (isChecked) => { console.log(`CCGUITestScene-> item-check3 ${isChecked}`); })
                .addItemButton("item-button1", () => { console.log(`CCGUITestScene-> item-button1`); })
                .addItemButton("item-button2", () => { console.log(`CCGUITestScene-> item-button2`); })
        }


        this.schedule((dt) => {
            testProgress += dt;
        }, 0.1);
    }

    async add2Window() {
        await tnt.gui.create("Debug2", new Size(300, 500));
        await tnt.gui.create("Debug3", new Size(600, 360));
        await tnt.gui.create("Debug4", new Size(360, 480));
        await tnt.gui.create("Debug5", new Size(360, 480));
        await tnt.gui.create("Debug6", new Size(120, 120));

    }

    onExit(): void {

    }

    protected onDestroy(): void {
        tnt.gui.destroy();
    }
    //protected update(dt: number): void {
    //    
    //}
}
