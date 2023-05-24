import { Node, js, Toggle, Animation, Button, Canvas, EditBox, Graphics, Label, Layout, PageView, ProgressBar, RichText, ScrollView, Slider, Sprite, Vec2, Vec3, Skeleton, Widget, UIOpacity, UITransform, director, Director } from "cc";
import { EDITOR } from "cc/env";

if (!EDITOR) {
    var componentMap = {
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
                if (!tmp) {
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
                let priorityAs = [...this.children].sort((a: Node, b: Node) => a.uiTransform.priority - b.uiTransform.priority);
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
}

js.mixin(Node.prototype, {
    clearNodeCahce() {
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
declare module "cc" {

    export interface Button{
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
        setSoundName(soundName: string);
        clearNodeCahce();
    }

    export interface Vec2 {
        copyAsVec3(): Vec3;
    }
    export interface Vec3 {
        copyAsVec2(): Vec2;
    }

    export interface UIRenderer {
        visible: boolean;
    }
}

