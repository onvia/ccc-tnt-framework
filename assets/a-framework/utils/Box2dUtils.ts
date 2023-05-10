import { Node, Component, _decorator, RigidBody2D, MouseJoint2D, ERigidBody2DType, BoxCollider2D } from "cc";
declare global {
    interface ITNT {
        box2dUtils: Box2dUtils;
    }
}

class Box2dUtils {
    onMouse(target: Node | Component) {

        target = target instanceof Node ? target : target.node;

        let node = new Node();

        let body = node.addComponent(RigidBody2D);
        body.type = ERigidBody2DType.Static;

        // add mouse joint
        let joint = node.addComponent(MouseJoint2D);
        joint.connectedBody = body;
        node.parent = target;
    }

    addBound(target, size = null) {
        target = target instanceof Node ? target : target.node;
        let width = size ? size.width : target.width;
        let height = size ? size.height : target.height;

        let node = new Node();

        let body = node.addComponent(RigidBody2D);
        body.type = ERigidBody2DType.Static;

        this._addBound(node, 0, height / 2, width, 20);
        this._addBound(node, 0, -height / 2, width, 20);
        this._addBound(node, -width / 2, 0, 20, height);
        this._addBound(node, width / 2, 0, 20, height);

        node.parent = target;
    }

    private _addBound(node, x, y, width, height) {
        let collider = node.addComponent(BoxCollider2D);
        collider.offset.x = x;
        collider.offset.y = y;
        collider.size.width = width;
        collider.size.height = height;
    }


    private static _instance: Box2dUtils = null
    public static getInstance(): Box2dUtils {
        if (!this._instance) {
            this._instance = new Box2dUtils();
        }
        return this._instance;
    }
}

tnt.box2dUtils = Box2dUtils.getInstance();
export { };