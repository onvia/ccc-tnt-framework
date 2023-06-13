import { isValid } from "cc";
import { handlerMap, rawDepsMap, rawNameMap, targetMap, TriggerOpTypes } from "./_internals";

function _trigger(target: object, type: TriggerOpTypes, key: PropertyKey, newValue: any, oldValue: any) {
    let targets = targetMap.get(target); //
    if (targets) {
        let _deleteArr: any[] = null;
        let fullPath = _getFullWatchPath(target, key);
        targets.forEach((_target) => {
            if (!isValid(_target)) {
                _deleteArr = _deleteArr || [];
                _deleteArr.push(_target);
                return;
            }
            let vmHandlerArray = handlerMap.get(_target);
            if (!vmHandlerArray) {
                console.error(`_reaction-> [${_target.name}] handler 错误，如果此错误在你的预期内，请忽略`);
                return;
            }
            for (let i = 0; i < vmHandlerArray.length; i++) {
                const vmTrigger = vmHandlerArray[i];
                if (vmTrigger.isWatchPath(fullPath)) {
                    vmTrigger.handle(newValue, oldValue, type, fullPath);
                }
            }
        });

        if (_deleteArr) {
            for (let i = 0; i < _deleteArr.length; i++) {
                const element = _deleteArr[i];
                targets.delete(element);
            }
            _deleteArr = null;
        }
    }
}


function _getFullWatchPath(target: object, propertyKey: PropertyKey) {
    let parent = target;
    let objectName: PropertyKey = "";
    let pathArr = [propertyKey];
    while (parent) {
        objectName = rawNameMap.get(parent); // 先获取对象名称（属性名）
        parent = rawDepsMap.get(parent); // 获取被依赖的数据
        pathArr.unshift(objectName); // 最前面插入名称
    }

    let pathStr = pathArr.join(".");
    return pathStr;
}

export {
    _trigger
 };