import { _decorator, Component, Node, ScrollView, __private, path, instantiate, js, assetManager, director, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MVVMDemoList')
export class MVVMDemoList extends tnt.SceneBase {


    onEnterTransitionStart(sceneName?: string): void {
        let item = this.getNodeByName("Item");
        let scrollView = this.findComponent("ScrollView", ScrollView);
        item.removeFromParent();

        let bundle = this.loader.getBundle(this.bundle as string);
        if(!bundle){
            return;
        }

        let sceneArr = []
        // @ts-ignore
        bundle.config.scenes.forEach((scene) => {
            sceneArr.push(scene);
        });

        sceneArr.sort((a, b) => {
            let scenenameA = path.basename(a.url, '.scene');
            let scenenameB = path.basename(b.url, '.scene');

            if (scenenameA[0] > scenenameB[0]) {
                return 1;
            }
            if (scenenameA[0] < scenenameB[0]) {
                return -1;
            }
            return 0;
        });


        sceneArr.forEach((scene) => {
            let url = scene.url as string;
            let scenename = path.basename(url, '.scene');
            if (!scenename.startsWith("Demo")) {
                return;
            }
            let newItem = instantiate(item);
            let label = newItem.getComponentInChildren(Label);
            label.string = path.basename(url);
            newItem.parent = scrollView.content;
            newItem.on(Node.EventType.TOUCH_END, () => {
                this.toScene(scenename);
            });
        });
    }

    toScene(scenename: string) {
        if (!scenename) {
            tnt.toast.show("场景名称不能为空");
            return;
        }
        let clazz = js.getClassByName(scenename);

        let bundle = assetManager.bundles.find((bundle) => {
            return !!bundle.getSceneInfo(scenename);
        });

        tnt.loaderMgr.share.loadBundle(bundle.name, () => {
            if (clazz && js.getSuper(clazz) == tnt.SceneBase) {
                // @ts-ignore
                tnt.sceneMgr.toScene(clazz);
            } else {
                tnt.toast.show(`无法跳转到场景： ${js.getClassName(clazz)}`);
            }
        });

    }
}

