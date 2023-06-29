import { VMCustomHandler } from "./handlers/VMCustomHandler";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { VMStringHandler } from "./handlers/VMStringHandler";
import { VMProgressHandler } from "./handlers/VMProgressHandler";
import { VMForHandler } from "./handlers/VMForHandler";
import { VMEventHandler } from "./handlers/VMEventHandler";


export const enum VMHandlerName {
    Common = 'common',
    String = 'string',
    For = 'for',
    Progress = 'progress',
    Event = 'event',
    // Click = 'click',
    // Active = 'active',
    // SpriteFrame = 'spriteFrame'
}



let producers = {
    [VMHandlerName.Common]: VMCustomHandler,
    [VMHandlerName.String]: VMStringHandler,
    [VMHandlerName.Progress]: VMProgressHandler,
    [VMHandlerName.For]: VMForHandler,
    [VMHandlerName.Event]: VMEventHandler,

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