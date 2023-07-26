import { Color, Node, UIRenderer, Size, UIOpacity, UITransform, v3, Vec2, Vec3 } from "cc";
import { EDITOR } from "cc/env";

// ========= 扩展 cc 提示声明 =========

declare module "cc" {
    interface Node {
        x: number;
        y: number;
        z: number;
        w: number;
        h: number;
        size: Size;
        anchor_x: number;
        anchor_y: number;
        opacity: number;
        color: Color;
        scale_x: number;
        scale_y: number;
        scale_z: number;
    }
}

if (!EDITOR) {
    /**
     * 扩展节点属性
     * @author BO
     */
    if (!Node.prototype["$__definedProperties__"]) {
        Node.prototype["$__definedProperties__"] = true;

        /** 获取、设置节点的 X 坐标 */
        Object.defineProperty(Node.prototype, "x", {
            get: function () {
                let self: Node = this;
                return self.position.x;
            },
            set: function (value: number) {
                let self: Node = this;
                self.setPosition(value, self.position.y);
            }
        });

        /** 获取、设置节点的 Y 坐标 */
        Object.defineProperty(Node.prototype, "y", {
            get: function () {
                let self: Node = this;
                return self.position.y;
            },
            set: function (value: number) {
                let self: Node = this;
                self.setPosition(self.position.x, value);
            }
        });

        /** 获取、设置节点的 Z 坐标 */
        Object.defineProperty(Node.prototype, "z", {
            get: function () {
                let self: Node = this;
                return self.position.z;
            },
            set: function (value: number) {
                let self: Node = this;
                self.setPosition(self.position.x, self.position.y, value);
            }
        });

        /** 获取、设置节点的宽度 */
        Object.defineProperty(Node.prototype, "width", {
            configurable: true,
            get: function () {
                let self: Node = this;
                return self.getComponent(UITransform)?.width ?? 0;
            },
            set: function (value: number) {
                let self: Node = this;
                (self.getComponent(UITransform) || self.addComponent(UITransform)).width = value;
            }
        });

        /** 获取、设置节点的高度 */
        Object.defineProperty(Node.prototype, "h", {
            configurable: true,
            get: function () {
                let self: Node = this;
                return self.getComponent(UITransform)?.height ?? 0;
            },
            set: function (value: number) {
                let self: Node = this;
                (self.getComponent(UITransform) || self.addComponent(UITransform)).height = value;
            }
        });

        /** 获取、设置节点的尺寸 */
        Object.defineProperty(Node.prototype, "size", {
            get: function () {
                let self: Node = this;
                let uiTransform = self.getComponent(UITransform);
                return new Size(uiTransform.width, uiTransform.height);
            },
            set: function (value: Size) {
                let self: Node = this;
                let uiTransform = self.getComponent(UITransform) || self.addComponent(UITransform);
                uiTransform.width = value.width;
                uiTransform.height = value.height;
            }
        });

        /** 获取、设置节点的水平锚点 */
        Object.defineProperty(Node.prototype, "anchor_x", {
            get: function () {
                let self: Node = this;
                return self.getComponent(UITransform)?.anchorX ?? 0.5;
            },
            set: function (value: number) {
                let self: Node = this;
                (self.getComponent(UITransform) || self.addComponent(UITransform)).anchorX = value;
            }
        });

        /** 获取、设置节点的垂直锚点 */
        Object.defineProperty(Node.prototype, "anchor_y", {
            get: function () {
                let self: Node = this;
                return self.getComponent(UITransform).anchorY ?? 0.5;
            },
            set: function (value: number) {
                let self: Node = this;
                (self.getComponent(UITransform) || self.addComponent(UITransform)).anchorY = value;
            }
        });

        /** 获取、设置节点的透明度 */
        Object.defineProperty(Node.prototype, "opacity", {
            get: function () {
                let self: Node = this;
                let op = self.getComponent(UIOpacity);
                if (op != null) {
                    return op.opacity;
                }

                let render = self.getComponent(UIRenderer);
                if (render) {
                    return render.color.a;
                }

                return 255;
            },

            set: function (value: number) {
                let self: Node = this;
                let op = self.getComponent(UIOpacity);
                if (op != null) {
                    op.opacity = value;
                    return;
                }

                let render = self.getComponent(UIRenderer);
                if (render) {
                    // 直接通过 color.a 设置透明度会有bug，没能直接生效，需要激活节点才生效
                    // (render.color.a as any) = value;

                    // 创建一个颜色缓存对象，避免每次都创建新对象
                    if (!this.$__color__) {
                        this.$__color__ = new Color(render.color.r, render.color.g, render.color.b, value);
                    } else {
                        this.$__color__.a = value;
                    }

                    render.color = this.$__color__;// 设置 color 对象则可以立刻生效
                } else {
                    self.addComponent(UIOpacity).opacity = value;
                }
            }
        });

        /** 获取、设置节点的颜色 */
        Object.defineProperty(Node.prototype, "color", {
            get: function () {
                let self: Node = this;
                return self.getComponent(UIRenderer)?.color;
            },
            set: function (value: Color) {
                let self: Node = this;
                let render = self.getComponent(UIRenderer);
                render && (render.color = value);
            }
        });

        /** 获取、设置节点的 X 缩放系数 */
        Object.defineProperty(Node.prototype, "scale_x", {
            get: function () {
                let self: Node = this;
                return self.scale.x;
            },
            set: function (value: number) {
                let self: Node = this;
                self.scale = v3(value, self.scale.y, self.scale.z);
            }
        });

        /** 获取、设置节点的 Y 缩放系数 */
        Object.defineProperty(Node.prototype, "scale_y", {
            get: function () {
                let self: Node = this;
                return self.scale.y;
            },
            set: function (value: number) {
                let self: Node = this;
                self.scale = v3(self.scale.x, value, self.scale.z);
            }
        });

        /** 获取、设置节点的 Z 缩放系数 */
        Object.defineProperty(Node.prototype, "scale_z", {
            get: function () {
                let self: Node = this;
                return self.scale.z;
            },
            set: function (value: number) {
                let self: Node = this;
                self.scale = v3(self.scale.x, self.scale.y, value);
            }
        });

        // log(Object.getOwnPropertyNames(Node.prototype));
    }
}