
import { Node, AudioSource, sys, _decorator, path, AudioClip, misc, director } from "cc";
const { ccclass } = _decorator;


 declare global {
     interface ITNT{
        audioMgr: AudioMgr;
     }
     interface AudioMgrOptions{
        soundEffectDir?: string;
        musicDir?: string;
        bundle?: string;
     }
 }

@ccclass('AudioMgr')
class AudioMgr {
    readonly LOADER_KEY = "audio";
    
    storageKey(){
        return "audioSetting"
    }

    private _isInited = false;

    private _config: AudioMgrOptions = {
        soundEffectDir: "sound/",
        musicDir: "sound/",
        bundle: null,
    }

    audioSetting = {
        music: true,
        effect: true,
        musicVolume: 1,
        effectVolume: 1,
    }

    /** 当前正在播放的背景音乐 */
    protected curMusicName: string = "";

    public music: AudioSource = null;
    public effect: AudioSource = null;




    get loader(){
        return tnt.loaderMgr.get(this.LOADER_KEY);
    }

    init(config?: AudioMgrOptions){
        if(this._isInited){
            console.warn(`AudioMgr-> 请不要重复执行初始化`);
            return;
        }

        if(config){
            this._config = Object.assign(this._config,config);
        }


        this._isInited = true;
        let localSetting = sys.localStorage.getItem(this.storageKey());
        if(localSetting){
            this.audioSetting = JSON.parse(localSetting);
        }

        let node = new Node("AudioMgr");
        director.addPersistRootNode (node);

        let musicNode = new Node("Music");
        let soundEffectNode = new Node("SoundEffect");

        musicNode.parent = node;
        soundEffectNode.parent = node;

        this.music = musicNode.addComponent(AudioSource);
        this.effect = soundEffectNode.addComponent(AudioSource);

        this.music.playOnAwake = false;
        this.effect.playOnAwake = false;

        this.music.volume = this.audioSetting.musicVolume;
        this.effect.volume = this.audioSetting.effectVolume;
        
    }

    playMusic(name: string,loop = true){
        if(!name){
            return false;
        }
        const audioSource = this.music;
        audioSource.loop = loop;
        this.curMusicName = name;
        if(!this.audioSetting.music){
            return false;
        }
        return new Promise<boolean>((resolve, reject) => {
            this.loader.load(path.join(this._config.musicDir,name),AudioClip,(err,clip)=>{
                if(err){
                    resolve(false);
                    return;
                }
                if(audioSource.playing){
                    audioSource.stop();
                }
                audioSource.clip = clip;
                audioSource.currentTime = 0;
                
                audioSource.play();
                resolve(true);
            },this._config.bundle);
        })
    }

    playEffect(name: string,volume: number = 1){
        if(!this.audioSetting.effect || !name){
            return false;
        }
        return new Promise<boolean>((resolve, reject) => {
            let audioSource = this.effect;
            this.loader.load(path.join(this._config.soundEffectDir,name),AudioClip,(err,clip)=>{
                if(err){
                    resolve(false);
                    return;
                }
                audioSource.playOneShot(clip,volume);
                resolve(true);
            },this._config.bundle);
        })
    }
    
    public resumeAll() {
        this.music?.play();
        this.effect?.play();
    }

    public pauseAll() {
        this.music?.pause();
        this.effect?.pause();
    }
    
    public stopAll() {
        this.music?.stop();
        this.effect?.stop();
    }


    /**
     * 背景音开关
     */
     switchMusic() {
        this.audioSetting.music = !this.audioSetting.music;
        if (!this.audioSetting.music) {
            //停止音乐播放
            this.music.stop();
        }else{
            // warn(`AudioMgr-> 请手动调用播放背景音接口`);
            this.playMusic(this.curMusicName,this.music.loop);
        }
        this.saveSetting();
        return this.audioSetting.music;
    }

    /**
     * 获取背景音开关状态
     */
     getSwitchMusic() {
        return this.audioSetting.music;
    }

    /**
     * 转换音效开关
     */
    switchEffect() {
        this.audioSetting.effect = !this.audioSetting.effect;
        if (!this.audioSetting.effect) {
            //停止所有音效
            this.effect.stop();
        }
        this.saveSetting();
        return this.audioSetting.effect;
    }

    /**
     * 获取音效开关状态
     */
     getSwitchEffect() {
        return this.audioSetting.effect;
    }

    /**
     * 设置背景音量 设置完成之后手动调用保存设置
     * @param volume 
     */
    setMusicVolume(volume){
        volume = misc.clampf(volume,0,1);
        this.audioSetting.musicVolume = volume;
        this.music.volume = volume;
    }
    /**
     * 设置音效音量 设置完成之后手动调用保存设置
     * @param volume 
     */
    setEffectVolume(volume){
        volume = misc.clampf(volume,0,1);
        this.audioSetting.effectVolume = volume;
        this.effect.volume = volume;
    }

    saveSetting(){
        sys.localStorage.setItem(this.storageKey(), JSON.stringify(this.audioSetting));
    }

    private static _instance:AudioMgr = null
    public static getInstance(): AudioMgr{
        if(!this._instance){
            this._instance = new AudioMgr();
        }
        return this._instance;
    }
}

tnt.audioMgr = AudioMgr.getInstance();
export {};