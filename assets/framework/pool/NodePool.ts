
import { _decorator, Node, isValid } from "cc";
const { ccclass, property } = _decorator;




declare global {

    interface ITNT {
        NodePool: typeof NodePool;
    }

    namespace tnt {
        type NodePool = InstanceType<typeof NodePool>;
    }
}
class NodePool extends tnt.Pool<Node>{


    put(node: Node) {

        if (!node || !isValid(node)) {
            return false;
        }
        let isPut = super.put(node);

        if (isPut) {
            node.removeFromParent();
            return true;
        }
        node?.destroy();
        return false;
    }

    /**
     * 丢弃多余的节点
     * @param size 
     */
    resize(size: number) {
        if (size < this._pool.length) {
            for (let i = size; i < this._pool.length; i++) {
                this._pool[i].destroy();
            }
            this._pool.length = size;
        }
    }

    /**
     * 清理所有结点
     */
    clear() {
        const count = this._pool.length;
        for (let i = 0; i < count; ++i) {
            this._pool[i].destroy();
        }

        this._pool.length = 0;
    }
}

tnt.NodePool = NodePool;

export {};