import { TriggerOpTypes } from "../VMOperations";
import { WatchPath } from "../_mv_declare";
import { VMBaseHandler } from "./VMBaseHandler";

export class VMCustomHandler extends VMBaseHandler {

    onInitValue() {
        let _watchPath = this.attr.watchPath;
        if (Array.isArray(_watchPath)) {
            let max = _watchPath.length;
            for (let i = 0; i < max; i++) {
                let val = tnt.vm.getValue(_watchPath[i], null);
                this.templateValuesCache[i] = val;
            }
            this._updateValueUseFormator(this.templateValuesCache, null, _watchPath); // 重新解析
        } else {
            let val = tnt.vm.getValue(_watchPath as string, null);
            // this.templateValuesCache[0] = val;
            this._updateValueUseFormator(val, null, _watchPath);
        }
    }

    onBind(): void {

    }

    onUnBind(): void {

    }

    handle(newValue: any, oldValue: any, type: TriggerOpTypes, watchPath: WatchPath) {
        let path = watchPath;
        let _watchPath = this.attr.watchPath;
        let vmTween = this.attr.tween;
        let _resolve = (_newValue: any, _oldValue: any, _path: any) => {
            this._updateValueUseFormator(_newValue, _oldValue, _path); // 重新解析
        }

        if (Array.isArray(_watchPath)) {
            let _oldVal = [...this.templateValuesCache];
            //寻找缓存位置
            let index = _watchPath.findIndex(v => v === path);
            if (index >= 0) {
                //如果是所属的路径，就可以替换文本了
                this.templateValuesCache[index] = newValue; //缓存值
            }

            if (vmTween) {
                vmTween.onTransition(this.templateValuesCache, _oldVal, _watchPath, _resolve);
            } else {
                _resolve(this.templateValuesCache, _oldVal, _watchPath);
            }

        } else {
            // this.templateValuesCache[0] = newValue;
            if (vmTween) {
                vmTween.onTransition(newValue, oldValue, _watchPath, _resolve);
            } else {
                _resolve(newValue, oldValue, _watchPath);
            }
        }
    }

}