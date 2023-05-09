import { Node, Canvas, director, dynamicAtlasManager, macro, Layers, SpriteFrame, Sprite, UITransform, Layout, ScrollView, v3, isValid, view } from "cc";


declare global {
    interface ITNT {
        debug: DebugUtils;
    }
}

class DebugUtils {

    _debugNode: Node = null;
    showDynamicAtlasDebug(show) {
        let canvas = director.getScene().getComponentInChildren(Canvas)?.node;
        let mgr = dynamicAtlasManager;
        console.log(`DynamicAtlasLearn-> ${mgr.enabled},${macro.CLEANUP_IMAGE_CACHE}`);


        let _debugNode = this._debugNode;
        if (show) {

            let addToScene = (content) => {

                let fn = (atlasObj) => {
                    // @ts-ignore
                    for (let i = 0; i <= atlasObj._atlasIndex; i++) {
                        let node = new Node(atlasObj.name || 'ATLAS');

                        node.layer = Layers.Enum.UI_2D;
                        // @ts-ignore
                        let texture = atlasObj._atlases[i]._texture;
                        let spriteFrame = new SpriteFrame();
                        spriteFrame.texture = texture;


                        let sprite = node.addComponent(Sprite);
                        sprite.spriteFrame = spriteFrame;

                        node.parent = content;
                    }
                }

                fn(mgr);
                // @ts-ignore
                let _atlasesForWindow = mgr._atlasesForWindow;
                if (_atlasesForWindow) {
                    for (let i = 0; i < _atlasesForWindow.length; i++) {
                        const atlasObj = _atlasesForWindow[i];
                        fn(atlasObj)
                    }
                }
            }


            if (!_debugNode || !_debugNode.isValid) {
                let width = view.getVisibleSize().width;
                let height = view.getVisibleSize().height;

                _debugNode = new Node('DYNAMIC_ATLAS_DEBUG_NODE');
                let transform = _debugNode.addComponent(UITransform);
                transform.width = width;
                transform.height = height;

                _debugNode.setSiblingIndex(999);


                _debugNode.parent = canvas;
                _debugNode.layer = Layers.Enum.UI_2D;

                let scroll = _debugNode.addComponent(ScrollView);

                let content = new Node('CONTENT');
                let layout = content.addComponent(Layout);
                layout.type = Layout.Type.VERTICAL;
                layout.resizeMode = Layout.ResizeMode.CONTAINER;
                let contentTR = content.addComponent(UITransform);
                content.parent = _debugNode;
                contentTR.width = mgr.textureSize;
                contentTR.anchorY = 1;
                content.position = v3(mgr.textureSize, 0, 0);
                content.layer = Layers.Enum.UI_2D;
                scroll.content = content;

                addToScene(content);

                this._debugNode = _debugNode;
            } else {
                let content = _debugNode.getChildByName("CONTENT");
                content.destroyAllChildren();
                addToScene(content);
            }
            return _debugNode;
        }
        else {
            if (_debugNode && isValid(_debugNode)) {
                _debugNode.parent = null;
                _debugNode.destroy();
            }
        }

        this._debugNode = _debugNode;
    }
}

tnt.debug = new DebugUtils();
export {};