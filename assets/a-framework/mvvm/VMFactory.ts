import { VMCustomHandler } from "./handlers/VMCustomHandler";
import { VMBaseHandler } from "./handlers/VMBaseHandler";
import { VMHandlerName } from "./VMOperations";
import { VMLabelHandler } from "./handlers/VMLabelHandler";
import { VMProgressHandler } from "./handlers/VMProgressHandler";
import { VMForHandler } from "./handlers/VMForHandler";


export class VMFatory {

    public registerVMHandler<T extends VMBaseHandler<any>>(type: string, listenerClass: GConstructor<T>) {
        if (!type) {
            throw new Error('VMFatory registerVMTrigger [type] is null');
        }
        producers[type] = listenerClass;
    }

    public getVMHandler<T extends VMBaseHandler<any>>(type: string): GConstructor<T> {
        if (type in producers) {
            return producers[type];
        }
        return null
    }

    public hasVMHandler(type: string){
        return type in producers;
    }

    private static _instance: VMFatory = null
    public static getInstance(): VMFatory {
        if (!this._instance) {
            this._instance = new VMFatory();
        }
        return this._instance;
    }
}

let producers = {
    [VMHandlerName.Common]: VMCustomHandler,
    [VMHandlerName.String]: VMLabelHandler,
    [VMHandlerName.Progress]: VMProgressHandler,
    [VMHandlerName.For]: VMForHandler,

}

