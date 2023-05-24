//去掉splash图
window._CCSettings.splashScreen.totalTime = 0;
let previewKey = {
    x: {
        key: "_$_preview_node_x",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.position.x;
                }, (value) => {
                    value = value || 0;
                    n.setPosition(value, n.position.y, n.position.z);
                }, false, true);
            }
        }
    },
    y: {
        key: "_$_preview_node_y",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.position.y;
                }, (value) => {
                    value = value || 0;
                    n.setPosition(n.position.x, value, n.position.z);
                }, false, true);
            }
        }
    },
    z: {
        key: "_$_preview_node_z",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.position.z;
                }, (value) => {
                    value = value || 0;
                    n.setPosition(n.position.x, n.position.y, value);
                }, false, true);
            }
        }
    },
    rx: {
        key: "_$_preview_node_rx",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.eulerAngles.x;
                }, (value) => {
                    value = value || 0;
                    n.eulerAngles = cc.v3(value, n.eulerAngles.y, n.eulerAngles.z);
                }, false, true);
            }
        }
    },
    ry: {
        key: "_$_preview_node_ry",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.eulerAngles.y;
                }, (value) => {
                    value = value || 0;
                    n.eulerAngles = cc.v3(n.eulerAngles.x, value, n.eulerAngles.z);
                }, false, true);
            }
        }
    },
    rz: {
        key: "_$_preview_node_rz",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.eulerAngles.z;
                }, (value) => {
                    value = value || 0;
                    n.eulerAngles = cc.v3(n.eulerAngles.x, n.eulerAngles.y, value);
                }, false, true);
            }
        }
    },
    sx: {
        key: "_$_preview_node_sx",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.scale.x;
                }, (value) => {
                    value = value || 0;
                    n.scale = cc.v3(value, n.scale.y, n.scale.z);
                }, false, true);
            }
        }
    },
    sy: {
        key: "_$_preview_node_sy",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.scale.y;
                }, (value) => {
                    value = value || 0;
                    n.scale = cc.v3(n.scale.x, value, n.scale.z);
                }, false, true);
            }
        }
    },
    sz: {
        key: "_$_preview_node_sz",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return n.scale.z;
                }, (value) => {
                    value = value || 0;
                    n.scale = cc.v3(n.scale.x, n.scale.y, value);
                }, false, true);
            }
        }
    },
    layer: {
        key: "_$_preview_node_layer",
        register(n) {
            if (!n[this.key]) {
                cc.js.getset(n, this.key, () => {
                    return cc.Layers.Enum[n.layer] || "";
                }, (value) => {
                    value = cc.Layers.Enum[value] || 0;
                    n.layer = value;
                }, false, true);
            }
        }
    },
    label_color: {
        key: "_$_preview_label_color",
        register(n) {
            let label = n.getComponent(cc.Label)
            if (label == null) {
                return;
            }
            if (!label[this.key]) {
                cc.js.getset(label, this.key, () => {
                    return '#' + label.color.toHEX();
                }, (value) => {
                    label.color = cc.color().fromHEX(value);
                }, false, true);
            }
        }
    },
    label_cacheMode: {
        key: "_$_preview_label_cacheMode",
        register(n) {
            let label = n.getComponent(cc.Label)
            if (label == null) {
                return;
            }
            if (!label[this.key]) {
                cc.js.getset(label, this.key, () => {
                    return cc.Label.CacheMode[label.cacheMode] || "";
                }, (value) => {
                    label.cacheMode = cc.Label.CacheMode[value] || 0;
                }, false, true);
            }
        }
    },
    rich_cacheMode: {
        key: "_$_preview_rich_cacheMode",
        register(n) {
            let rich = n.getComponent(cc.RichText)
            if (rich == null) {
                return;
            }
            if (!rich[this.key]) {
                cc.js.getset(rich, this.key, () => {
                    return cc.Label.CacheMode[rich.cacheMode] || "";
                }, (value) => {
                    rich.cacheMode = cc.Label.CacheMode[value] || 0;
                }, false, true);
            }
        }
    },
    sprite_color: {
        key: "_$_preview_sprite_color",
        register(n) {
            let sprite = n.getComponent(cc.Sprite)
            if (sprite == null) {
                return;
            }
            if (!sprite[this.key]) {
                cc.js.getset(sprite, this.key, () => {
                    return '#' + sprite.color.toHEX();
                }, (value) => {
                    sprite.color = cc.color().fromHEX(value);
                }, false, true);
            }
        }
    },
    sprite_frame: {
        key: "_$_preview_sprite_frame",
        register(n) {
            let sprite = n.getComponent(cc.Sprite)
            if (sprite == null) {
                return;
            }
            if (!sprite[this.key]) {
                cc.js.getset(sprite, this.key, () => {
                    return sprite.spriteFrame?.name || ""
                }, (value) => {

                }, false, true);
            }
        }
    },
    label_outline_color: {
        key: "_$_preview_label_outline_color",
        register(n) {
            let labelOutline = n.getComponent(cc.LabelOutline)
            if (labelOutline == null) {
                return;
            }
            if (!labelOutline[this.key]) {
                cc.js.getset(labelOutline, this.key, () => {
                    return '#' + labelOutline.color.toHEX();
                }, (value) => {
                    labelOutline.color = cc.color().fromHEX(value);
                }, false, true);
            }
        }
    },
    label_outline_w: {
        key: "_$_preview_label_outline_w",
        register(n) {
            let labelOutline = n.getComponent(cc.LabelOutline)
            if (labelOutline == null) {
                return;
            }
            if (!labelOutline[this.key]) {
                cc.js.getset(labelOutline, this.key, () => {
                    return labelOutline.width || 0;
                }, (value) => {
                    labelOutline.width = parseFloat(value) || 0;
                }, false, true);
            }
        }
    },
}
let config = {
    previewKey: previewKey,
    compTemplate: {
        "Node": {
            values: [
                {
                    name: 'Position',
                    values: [
                        { name: 'X', key: previewKey.x.key },
                        { name: 'Y', key: previewKey.y.key },
                        { name: 'X', key: previewKey.z.key },
                    ],
                    type: 'value'
                },
                {
                    name: 'Rotation',
                    values: [
                        { name: 'X', key: previewKey.rx.key },
                        { name: 'Y', key: previewKey.ry.key },
                        { name: 'Z', key: previewKey.rz.key },
                    ],
                    type: 'value'
                },
                {
                    name: 'Scale',
                    values: [
                        { name: 'X', key: previewKey.sx.key },
                        { name: 'Y', key: previewKey.sy.key },
                        { name: 'Z', key: previewKey.sz.key },
                    ],
                    type: 'value'
                },
                {
                    name: 'Layer',
                    values: [
                        { name: '', key: previewKey.layer.key },
                    ],
                    type: 'list',
                    list: () => { return cc.Enum.getList(cc.Layers.Enum).map(value => value.name) }
                }
            ]
        },
        "UITransform": {
            values: [
                {
                    name: 'Content Size',
                    values: [
                        { name: 'W', key: 'width' },
                        { name: 'H', key: 'height' },
                    ],
                    type: 'value'
                },
                {
                    name: 'Anchor Point',
                    values: [
                        { name: 'X', key: 'anchorX' },
                        { name: 'Y', key: 'anchorY' },
                    ],
                    type: 'value'
                },
            ]
        },
        "Label": {
            values: [
                {
                    name: 'Color',
                    values: [
                        { name: "", key: previewKey.label_color.key }
                    ],
                    type: 'color'
                },
                {
                    name: 'String',
                    values: [
                        { name: "", key: 'string' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Font Size',
                    values: [
                        { name: "", key: 'fontSize' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Line Height',
                    values: [
                        { name: "", key: 'lineHeight' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Enable Wrap Text',
                    values: [
                        { name: "", key: 'enableWrapText' }
                    ],
                    type: 'check',
                },
                {
                    name: 'Cache Mode',
                    values: [
                        { name: "", key: previewKey.label_cacheMode.key }
                    ],
                    type: 'list',
                    list: () => { return cc.Enum.getList(cc.Label.CacheMode).map(value => value.name) }
                }
            ]
        },
        "LabelOutline": {
            values: [
                {
                    name: 'Color',
                    values: [
                        { name: "", key: previewKey.label_outline_color.key }
                    ],
                    type: 'color'
                },
                {
                    name: 'Width',
                    values: [
                        { name: "", key: previewKey.label_outline_w.key }
                    ],
                    type: 'value'
                }
            ]
        },
        "RichText": {
            values: [
                {
                    name: 'String',
                    values: [
                        { name: "", key: 'string' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Font Size',
                    values: [
                        { name: "", key: 'fontSize' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Max Width',
                    values: [
                        { name: "", key: 'maxWidth' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Line Height',
                    values: [
                        { name: "", key: 'lineHeight' }
                    ],
                    type: 'value'
                },
                {
                    name: 'Cache Mode',
                    values: [
                        { name: "", key: previewKey.rich_cacheMode.key }
                    ],
                    type: 'list',
                    list: () => { return cc.Enum.getList(cc.Label.CacheMode).map(value => value.name) }
                },
                {
                    name: 'Handle Touch Event',
                    values: [
                        { name: "", key: 'handleTouchEvent' }
                    ],
                    type: 'check',
                }
            ]
        },
        "Sprite": {
            values: [
                {
                    name: 'Color',
                    values: [
                        { name: "", key: previewKey.sprite_color.key }
                    ],
                    type: 'color'
                },
                {
                    name: 'Sprite Frame',
                    values: [
                        { name: "", key: previewKey.sprite_frame.key, lock: true }
                    ],
                    type: 'value',
                },
                {
                    name: 'Grayscale',
                    values: [
                        { name: "", key: 'grayscale' }
                    ],
                    type: 'check',
                },
                {
                    name: 'Trim',
                    values: [
                        { name: "", key: 'trim' }
                    ],
                    type: 'check',
                }
            ]
        },
        "Camera": {
            values: [
            ]
        }
    }
}

let getCache = function () {
    let rawCacheData = cc.assetManager.assets._map;
    let cacheData = [];
    let totalTextureSize = 0;
    for (let k in rawCacheData) {
        let item = rawCacheData[k];
        if (item.type !== 'js' && item.type !== 'json') {
            let itemName = '_';
            let preview = '';
            let content = item.__classname__;
            let formatSize = 0;
            if (item.type === 'png' || item.type === 'jpg') {
                let texture = rawCacheData[k.replace('.' + item.type, '.json')];
                if (texture && texture._owner && texture._owner._name) {
                    itemName = texture._owner._name;
                    preview = texture.content.url;
                }
            } else {
                if (item._name) {
                    itemName = item._name;
                } else if (item._owner) {
                    itemName = (item._owner && item._owner.name) || '_';
                }
                if (content === 'cc.Texture2D') {
                    preview = item.nativeUrl;
                    let textureSize = item.width * item.height * ((item._native === '.jpg' ? 3 : 4) / 1024 / 1024);
                    totalTextureSize += textureSize;
                    // sizeStr = textureSize.toFixed(3) + 'M';
                    formatSize = Math.round(textureSize * 1000) / 1000;
                } else if (content === 'cc.SpriteFrame') {
                    preview = item._texture.nativeUrl;
                }
            }
            cacheData.push({
                queueId: item.queueId,
                type: content,
                name: itemName,
                preview: preview,
                id: item._uuid,
                size: formatSize
            });
        }
    }
    let cacheTitle = `[文件总数:${cacheData.length}][纹理缓存:${totalTextureSize.toFixed(2) + 'M'}]`;
    return [cacheData, cacheTitle];
}
config.getCache = getCache;

window.preview_config = config