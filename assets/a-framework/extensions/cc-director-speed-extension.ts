import { Director, director, js, sp, Tween, tween } from "cc";
import { EDITOR } from "cc/env";

if (!EDITOR) {
    if (!Director.prototype["__$cc-director-speed-extension$__"]) {
        Director.prototype["__$cc-director-speed-extension$__"] = true;

        let oldTick = director.tick.bind(director);
        director.tick = function (dt) {
            dt *= director.globalGameTimeScale;
            oldTick(dt);
            // sp.timeScale = director.globalGameTimeScale; 
        };

        js.mixin(Director.prototype, {
            globalGameTimeScale: 1,
        });
    }
}

declare module "cc" {
    interface Director {
        globalGameTimeScale: number;
    }
}

export { };


// sp.timeScale = 0.5;