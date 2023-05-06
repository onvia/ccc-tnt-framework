"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.methods = exports.updateSceneRenderers = exports.unload = exports.load = void 0;
const path_1 = require("path");
function load() { }
exports.load = load;
function unload() { }
exports.unload = unload;
// 加载 ‘cc’ 需要设置搜索路径
module.paths.push((0, path_1.join)(Editor.App.path, 'node_modules'));
const cc_1 = require("cc");
function updateSceneRenderers() {
    const rootNodes = cc_1.director.getScene().children;
    // walk all nodes with localize label and update
    const allLocalizedLabels = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let labels = rootNodes[i].getComponentsInChildren('LocalizedLabel');
        Array.prototype.push.apply(allLocalizedLabels, labels);
    }
    for (let i = 0; i < allLocalizedLabels.length; ++i) {
        let label = allLocalizedLabels[i];
        if (!label.node.active)
            continue;
        label.updateLabel();
    }
    // walk all nodes with localize sprite and update
    const allLocalizedSprites = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let sprites = rootNodes[i].getComponentsInChildren('LocalizedSprite');
        Array.prototype.push.apply(allLocalizedSprites, sprites);
    }
    for (let i = 0; i < allLocalizedSprites.length; ++i) {
        let sprite = allLocalizedSprites[i];
        if (!sprite.node.active)
            continue;
        sprite.updateSprite();
    }
}
exports.updateSceneRenderers = updateSceneRenderers;
exports.methods = {
    updateSceneRenderers: updateSceneRenderers,
};
