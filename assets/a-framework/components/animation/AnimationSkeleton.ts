
import { AssetManager, gfx, ImageAsset, isValid, js, log, Size, sp, sys, Texture2D, Vec2, Vec3, _decorator, __private } from "cc";
import { DEV, JSB } from "cc/env";
import "./AnimationBase";


/**
 * 如果使用局部换肤功能，需要将所有使用同一资源的 Skeleton 的 animationCacheMode 设置为 PRIVATE_CACHE
 * 
 */


let copy_uid = 0;

declare global {

    interface ITNT {
        AnimationSkeleton: typeof AnimationSkeleton;
    }

    namespace tnt {
        type AnimationSkeleton = InstanceType<typeof AnimationSkeleton>;
    }
}

const { ccclass, requireComponent, disallowMultiple, menu, property } = _decorator;
type PlayListener = (sk: AnimationSkeleton, trackEntry: sp.spine.TrackEntry) => void;
@ccclass
@requireComponent(sp.Skeleton)
@menu("自定义UI/AnimationSkeleton")
@disallowMultiple()
export default class AnimationSkeleton extends tnt.AnimationBase {

    static shareDataMap: Map<string, sp.SkeletonData> = new Map();

    @property({ tooltip: '混合时间' })
    mixTime = 0.2;

    readonly animationType: tnt.AnimationType = tnt.AnimationType.Spine;
    private _skeleton: sp.Skeleton;
    public get skeleton(): sp.Skeleton {
        !this._skeleton && (this._skeleton = this.getComponent(sp.Skeleton));
        return this._skeleton;
    }
    public set skeleton(value: sp.Skeleton) {
        this._skeleton = value;
    }

    @property
    shareData: boolean = false;

    isCopySkeletonData = false;
    cacheOriginalSkins: Record<string, { texture: sp.spine.TextureAtlasRegion, size: Size }> = {};
    curRegionTextures: Record<string, Texture2D> = {};
    attachmentOriginalPosition: Record<string, Vec2> = {};


    onLoad() {
        this._lazyInit();
    }
    private _lazyInit() {
        if (!this.skeleton) {
            this.skeleton = this.getComponent(sp.Skeleton)
        }
        this.animationName = this.skeleton.animation;
    }

