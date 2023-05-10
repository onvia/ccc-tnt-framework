import { Animation, AnimationClip, Asset, AssetManager, error, JsonAsset, Node, Rect, Size, Sprite, SpriteFrame, Texture2D, Vec2, _decorator } from "cc";
import { DEV } from "cc/env";
import "./AnimationBase";

const { ccclass, requireComponent, disallowMultiple, menu, property, executeInEditMode } = _decorator;


declare global {

    interface ITNT {
        AnimationFrame: typeof AnimationFrame;
    }

    namespace tnt {
        type AnimationFrame = InstanceType<typeof AnimationFrame>;
    }
}

@ccclass
@requireComponent(Sprite)
@menu("自定义UI/AnimationFrame")
@disallowMultiple()
// @executeInEditMode()
export default class AnimationFrame extends tnt.AnimationBase {

    readonly animationType: tnt.AnimationType = tnt.AnimationType.Frame;

    public sprite: Sprite = null;
    public animation: Animation = null;

    private animations = {};
    private animationClips = {};


    @property(JsonAsset)
    public jsonAsset: JsonAsset = null;

    @property(Texture2D)
    public texture2d: Texture2D = null;

    @property({ displayName: '帧速率-帧/每秒' })
    framePerSeconds = 10;

    @property
    loop = true;

    @property
    playOnLoad = true;

    private _onPlayEvent: Runnable = () => { };
    private _onFinishEvent: Runnable = () => { };

    protected _init = false;

    onLoad() {
        this.lazyInit();
    }

    //创建动作
    createAnimation(name: string, defaultClip?: string, frame_time?: number) {

        let node = this.node;

        let animation = node.getComponent(Animation);
        !animation && (animation = node.addComponent(Animation));
        let sprite = node.getComponent(Sprite);
        !sprite && (sprite = node.addComponent(Sprite));

        let iAnimation = this.animations[name] as IAnimation;
        if (!iAnimation) {
            error(`AnimationFrame-> ${name} no anim`);
            return;
        }
        for (const clipName in iAnimation.clips) {
            if (defaultClip == "" || defaultClip == undefined) { //如果没有默认动画则使用第一个动画，防止没有默认动画
                defaultClip = clipName;
            }
            let clip = this.createClip(name, clipName, frame_time || 1 / iAnimation.frame_time);

            clip.wrapMode = AnimationClip.WrapMode.Loop; // 播放模式
            clip.speed = 1; // 播放速度控制

            animation.createState(clip);
        }
        if (this.playOnLoad) {
            this.play(defaultClip, this.loop);
        }

        if (DEV) {
            this.logAnims();
        }
    }

    //创建动画片段
    createClip(name, clipName, frame_time?: number) {
        let clip: AnimationClip = null;
        if (this.animationClips[name] && this.animationClips[name][clipName]) {
            clip = this.animationClips[name][clipName];
        } else {
            let iAnimation = this.animations[name] as IAnimation;
            if (!iAnimation) {

                error(`AnimationFrame->createClip: ${name} is not in animations`);
                return null;
            }
            let frames = iAnimation.getClip(clipName);
            if (!frames) {
                error(`AnimationFrame-> createClip: ${name} ${clipName} is null`);
                return null;
            }
            clip = AnimationClip.createWithSpriteFrames(frames, frame_time || 1 / iAnimation.frame_time);

            //缓存 Clip
            if (!this.animationClips[name]) {
                this.animationClips[name] = {};
            }
            this.animationClips[name][clipName] = clip;
            // log(`AnimationFrame-> createClip: ${name} ${clipName}`);

            clip.name = clipName;
        }
        return clip;
    }

    public play(name: string, loop: boolean = true, timescale = 1) {
        this.lazyInit();
        let animation = this.animation;
        if (name === null || name === undefined) {
            let clips = animation.clips;
            let clip = clips.length > 0 && clips[0];
            name = clip.name;
        }
        this.animationName = name;
        animation.play(name);
        let state = animation.getState(name);
        if (state) {
            state.wrapMode = loop ? AnimationClip.WrapMode.Loop : AnimationClip.WrapMode.Normal;
            state.speed = timescale;
        }
    }

    public playOnce(name, listener?: Runnable, timescale = 1) {
        this.playRepeat(name, 1, listener, timescale);
    }

    private _playRepeatListener: Runnable = null;

    /**
      * 重复播放
      * @param name 
      * @param count 
      * @param listener 
      * @param timescale 
      */
    playRepeat(name, count, listener?: Runnable, timescale?: number) {
        var oldAnim = this.animationName;

        this.play(name, true, timescale);

        let animation = this.animation;

        let _clearListener = () => {
            this._playRepeatListener && animation.off(Animation.EventType.LASTFRAME, this._playRepeatListener, this)
        }
        _clearListener();

        this.animationName = name;
        let loopCount = 0;

        this._playRepeatListener = () => {
            loopCount++;
            if (count === loopCount) {
                if (listener) {
                    listener(this);
                } else {
                    _clearListener();
                    this.play(oldAnim, true, timescale);
                }
            }
        }
        animation.on(Animation.EventType.LASTFRAME, this._playRepeatListener, this);
    }
    public setStartListener(listener: Runnable) {
        this._onPlayEvent = listener;
    }

