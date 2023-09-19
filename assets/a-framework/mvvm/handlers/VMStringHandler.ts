import { Component, js, Node } from "cc";
import { DEV } from "cc/env";
import { TriggerOpTypes } from "../reactivity/_internals";
import { VMLabelAttr, WatchPath } from "../_mv_declare";
import { VMCustomHandler } from "./VMCustomHandler";

export class VMStringHandler extends VMCustomHandler {

    originText: string = "";
    // 模板参数数量
    templateParamCount: number = 0;

    initOriginText() {
        if (!this.originText) {
            this.originText = this.getStringValue();
        }
    }
    onInitValue(): void {

        this.initOriginText();
        this.parseTemplate();
        let watchPathCount = 1;
        if (Array.isArray(this.attr.watchPath)) {
            watchPathCount = this.attr.watchPath.length;
        }

        if (!this.attr.formatter && this.templateParamCount >= 1) {
            if (this.templateParamCount !== watchPathCount) {
                let msg = `VMStringHandler-> [${this.node.name}] 模板参数与输入参数[${JSON.stringify(this.attr.watchPath)}]数量不一致，请实现 formatter 方法`;
                if (DEV) {
                    throw new Error(msg);
                } else {
                    console.error(msg);
                }
            }
        }
        super.onInitValue();
    }

    onBind(): void {
        super.onBind();
    }

    onUnBind(): void {
        super.onUnBind();
    }

    protected async formatValue(newValue: any, oldValue: any, node: Node, nodeIdx: number, watchPath: WatchPath) {
        let result = await super.formatValue(newValue, oldValue, node, nodeIdx, watchPath);
        let _result = this.getFormatText(result);
        let attr = this.attr as VMLabelAttr<any>;
        let maxLength = attr.maxLength;
        if (maxLength && _result.length > maxLength) {
            if (typeof _result != 'string') {
                _result = String(_result);
            }
            _result = _result.substring(0, maxLength) + "...";
        }
        return _result;
    }


    getStringValue(): string {
        return this.target.string;
    }

    changeOriginText(value: string) {
        this.originText = value;
        super.onInitValue();
    }


    //解析模板 获取初始格式化字符串格式 的信息
    parseTemplate() {
        let regexAll = /\{(.+?)\}/g; //匹配： 所有的{value}
        let res = this.originText.match(regexAll);//匹配结果数组
        if (res == null) return;
        this.templateParamCount = res.length;
    }

    getFormatText(value): string {
        if (!value) {
            return value ?? "";
        }
        if (!this.templateParamCount) {
            return value;
        }
        if (!this.originText) {
            return value;
        }
        if (!Array.isArray(value)) {
            value = [value];
        }
        let _string = this.stringFormat(this.originText, ...value);
        return _string;
    }

    stringFormat(key: string, ...args) {
        return tnt.stringUtils.format_0(key, ...args);
    }

    protected V2MBind(target: Node | Component): void {
        let _property = this.attr._targetPropertyKey;
        let desc = js.getPropertyDescriptor(target, _property);
        target[this._vmProperty] = target[_property];

        Object.defineProperty(target, this._vmProperty, {
            get: desc.get,
            set: desc.set
        });
        if (Array.isArray(this.attr.watchPath)) {
            console.error(`VMStringHandler-> 多路径不进行 视图到数据 的绑定`);
            return;
        }

        if (!!desc.set) {
            Object.defineProperty(target, _property, {
                get: desc.get,
                set: (value) => {
                    value = `${value}`;
                    desc.set.call(target, value);

                    let newValue = null;
                    // 处理接收到的数据
                    if (typeof this.templateValuesCache[0] === "number") {
                        if (value.includes(".")) {
                            newValue = parseFloat(value);
                        } else {
                            newValue = parseInt(value);
                        }
                    } else {
                        newValue = value;
                    }

                    tnt.vm.setValue(this.attr.watchPath as string, newValue);
                }
            });
            return;
        }
    }
}