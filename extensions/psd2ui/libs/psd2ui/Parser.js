"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = exports.Parser = void 0;
const ImageCacheMgr_1 = require("./assets-manager/ImageCacheMgr");
const ImageMgr_1 = require("./assets-manager/ImageMgr");
const LayerType_1 = require("./psd/LayerType");
const PsdDocument_1 = require("./psd/PsdDocument");
const PsdGroup_1 = require("./psd/PsdGroup");
const PsdImage_1 = require("./psd/PsdImage");
const PsdText_1 = require("./psd/PsdText");
class Parser {
    /** 解析图层类型 */
    parseLayerType(source) {
        if ("children" in source) {
            if ("width" in source && "height" in source) {
                // Document
                return LayerType_1.LayerType.Doc;
            }
            else {
                // Group
                return LayerType_1.LayerType.Group;
            }
        }
        else if ("text" in source) {
            //  Text
            return LayerType_1.LayerType.Text;
        }
        // else if ('placedLayer' in layer) {
        //     // 智能对象
        // }
        return LayerType_1.LayerType.Image;
    }
    parseLayer(source, parent, rootDoc) {
        let layer = null;
        let layerType = this.parseLayerType(source);
        switch (layerType) {
            case LayerType_1.LayerType.Doc:
            case LayerType_1.LayerType.Group:
                {
                    let group = null;
                    // Group
                    if (layerType == LayerType_1.LayerType.Group) {
                        group = new PsdGroup_1.PsdGroup(source, parent, rootDoc);
                        if (group.attr.comps.ignorenode || group.attr.comps.ignore) {
                            return null;
                        }
                    }
                    else {
                        // Document
                        group = new PsdDocument_1.PsdDocument(source);
                    }
                    for (let i = 0; i < source.children.length; i++) {
                        const childSource = source.children[i];
                        let child = this.parseLayer(childSource, group, rootDoc || group);
                        if (child) {
                            if (!child.attr.comps.ignorenode && !child.attr.comps.ignore) {
                                // 没有进行忽略节点的时候才放入列表
                                group.children.push(child);
                            }
                        }
                        else {
                            console.error(`图层解析错误`);
                        }
                    }
                    layer = group;
                }
                break;
            case LayerType_1.LayerType.Image:
                {
                    // 
                    if (!source.canvas) {
                        console.error(`Parser-> 空图层 ${source === null || source === void 0 ? void 0 : source.name}`);
                        return null;
                    }
                    // Image
                    let image = layer = new PsdImage_1.PsdImage(source, parent, rootDoc);
                    ImageMgr_1.imageMgr.add(image);
                    // 没有设置忽略且不说镜像的情况下才进行缓存
                    if (!image.isIgnore() && !image.isBind()) {
                        if (!ImageCacheMgr_1.imageCacheMgr.has(image.md5)) {
                            ImageCacheMgr_1.imageCacheMgr.set(image.md5, {
                                uuid: image.uuid,
                                textureUuid: image.textureUuid,
                            });
                        }
                    }
                }
                break;
            case LayerType_1.LayerType.Text:
                {
                    //  Text
                    layer = new PsdText_1.PsdText(source, parent, rootDoc);
                }
                break;
            default:
                break;
        }
        layer.layerType = layerType;
        layer.parseSource();
        layer.onCtor();
        return layer;
    }
}
exports.Parser = Parser;
exports.parser = new Parser();
