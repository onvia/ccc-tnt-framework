
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;



type Callback<T> = (item: T) => T;
interface FlowNode<T> {
    callback: Callback<T>;
    target: Object;
};


@ccclass('Flow')
export class Flow<T> {

    nodes: FlowNode<T>[] = [];

    exec(input: T): T {
        let res: T = input;

        for (let i = 0; i < this.nodes.length; ++i) {
            let node = this.nodes[i];
            res = node.callback.apply(node.target, res);

            if (res === null || res === undefined) {
                return res;
            }
        }

        return res;
    }

    push<K extends T>(callback: Callback<K>, target: Object): FlowNode<K> {
        let flowNode: FlowNode<K> = {
            callback,
            target
        };
        this.nodes.push(flowNode);
        return flowNode;
    }

    remove<K extends T>(callback: Callback<K>) {
        return this.nodes.remove(v => v.callback === callback);
    }

}

export type FlowData<T extends Flow<any>> = T extends Flow<infer R> ? R : unknown;