import { Component, Node } from "cc";
import { DEV } from "cc/env";
import { TriggerOpTypes } from "../reactivity/_internals";
import { VMLabelAttr, WatchPath } from "../_mv_declare";
import { VMCustomHandler } from "./VMCustomHandler";

export class VMLabelHandler extends VMCustomHandler {

    originText: string = "";
    //保存着字符模板格式的数组 (只会影响显示参数)
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

        if (!this.attr.formator && this.templateParamCount >= 1) {
            if (this.templateParamCount !== watchPathCount) {
                let msg = `VMLabelHandler-> [${this.node.name}] 模板参数与输入参数[${JSON.stringify(this.attr.watchPath)}]数量不一致，请实现 formator 方法`;
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

}