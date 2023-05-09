
import { _decorator } from "cc";
const { ccclass } = _decorator;



declare global {

    interface ITNT {
        Actor2D: typeof Actor2D;
    }

    namespace tnt {
        type Actor2D<Options> = InstanceType<typeof Actor2D<Options>>;
    }
}

@ccclass('Actor2D')
class Actor2D<Options = any> extends tnt.GComponent<Options> {

}
tnt.Actor2D = Actor2D;
export { };