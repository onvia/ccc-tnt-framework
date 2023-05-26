import { VMCustomTrigger } from "./triggers/VMCustomTrigger";
import { VMTrigger } from "./triggers/VMTrigger";
import { TriggerName } from "./VMOperations";


export class VMFatory {

    public registerVMTrigger<T extends VMTrigger<any>>(type: string, listenerClass: GConstructor<T>) {
        if (!type) {
            throw new Error('VMFatory registerVMTrigger [type] is null');
        }
        producers[type] = listenerClass;
    }

    public getVMTrigger<T extends VMTrigger<any>>(type: string): GConstructor<T> {
        if (type in producers) {
            return producers[type];
        }
        return null
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
    [TriggerName.Common]: VMCustomTrigger,

}