    /**
     * 动画播放一次循环结束后的事件监听
     *
     * @param {Runnable} listener
     * @memberof AnimationFrame
     */
    public setEndListener(listener: Runnable) {
        this._onFinishEvent = listener;
    }

    /**
     * 设置播放速度
     *
     * @param {*} speed
     * @memberof AnimationFrame
     */
    public setSpeed(speed) {
        let animation = this.animation;
        if (animation && animation.clips?.length) {
            for (let i = 0; i < animation.clips.length; i++) {
                const clip = animation.clips[i];
                let state = animation.getState(clip.name);
                state.speed = speed;
            }
        }
    }

    public pause() {
        let animation = this.animation;
        animation.pause();
    }

    public resume() {
        let animation = this.animation;
        animation.resume();
    }

    public stop() {
        let animation = this.animation;
        animation.stop();
    }

    public stopAll() {
        this.stop();
    }
    public getCurrentAnimation(): string {
        return this.animationName;
    }


    protected onPlay() {
        this._onPlayEvent?.();
    }
    protected onFinished() {
        this._onFinishEvent?.();
    }

    async loadResource(loaderKey: string, path: string, bundle?: AssetManager.Bundle | string): Promise<AnimationFrame> {

        let loader = tnt.loaderMgr.get(loaderKey);
        let p1 = new Promise<JsonAsset>((resolve, reject) => {
            loader.load(path, JsonAsset, (err, asset) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(asset);
            }, bundle);
        });
        let p2 = new Promise<Texture2D>((resolve, reject) => {
            loader.load(path as string, Texture2D, (err, asset) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(asset);
            }, bundle);
        })

        let result = await Promise.all([p1, p2]);
        if (this.jsonAsset === result[0]) {
            return Promise.resolve(this);
        }
        let name = this.parseData(result[0] && result[0].json as IAnimationJson, result[1]);
        this.createAnimation(name, null, this.framePerSeconds);
        return Promise.resolve(this);
    }

    private parseData(data: IAnimationJson, texture: Texture2D) {

        if (data.name in this.animations) {
            // error(`AnimationFrame->parseData ${data.name} already in the list`);   
            return data.name;
        }

        let iAnimation = new IAnimation(data.name, 0, data.textureFileName);
        this.animations[data.name] = iAnimation;
        //动作
        let anims = data.clips;
        for (let i = 0; i < anims.length; i++) {
            const anim = anims[i];

            let clip = [];
            //动作的每一帧
            const frames = anim.frames;
            for (let i = 0, length = frames.length; i < length; i++) {
                const frame = frames[i];
                let rect = frame.textureRect;
                let rotated = frame.rotated;
                let offset = frame.offset
                let originalSize = frame.originalSize;
                let spriteFrame = new SpriteFrame();
                spriteFrame.reset({
                    texture, rect, isRotate: rotated, offset, originalSize: new Size(originalSize.x, originalSize.y)
                });

                clip.push(spriteFrame);
            }
            iAnimation.pushClip(anim.name, clip);
        }
        return data.name;
    }


    private lazyInit() {
        if (this._init) {
            return;
        }
        this._init = true;
        !this.sprite && (this.sprite = this.node.getComponent(Sprite));
        !this.animation && (this.animation = this.node.getComponent(Animation))
        !this.animation && (this.animation = this.node.addComponent(Animation));

        if (this.jsonAsset && this.texture2d) {
            let name = this.parseData(this.jsonAsset.json as IAnimationJson, this.texture2d);
            this.createAnimation(name, null, this.framePerSeconds);
        }

        this.animation.on(Animation.EventType.PLAY, this.onPlay, this);
        this.animation.on(Animation.EventType.FINISHED, this.onFinished, this);
    }

    static createNodeByAsset(jsonAsset: JsonAsset, texture2d: Texture2D, framePerSeconds?: number) {
        let node = new Node();
        let frame = node.addComponent(AnimationFrame);
        frame.framePerSeconds = framePerSeconds || 30;
        frame.jsonAsset = jsonAsset;
        frame.texture2d = texture2d;
        frame.lazyInit();
        node.name = "AnimationFrame";
        return node;
    }

    static createNodeByAssetPath(loaderKey: string, dataPath: string, bundle?: AssetManager.Bundle | string) {
        let node = new Node();
        let frame = node.addComponent(AnimationFrame);
        frame.loadResource(loaderKey, dataPath, bundle);
        node.name = "AnimationFrame";
        return node;
    }

    logAnims() {
        let names = [];
        this.animation.clips.forEach((clip) => {
            names.push(clip.name);
        });
        console.log(`AnimationFrame->animation names `, names);

    }
}

interface IFrame {
    name: string;
    offset: Vec2;
    originalSize: Size;
    textureRect: Rect;
    rotated: boolean;
}

interface IClip {
    frames: IFrame[];
    name: string;
}

interface IAnimationJson {
    clips: IClip[];
    name: string;
    textureFileName: string;
}

class IAnimation {
    name: string = ''
    frame_time = 0;
    clips = {};
    textureFileName: string = ''

    constructor(name: string, frame_time: number, textureFileName: string) {
        this.name = name;
        this.frame_time = frame_time || 0.14;
        this.textureFileName = textureFileName;
    }
    pushClip(name: string, clip) {
        this.clips[name] = clip;
    }

    getClip(name) {
        return this.clips[name];
    }

}

export { };

tnt.AnimationFrame = AnimationFrame;