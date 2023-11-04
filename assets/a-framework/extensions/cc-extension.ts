import { Node, js, Event, Toggle, Animation, Button, Canvas, EditBox, Graphics, Label, Layout, PageView, ProgressBar, RichText, ScrollView, Slider, Sprite, Vec2, Vec3, Skeleton, Widget, UIOpacity, UITransform, director, Director, Mask, ViewGroup } from "cc";
import { EDITOR } from "cc/env";

if (!EDITOR) {
    if (!Node.prototype["__$cc-extension$__"]) {
        Node.prototype["__$cc-extension$__"] = true;

        let componentMap = {
            "graphics": Graphics,
            "label": Label,
            "richText": RichText,
            "sprite": Sprite,
            "button": Button,
            "canvas": Canvas,
            "editBox": EditBox,
            "layout": Layout,
            "pageView": PageView,
            "progressBar": ProgressBar,
            "scrollView": ScrollView,
            "slider": Slider,
            "toggle": Toggle,
            "animation": Animation,
            "skeleton": Skeleton,
            "widget": Widget,
            "uiOpacity": UIOpacity,
            "uiTransform": UITransform,
            "mask": Mask,
        };

        Object.defineProperty(Node.prototype, "__nodeCaches__", {
            get: function () {
                if (!this.__nodeCache) {
                    this.__nodeCache = {
                        componentMap: new Map(),
                    };
                }
                return this.__nodeCache;
            },
        });

        for (const key in componentMap) {
            Object.defineProperty(Node.prototype, key, {
                get: function () {
                    let tmp = this.__nodeCaches__.componentMap.get(key);
                    if (!tmp || !tmp.isValid) {
                        tmp = this.getComponent(componentMap[key]);
                        this.__nodeCaches__.componentMap.set(key, tmp);
                    }
                    return tmp;
                },
                set: function (value) {
                    if (value) {
                        this.__nodeCaches__.componentMap.set(key, value);
                    } else {
                        this.__nodeCaches__.componentMap.delete(key);
                    }
                },
            });
        }


        Object.defineProperty(UITransform.prototype, 'priority', {
            get: function () {
                return this.__priority || 0;
            },
            set: function (value: number) {
                if (!this.isValid) {
                    return;
                }
                this.__priority = value;
                if (!this.node.parent) {
                    return;
                }
                this.node.parent._$50priorityDirty = true;
            }
        });

        Object.defineProperty(Node.prototype, '_$50priorityDirty', {
            set(v: boolean) {
                if (this.__$50priorityDirty) {
                    return;
                }
                this.__$50priorityDirty = true;

                this._$50_event_before_commit_priority_callback = () => {
                    let priorityAs = [...this.children].sort((a: Node, b: Node) => {
                        let uiTransformA = a.uiTransform;
                        let uiTransformB = b.uiTransform;
                        if (!uiTransformA || !uiTransformB) {
                            return 0;
                        }
                        return uiTransformA.priority - uiTransformB?.priority;
                    });
                    priorityAs.forEach((value, index) => {
                        value.setSiblingIndex(index);
                    });
                    this.__$50priorityDirty = false;
                    this._$50_event_before_commit_priority_callback = null;
                }

                director.once(Director.EVENT_BEFORE_COMMIT, this._$50_event_before_commit_priority_callback, this);
            },
            enumerable: false,
            configurable: true
        });



        js.mixin(Node.prototype, {
            clearNodeCache() {
                this.__nodeCaches__.componentMap.clear();
            }
        })

        js.mixin(Vec2.prototype, {
            copyAsVec3() {
                return new Vec3(this.x, this.y, 0);
            }
        });

        js.mixin(Vec3.prototype, {
            copyAsVec2() {
                return new Vec2(this.x, this.y);
            }
        });

        js.mixin(Button.prototype, {
            setSoundName(soundName: string) {
                this.__$soundName = soundName;
            }
        })
    }


    // let _hasNestedViewGroup = ScrollView.prototype["_hasNestedViewGroup"];
    // 滑动面板内有可滑动的节点
    ScrollView.prototype["_hasNestedViewGroup"] = function (event: Event, captureListeners?: Node[]) {
        if (!event || event.eventPhase !== Event.CAPTURING_PHASE) {
            return false;
        }

        if (captureListeners) {
            // captureListeners are arranged from child to parent
            for (const listener of captureListeners) {
                const item = listener;

                if (this.node === item) {
                    let target: Node = event.target;
                    if (target && (target.getComponent(ViewGroup) || target.getComponent(Slider))) {
                        return true;
                    }
                    return false;
                }

                if (item.getComponent(ViewGroup) || item.getComponent(Slider)) {
                    return true;
                }
            }
        }
        return false;
    }
}
declare module "cc" {

    export interface Button {
        __$soundName: string;

    }
    export interface Node {

        graphics: Graphics,
        label: Label,
        richText: RichText,
        sprite: Sprite,
        button: Button,
        canvas: Canvas,
        editBox: EditBox,
        layout: Layout,
        pageView: PageView,
        progressBar: ProgressBar,
        scrollView: ScrollView,
        slider: Slider,
        toggle: Toggle,
        animation: Animation,
        skeleton: Skeleton,
        widget: Widget,
        uiOpacity: UIOpacity,
        uiTransform: UITransform,
        mask: Mask;
        setSoundName(soundName: string);
        clearNodeCache();
    }

    export interface Vec2 {
        copyAsVec3(): Vec3;
    }
    export interface Vec3 {
        copyAsVec2(): Vec2;
    }

    // export interface UIRenderer {
    //     visible: boolean;
    // }
}

