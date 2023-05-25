import { VMCustomTrigger } from "./triggers/VMCustomTrigger";
import { VMTrigger } from "./triggers/VMTrigger";
import { TriggerName } from "./VMOperations";



export class VMFatory {

    public static register<T extends VMTrigger<any>>(type: string, listenerClass: GConstructor<T>) {
        if (!type) {
            throw new Error('VMFatory register [type] is null');
        }
        producers[type] = listenerClass;
    }

    public static getVMTrigger<T extends VMTrigger<any>>(type: string): GConstructor<T> {
        if (type in producers) {
            return producers[type];
        }
        return null
    }

}

let producers = {
    [TriggerName.Common]: VMCustomTrigger,
    
}