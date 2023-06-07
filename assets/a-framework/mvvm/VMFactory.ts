import { VMCustomHandler } from "./handlers/VMCustomHandler";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { VMLabelHandler } from "./handlers/VMLabelHandler";
import { VMProgressHandler } from "./handlers/VMProgressHandler";
import { VMForHandler } from "./handlers/VMForHandler";


export const enum VMHandlerName {
    Common = 'common',
    String = 'string',
    For = 'for',
    Progress = 'progress',
    Event = 'event',
    Click = 'click',
    Active = 'active',
    SpriteFrame = 'spriteFrame'
}



let producers = {
    [VMHandlerName.Common]: VMCustomHandler,
    [VMHandlerName.String]: VMLabelHandler,
    [VMHandlerName.Progress]: VMProgressHandler,
    [VMHandlerName.For]: VMForHandler,

}


function registerVMHandler<T extends VMBaseHandler<any>>(type: string, listenerClass: GConstructor<T>) {
    if (!type) {
        throw new Error('VMFatory registerVMTrigger [type] is null');
    }
    producers[type] = listenerClass;
}

function getVMHandler<T extends VMBaseHandler<any>>(type: string): GConstructor<T> {
    if (type in producers) {
        return producers[type];
    }
    return null
}

function hasVMHandler(type: string) {
    return type in producers;
}

export {
    registerVMHandler,
    getVMHandler,
    hasVMHandler
}