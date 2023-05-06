import { join } from "path";
 
export function load() {}
export function unload() {} 
// 加载 ‘cc’ 需要设置搜索路径
module.paths.push(join(Editor.App.path, 'node_modules'));
import { director } from 'cc'; 

export function updateSceneRenderers() { // very costly iterations

    const rootNodes = director.getScene()!.children;
    // walk all nodes with localize label and update
    const allLocalizedLabels: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let labels = rootNodes[i].getComponentsInChildren('LocalizedLabel');
        Array.prototype.push.apply(allLocalizedLabels, labels);
    }
    for (let i = 0; i < allLocalizedLabels.length; ++i) {
        let label = allLocalizedLabels[i];
        if(!label.node.active)continue;
        label.updateLabel();
    }
    // walk all nodes with localize sprite and update
    const allLocalizedSprites: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let sprites = rootNodes[i].getComponentsInChildren('LocalizedSprite');
        Array.prototype.push.apply(allLocalizedSprites, sprites);
    }
    for (let i = 0; i < allLocalizedSprites.length; ++i) {
        let sprite = allLocalizedSprites[i];
        if(!sprite.node.active)continue;
        sprite.updateSprite();
    }
}
export const methods = {
    updateSceneRenderers: updateSceneRenderers,
}