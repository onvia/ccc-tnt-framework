import { _decorator } from "cc";
import { TaskQueue } from "./TaskQueue";

const { ccclass } = _decorator;




// let _taskPool = new js.Pool<Task>(32);
// let _get = _taskPool._get;
// _taskPool.get = function(){
//     if(_taskPool.count <= 0){
//         return new Task();
//     }
//     let element =  _get();
//     return element;
// }

declare global {
    interface ITNT {
        taskMgr: TaskMgr;
    }

    interface ITNT {
        TaskMgr: typeof TaskMgr;
    }

    namespace tnt {
        type TaskMgr = InstanceType<typeof TaskMgr>;
    }
}

@ccclass('TaskMgr')
class TaskMgr extends TaskQueue {

    createTaskGroup() {
        return new TaskQueue();
    }

    private static _instance: TaskMgr = null
    public static getInstance(): TaskMgr {
        if (!this._instance) {
            this._instance = new TaskMgr();
        }

        return this._instance;
    }
}

export let taskMgr = TaskMgr.getInstance();
tnt.taskMgr = taskMgr;