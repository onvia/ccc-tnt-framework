
import { _decorator } from "cc";
const { ccclass } = _decorator;

declare global {

    interface ITNT {
        Stage2D: typeof Stage2D;
    }

    namespace tnt {
        type Stage2D<Options> = InstanceType<typeof Stage2D<Options>>;
    }
}


@ccclass('Stage2D')
class Stage2D<Options = any> extends tnt.GComponent<Options> {

}
tnt.Stage2D = Stage2D;
export { };