    isPlaying(animationName) {
        return this.animationName == animationName;
    }
    /**
     * 
     * @param name 
     * @param loop 
     */
    play(name: string, loop: boolean = true): sp.spine.TrackEntry {
        this._lazyInit();
        this.animationName = name;
        log(`AnimationSkeleton-> play ${name}`);

        let curTrack = this.skeleton.setAnimation(0, name, loop);
        return curTrack;
    }
    playOnce(name, listener?: PlayListener, timescale = 1) {
        log(`AnimationSkeleton-> playOnce ${name}`);

        this.playRepeat(name, 1, listener, timescale);
    }
    /**
     * 重复播放
     * @param name 
     * @param count 
     * @param listener 
     * @param timescale 
     */
    playRepeat(name, count, listener?: PlayListener, timescale?: number) {
        let oldAnim = this.getCurrentAnimation();
        console.log(`AnimationSkeleton-> playRepeat old animation [${oldAnim}]`);

        this.setTimeScale(timescale);
        let trackEntry = this.skeleton.setAnimation(0, name, count == 1 ? false : true);

        this.animationName = name;
        let loopCount = 0;

        let _complete = (trackEntry: sp.spine.TrackEntry) => {
            loopCount++;
            let animationName = trackEntry.animation ? trackEntry.animation.name : "";
            if (count === loopCount) {
                if (listener) {
                    listener(this, trackEntry);
                } else {
                    console.log(`AnimationSkeleton-> playRepeat play old animation [${oldAnim}]`);
                    this.play(oldAnim, true);
                }
            }
            DEV && log(`[track ${trackEntry.trackIndex}][animation ${animationName}] complete: ${loopCount}`);
        }

        // 处于缓存模式
        if (this.skeleton.isAnimationCached()) {
            this.skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => {
                _complete(trackEntry);
            });
            return;
        } else {
            this.skeleton.setTrackCompleteListener(trackEntry, (trackEntry) => {
                _complete(trackEntry);
            });
        }

    }

    setPause(pause: boolean) {
        this.skeleton.paused = pause;
    }

    stop(trackIndex?: any, mixDuration?: number) {
        this.animationName = '';
        if (trackIndex === undefined) {
            trackIndex = 0;
        }
        if (mixDuration === undefined) {
            mixDuration = 0;
        }

        let state = this.skeleton.getState();
        if (state) {
            state.setEmptyAnimation(trackIndex, mixDuration)
        } else {
            console.log(`AnimationSkeleton-> isAnimationCached 无法停止播放`);
        }


    }
    setSkin(skinName) {
        this._lazyInit();
        this.skeleton.setSkin(skinName);
    }
    stopAll(mixDuration = 0) {
        this.animationName = '';
        let state = this.skeleton.getState();
        if (state) {
            state.setEmptyAnimations(mixDuration);
        } else {
            console.log(`AnimationSkeleton-> isAnimationCached 无法停止播放`);
        }
    }

    getCurrentAnimation(): string {
        return this.skeleton.animation || this.animationName;
    }


    getSkeleton() {
        return this.skeleton;
    }

    /**
     * 设置时间系数
     * @param timeScale 
     */
    setTimeScale(timeScale: number) {
        this._lazyInit();
        timeScale = typeof timeScale !== 'undefined' ? timeScale : 1;
        this.skeleton.timeScale = timeScale;
    }
    getTimeScale() {
        return this.skeleton.timeScale;
    }

    mix() {
        this._lazyInit();
        // @ts-ignore
        let animations = this.skeleton.skeletonData._skeletonCache && this.skeleton.skeletonData._skeletonCache.animations;
        let names = [];
        if (animations) {
            for (let i = 0; i < animations.length; i++) {
                const anim = animations[i];
                names.push(anim.name);
            }
        }
        // let keys = Object.keys(this.skeleton.skeletonData.skeletonJson.animations);
        let keys = names;
        for (let i = 0; i < keys.length; i++) {
            const key1 = keys[i];
            for (let j = i + 1; j < keys.length; j++) {
                const key2 = keys[j];
                this.setMix(key1, key2);
            }
        }
    }
    /**
     * 设置混合
     * @param anim1 
     * @param anim2 
     */
    setMix(anim1, anim2) {
        this._lazyInit();
        this.skeleton.setMix(anim1, anim2, this.mixTime);
        this.skeleton.setMix(anim2, anim1, this.mixTime);
    }

    /**
     * 局部换肤
     * 
     * @param {string} slotName
     * @param {Texture2D} texture
     * @param {(Vec2 | Vec3)} [offset]
     * @return {*} 
     * @memberof AnimationSkeleton
     */
    updateRegion(slotName: string, texture: Texture2D, offset?: Vec2 | Vec3) {
        this._lazyInit();
        if (!texture) {
            return false;
        }
        if (!slotName) {
            return false;
        }
        let skeleton = this.skeleton;
        let slot: sp.spine.Slot = skeleton.findSlot(slotName);
        let attachment: sp.spine.RegionAttachment | sp.spine.MeshAttachment = slot?.getAttachment() as sp.spine.RegionAttachment | sp.spine.MeshAttachment;
        if (!slot || !attachment) {
            console.error(`AnimationSkeleton-> updateRegion: ${slotName}`);
            return false;
        }

        log(`AnimationSkeleton->updateRegion ${slotName}`);
        if (JSB) {
            // @ts-ignore
            let skeletonProto = cc.internal.SpineSkeleton.prototype;
            if (!skeletonProto.updateRegion) {
                // @ts-ignore
                let spineSkeletonDataProto = cc.internal.SpineSkeletonData.prototype;

                // 局部换装
                skeletonProto.updateRegion = function (attachment: any, tex2d: any) {
                    // @ts-ignore
                    let jsbTex2d = new middleware.Texture2D();
                    jsbTex2d.setRealTextureIndex(spineSkeletonDataProto.recordTexture(tex2d));
                    jsbTex2d.setPixelsWide(tex2d.width);
                    jsbTex2d.setPixelsHigh(tex2d.height);
                    // @ts-ignore
                    sp.spine.updateRegion(attachment, jsbTex2d);
                }
            }

            if (!this.isCopySkeletonData) {
                this.copySkeletonData();
                this.isCopySkeletonData = true;
            }
            // @ts-ignore
            skeleton.updateRegion(attachment, texture);
            // skeleton如果使用了缓存模式则需要刷新缓存
            skeleton.invalidAnimationCache();
            // // @ts-ignore
            // let spineSkeletonData = cc.internal.SpineSkeletonData.prototype;

            // // @ts-ignore
            // let jsbTex2d = new middleware.Texture2D();
            // jsbTex2d.setRealTextureIndex(spineSkeletonData.recordTexture(texture));
            // jsbTex2d.setPixelsWide(texture.width);
            // jsbTex2d.setPixelsHigh(texture.height);

            // this.curRegionTextures[slotName] = texture;  
            // // @ts-ignore
            // this.skeleton._nativeSkeleton.updateRegion(slotName, jsbTexture);
            // // skeleton如果使用了缓存模式则需要刷新缓存
            // this.skeleton.invalidAnimationCache();
            return false;
        }

        // if (!this.isCopySkeletonData) {
        //     this.copySkeletonData();
        //     this.isCopySkeletonData = true;
        // }

        // 记录新皮肤
        this.curRegionTextures[slotName] = texture;

        /**  
         * 缓存原始的皮肤，方便后续进行还原
         * 只第一次进行缓存
         * */
        let originalRegion: sp.spine.TextureAtlasRegion = attachment.region as sp.spine.TextureAtlasRegion;
        !this.cacheOriginalSkins[slotName] && (this.cacheOriginalSkins[slotName] = { texture: originalRegion, size: new Size(attachment.width, attachment.height) });


        let region: sp.spine.TextureRegion = this.createRegion(texture);
        attachment.width = texture.width;
        attachment.height = texture.height;

        if (attachment instanceof sp.spine.MeshAttachment) {
            attachment.region = region;
            attachment.updateUVs();
        } else {
            // 缓存原始偏移
            if (!this.attachmentOriginalPosition[attachment.name]) {
                this.attachmentOriginalPosition[attachment.name] = new Vec2(attachment.x, attachment.y);
            }

            let originalPosition = this.attachmentOriginalPosition[attachment.name];
            // 设置偏移
            attachment.x = originalPosition.x + (offset ? offset.x : 0);
            attachment.y = originalPosition.y + (offset ? offset.y : 0);

            attachment.setRegion(region);
            attachment.updateOffset();
        }

        slot.setAttachment(attachment);

        // 避免换装影响人物的其他动画，一般设置缓存模式PRIVATE_CACHE
        // skeleton如果使用了缓存模式则需要刷新缓存
        skeleton.invalidAnimationCache();

        return true;
    }

    /** 还原皮肤 */
    reductionRegion(slotName: string) {
        this._lazyInit();
        let skeleton = this.skeleton;

        if (JSB) {
            // @ts-ignore
            // skeleton._nativeSkeleton.updateRegion(slotName, originalRegion);
            // skeleton如果使用了缓存模式则需要刷新缓存
            // skeleton._nativeSkeleton.reductionSkin(slotName);
            skeleton.invalidAnimationCache();
            log(`AnimationSkeleton-> 刷新缓存`);
            return null;
        }

        let curRegion = this.curRegionTextures[slotName];
        if (!curRegion) {
            log(`AnimationSkeleton->未进行换肤`);
            return null;
        }

        let originalRegion = this.cacheOriginalSkins[slotName];
        if (!originalRegion) {
            log(`AnimationSkeleton->原始皮肤不存在 无法还原`);
            return null;
        }
        if (!slotName) {
            return;
        }
        let slot: sp.spine.Slot = skeleton.findSlot(slotName);
        let attachment: sp.spine.RegionAttachment = slot.getAttachment() as sp.spine.RegionAttachment;
        if (!slot || !attachment) {
            console.error(`AnimationSkeleton->无法还原 : ${slotName}`);
            return null;
        }

        attachment.width = originalRegion.size.width;
        attachment.height = originalRegion.size.height;

        // 还原位置
        let originalPosition = this.attachmentOriginalPosition[attachment.name];
        attachment.x = originalPosition.x;
        attachment.y = originalPosition.y;

        attachment.setRegion(originalRegion.texture);
        attachment.updateOffset();

        slot.setAttachment(attachment);
        // skeleton 如果使用了缓存模式则需要刷新缓存
        skeleton.invalidAnimationCache();

        this.curRegionTextures[slotName] = null;
        return curRegion;
    }

    private createRegion(texture: Texture2D): sp.spine.TextureAtlasRegion {
        const skeletonTexture = new sp.SkeletonTexture({ width: texture.width, height: texture.height } as ImageBitmap);
        skeletonTexture.setRealTexture(texture);

        // let page = new sp.spine.TextureAtlasPage();
        // page.name = texture.name;
        // page.uWrap = sp.spine.TextureWrap.ClampToEdge;
        // page.vWrap = sp.spine.TextureWrap.ClampToEdge;
        // page.texture = skeletonTexture;
        // page.texture.setWraps(page.uWrap, page.vWrap);
        // page.width = texture.width;
        // page.height = texture.height;

        let region = new sp.spine.TextureAtlasRegion();
        // region.page = page;
        region.width = texture.width;
        region.height = texture.height;
        region.originalWidth = texture.width;
        region.originalHeight = texture.height;

        region.rotate = false;
        region.u = 0;
        region.v = 0;
        region.u2 = 1;
        region.v2 = 1;
        region.texture = skeletonTexture;
        region.renderObject = region;
        return region;
    }

    private copySkeletonData() {
        this._lazyInit();

        copy_uid++;

        let animation = this.animationName;
        console.log(`AnimationSkeleton-> current animation ${animation}`);

        let skeletonData = this.skeleton.skeletonData;
        const spData = skeletonData;//sp.Skeleton组件
        let copy = new sp.SkeletonData()//拷贝一份纹理，避免重复纹理缓存
        js.mixin(copy, skeletonData);
        // @ts-ignore
        copy._uuid = spData._uuid + "_copy" + "_" + copy_uid;
        let old = copy.name;
        let newName = copy.name + '_copy'
        copy.name = newName;
        copy.atlasText = copy.atlasText.replace(old, newName)
        // @ts-ignore
        copy.textureNames[0] = newName + '.png'
        // @ts-ignore
        copy.init && copy.init()


        // let copy = new sp.SkeletonData()//拷贝一份纹理，避免重复纹理缓存
        // js.mixin(copy,skeletonData);
        // skeletonData.skeletonJson && (copy.skeletonJson = JSON.parse(JSON.stringify(skeletonData.skeletonJson)));

        this.skeleton.skeletonData = copy;//重新设置一下数据
        if (animation) {
            // 继续播放的动画，不然会停止
            this.skeleton.setAnimation(0, animation, true);
        }
    }

    //#region  ------------------------- 换肤 -------------------------------------
    /**
     * 局部换肤
     * 
     * @param {string} slotName
     * @param {Texture2D} texture
     * @param {(Vec2 | Vec3)} [offset]
     * @return {*} 
     * @memberof AnimationSkeleton
     */
    setSkinRegion(regionName: string, regionImg: ImageAsset) {
        if (!regionImg) {
            console.log(`regionImg 不能为空`);
            return;
        }
        let skeletonData: sp.SkeletonData = this.skeleton.skeletonData;
        if (!skeletonData) {
            console.warn(`skeletonData 不能为空`);
            return;
        }
        if (!skeletonData._uuid.endsWith("copy")) {
            skeletonData = this._copySkeletonData(skeletonData);
            this.skeleton.skeletonData = skeletonData;
        }
        // @ts-ignore
        let regions: any[] = skeletonData._atlasCache.regions;
        let texture = skeletonData.textures[0];
        let region = regions.find((region) => {
            return region.name == regionName;
        });

        if (region) {
            let gfxTexture = texture.getGFXTexture();
            // @ts-ignore
            let device = texture._getGFXDevice();

            const temp = new gfx.BufferTextureCopy();
            temp.texOffset.x = region.x;
            temp.texOffset.y = region.y;
            temp.texExtent.width = region.width;
            temp.texExtent.height = region.height;
            device.copyTexImagesToTexture([regionImg.data as any], gfxTexture, [temp]);
        } else {
            console.log(`未找到指定部位： ${regionName}`);
        }

    }

    copyTextureWithImageAsset(imageAsset: ImageAsset): Texture2D {
        let texture2D = new Texture2D();
        texture2D.reset({
            width: imageAsset.width,
            height: imageAsset.height,
            format: imageAsset.format
        });

        let gfxTexture = texture2D.getGFXTexture();
        // @ts-ignore
        let device = texture2D._getGFXDevice();

        const temp = new gfx.BufferTextureCopy();
        temp.texOffset.x = 0;
        temp.texOffset.y = 0;
        temp.texExtent.width = imageAsset.width;
        temp.texExtent.height = imageAsset.height;
        device.copyTexImagesToTexture([imageAsset.data as any], gfxTexture, [temp]);
        return texture2D;
    }

    _copySkeletonData(skeletonData: sp.SkeletonData): sp.SkeletonData {

        let uuid = "";
        if (this.shareData) {
            uuid = skeletonData._uuid;
            if (AnimationSkeleton.shareDataMap.has(skeletonData._uuid)) {
                let data = AnimationSkeleton.shareDataMap.get(skeletonData._uuid);
                return data;
            }
        }


        skeletonData.getRuntimeData();
        let suffix = "_copy";

        let data = new sp.SkeletonData();
        // @ts-ignore
        data._uuid = (uuid || this.generateUUID()) + suffix;//任意字符串
        data._nativeAsset = skeletonData._nativeAsset;
        data.atlasText = skeletonData.atlasText;
        data.textures = [this.copyTextureWithImageAsset(skeletonData.textures[0].image)];
        data.textureNames = skeletonData.textureNames;
        data._nativeUrl = skeletonData._nativeUrl;
        // @ts-ignore
        data._getAtlas();

        if (this.shareData) {
            AnimationSkeleton.shareDataMap.set(skeletonData._uuid, data);
        }
        return data;
    }

    public generateUUID() {
        let now = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            now += performance.now();
        }
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (now + Math.random() * 16) % 16 | 0;
            now = Math.floor(now / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    //#endregion --------------------------------- 换肤 --------------------------------------------------
    // 获取当前皮肤纹理
    getCurRegionTexture(slotName: string) {
        return this.curRegionTextures[slotName];
    }

    /**
     * 用来设置开始播放动画的事件监听。
     */
    setStartListener(listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setStartListener(listener);
    }
    /**
     * 用来设置动画被打断的事件监听。
     */
    setInterruptListener(listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setInterruptListener(listener);
    }
    /**
     * 用来设置动画播放完后的事件监听。
     */
    setEndListener(listener: __private._cocos_spine_skeleton__TrackListener): void {

        isValid(this.skeleton) && this.skeleton.setEndListener(listener);
    }
    /**
     * 用来设置动画将被销毁的事件监听。
     */
    setDisposeListener(listener: __private._cocos_spine_skeleton__TrackListener): void {

        isValid(this.skeleton) && this.skeleton.setDisposeListener(listener);
    }
    /**
     * 用来设置动画播放一次循环结束后的事件监听。
     */
    setCompleteListener(listener: __private._cocos_spine_skeleton__TrackListener): void {

        isValid(this.skeleton) && this.skeleton.setCompleteListener(listener);
    }
    /**
     * 用来设置动画播放过程中帧事件的监听。
     */
    setEventListener(listener: __private._cocos_spine_skeleton__TrackListener2): void {
        isValid(this.skeleton) && this.skeleton.setEventListener(listener);
    }
    /**
     * 用来为指定的 TrackEntry 设置动画开始播放的事件监听。
     */
    setTrackStartListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setTrackStartListener(entry, listener);
    }
    /**
     * 用来为指定的 TrackEntry 设置动画被打断的事件监听。
     */
    setTrackInterruptListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setTrackInterruptListener(entry, listener);
    }
    /**
     * 用来为指定的 TrackEntry 设置动画播放结束的事件监听。
     */
    setTrackEndListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setTrackEndListener(entry, listener);

    }
    /**
     * 用来为指定的 TrackEntry 设置动画即将被销毁的事件监听。
     */
    setTrackDisposeListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener): void {
        isValid(this.skeleton) && this.skeleton.setTrackDisposeListener(entry, listener);

    }
    /**
     * 用来为指定的 TrackEntry 设置动画一次循环播放结束的事件监听。
     */
    setTrackCompleteListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener2): void {
        isValid(this.skeleton) && this.skeleton.setTrackCompleteListener(entry, listener);

    }
    /**
     * 用来为指定的 TrackEntry 设置动画帧事件的监听。
     */
    setTrackEventListener(entry: sp.spine.TrackEntry, listener: __private._cocos_spine_skeleton__TrackListener | __private._cocos_spine_skeleton__TrackListener2): void {
        isValid(this.skeleton) && this.skeleton.setTrackEventListener(entry, listener);
    }


    loadResource(loaderKey: string, fullPath: string, bundle?: AssetManager.Bundle | string): Promise<AnimationSkeleton> {
        if (!fullPath) {
            console.error(`AnimationSkeleton-> fullPath undefined`);
            return;
        }

        this._lazyInit();
        if (this.fullPath == fullPath) {
            log(`AnimationSkeleton-> 加载的资源和当前资源相同，跳过加载！`);
            return Promise.resolve(this);
        }
        let _skeleton = this.skeleton;
        return new Promise((resolve, reject) => {
            let loader = tnt.loaderMgr.get(loaderKey);
            loader.load(fullPath, sp.SkeletonData, (err, skeletonData) => {
                if (err) {
                    resolve(null);
                    return;
                }
                this.fullPath = fullPath;
                _skeleton.skeletonData = skeletonData;
                _skeleton.invalidAnimationCache();
                resolve(this);
            }, bundle);
        });
    }

    logSlots() {
        console.log('skeletonCtrl-> skeletonJson:');
        console.dir(this.skeleton.skeletonData.skeletonJson);


        // console.log('skeletonCtrl-> skeletonJson.slots:');
        // console.dir(this.skeleton.skeletonData.skeletonJson.slots);
    }

    logAnimations() {
        if (!DEV) {
            return [];
        }
        // @ts-ignore
        let animations = this.skeleton.skeletonData._skeletonCache && this.skeleton.skeletonData._skeletonCache.animations;
        let names = [];
        if (animations) {
            for (let i = 0; i < animations.length; i++) {
                const anim = animations[i];
                names.push(anim.name);
            }
        }
        console.log(`AnimationSkeleton->animations ${JSON.stringify(names)}`);
        return names;
    }
}

export { };

tnt.AnimationSkeleton = AnimationSkeleton;