import { _decorator, Node, Asset, SpriteFrame, director, Script } from "cc";
import { BasisTranscoder } from "./transcoder/BasisTranscoder";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global {
    interface BasisTestOptions {

    }
}

@ccclass('BasisTest')
export class BasisTest extends tnt.SceneBase<BasisTestOptions> {

    onEnterTransitionStart(sceneName?: string): void {

    }

    onEnter(): void {
        let transcoder = new BasisTranscoder();
        tnt.resourcesMgr.registerLoadBinary(".wasm")
        tnt.resourcesMgr.registerLoadBinary(".png", (file, options) => {
            if (file instanceof HTMLImageElement) {
                return file;
            }
            let buffer = new Uint8Array(file);
            if (buffer[0] === 0x73 && buffer[1] === 0x42 && buffer[2] === 0x13 && buffer[3] === 0x00 && buffer[4] === 0x4d) {
                return transcoder.transcoder(file);
            }
            const mimeType = 'image/png';
            const blob = new Blob([file], { type: mimeType });
            return createImageBitmap(blob, { premultiplyAlpha: 'none' })
        });

        console.time('load-basis');
        this.loader.load("basis-test#spineboy-pro1", SpriteFrame, (err, spriteFrame) => {
            let sprite = this.getSpriteByName("Sprite1");
            sprite.spriteFrame = spriteFrame;
            console.log(`BasisTest-> basis`);
            console.timeEnd('load-basis');
        });

        console.time('load-png');
        this.loader.load("basis-test#spineboy-pro", SpriteFrame, (err, spriteFrame) => {
            let sprite = this.getSpriteByName("Sprite2");
            sprite.spriteFrame = spriteFrame;
            console.log(`BasisTest-> basis`);
            console.timeEnd('load-png');
        });

        tnt.resourcesMgr.load("basis", "basis-test#scripts/transcoder/basis_transcoder", Script, (err, binary) => {
            console.log(`BasisTest-> js`);
        });
    }

    onExit(): void {

    }






}
