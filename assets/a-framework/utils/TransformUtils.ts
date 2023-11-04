import { Mat4, Node, Rect, UITransform, Vec3, _decorator } from "cc";

declare global {
    interface ITNT {
        transformUtils: TransformUtils;
    }
}

const _matrix = new Mat4();
const _worldMatrix = new Mat4();

class TransformUtils {

    /**将目标节点坐标转换到当前节点下 */
    public convertToNodeLocalPosition(child: Node, parent: Node): Vec3 {
        let worldPos: Vec3;
        if (child.parent) {
            worldPos = child.worldPosition;
        }
        let currentPos = worldPos.clone();
        if (parent) {
            // let transform = currentNode.parent.getComponent(UITransform);
            // currentPos = transform.convertToNodeSpaceAR(worldPos);
            currentPos = this.getWorldToNodePosition(parent, worldPos);
        }
        return currentPos;
    }


    setSafeAnchor(node: Node, anchorX: number, anchorY: number) {
        let trans = node.getComponent(UITransform)

        let cacheAR = trans.anchorPoint;
        let diffX = (anchorX - cacheAR.x) * trans.width * (node.scale.x);
        let diffY = (anchorY - cacheAR.y) * trans.height * (node.scale.y);

        trans.anchorX = anchorX;
        trans.anchorY = anchorY;
        node.position = new Vec3(node.position.x + diffX, node.position.y + diffY, node.position.z);
    };


    /**
     * 将 parentNode 设置为 childNode 的父节点
     * @param {Node} parentNode 
     * @param {Node} childNode 
     */
    setParentKeepTransform(parentNode: Node, childNode: Node) {
        if (parentNode === childNode.parent)
            return;


        let worldPos = this.getWorldPosition(childNode);
        let worldAngle = this.getWorldAngle(childNode);
        let lossyScale = this.getWorldScale(childNode);

        childNode.parent = parentNode;

        this.setWorldPosition(childNode, worldPos);
        this.setWorldAngle(childNode, worldAngle);
        if (parentNode) {
            let parentWorldScale = this.getWorldScale(parentNode);
            lossyScale.x /= parentWorldScale.x;
            lossyScale.y /= parentWorldScale.y;
            childNode.scale = lossyScale;
        } else {
            childNode.scale = lossyScale;
        }
    }
    /**
     * 获得node的世界坐标
     * @param {Node} node 
     * @returns {Vec3}
     */
    getWorldPosition(node: Node) {

        let transform = node.parent.getComponent(UITransform);
        return transform.convertToWorldSpaceAR(node.position);
    }
    /**
     * 将node设置到世界坐标worldPos处
     * @param {Node} node
     * @param {Vec3} worldPos
     */
    setWorldPosition(node: Node, worldPos: Vec3) {
        let parent = node.parent;
        if (parent) {
            let transform = node.parent.getComponent(UITransform);
            node.position = transform.convertToNodeSpaceAR(worldPos);
        } else {
            node.position = worldPos;
        }
        return node.position;
    }
    /**
     * 获得node在世界坐标系下的旋转
     * @param {Node} node 
     * @return {float}
     */
    getWorldAngle(node: Node) {
        return this.getNodeToWorldAngle(node.parent, node.angle);
    }
    /**
     * 将node设置为世界坐标系下旋转worldRotation的姿态
     * @param {Node} node 
     * @param {number} worldAngle 
     */
    setWorldAngle(node: Node, worldAngle: number) {
        node.angle = this.getWorldToNodeAngle(node.parent, worldAngle);
        //
        return node.angle;
    }
    /**
     * 获得node在世界坐标下的缩放
     * @param {Node} node 
     * @returns {Vec3}
     */
    getWorldScale(node: Node) {
        return this.getNodeToWorldScale(node.parent, node.scale.x, node.scale.y);
    }
    /**
     * 将node设置为在世界坐标下缩放worldScale的形态
     * @param {Node} node 
     * @param {Vec3} worldScale 
     */
    setWorldScale(node: Node, worldScale: Vec3) {
        let s = this.getWorldToNodeScale(node.parent, worldScale.x, worldScale.y);
        node.scale = s;
        //
        return node.scale;
    }
    /**
     * 获得node本地坐标系下的点在世界坐标系下的位置
     * @param {Node} node 
     * @param {Vec3} positionInNode 
     */
    getNodeToWorldPosition(node: Node, positionInNode: Vec3) {
        if (node === null) {
            return positionInNode;
        }
        let transform = node.getComponent(UITransform);
        return transform.convertToWorldSpaceAR(positionInNode);
    }
    /**
     * 获得世界坐标系下的点在node本地坐标下的位置
     * @param {Node} node 
     * @param {Vec3} positionInWorld 
     */
    getWorldToNodePosition(node: Node, positionInWorld: Vec3) {
        if (node === null) {
            return positionInWorld;
        }

        let transform = node.getComponent(UITransform);
        return transform.convertToNodeSpaceAR(positionInWorld);
    }
    /**
     * 获得node本地坐标下的缩放在世界坐标下的缩放量
     * @param {Node} node 
     * @param {float} scaleXInNode 
     * @param {float} scaleYInNode 
     */
    getNodeToWorldScale(node: Node, scaleXInNode: number, scaleYInNode: number, scaleZInNode: number = 1) {
        // if (node === null)
        //     return new Vec2(scaleXInNode, scaleYInNode);
        let scaleX = scaleXInNode;//node.scaleX;
        let scaleY = scaleYInNode;//node.scaleY;
        let scaleZ = scaleZInNode;
        let parent = node;//.parent;
        while (parent) {// && parent.parent) {
            scaleX *= parent.scale.x;
            scaleY *= parent.scale.y;
            scaleZ *= parent.scale.z;
            parent = parent.parent;
        }
        // return new Vec2(scaleX, scaleY);
        return new Vec3(scaleX, scaleY, scaleZ);
    }
    /**
     * 获得世界缩放在node本地坐标下的缩放量
     * @param {Node} node 
     * @param {float} scaleXInWorld 
     * @param {float} scaleYInWorld 
     */
    getWorldToNodeScale(node: Node, scaleXInWorld: number, scaleYInWorld: number, scaleZInWorld: number = 1) {
        // if (node === null)
        //     return new Vec2(scaleXInWorld, scaleYInWorld);
        // let scale = this.getNodeToWorldScale(node.parent, node.scaleX, node.scaleY);
        let scale = this.getWorldScale(node);
        return new Vec3(scaleXInWorld / scale.x, scaleYInWorld / scale.y, scaleZInWorld / scale.z);
    }
    /**
     * 获得node本地坐标下的旋转在世界坐标下的旋转量
     * @param {Node} node 
     * @param {float} rotationInNode 
     */
    getNodeToWorldAngle(node: Node, rotationInNode: number) {
        // if (node === null)
        //     return rotationInNode;
        let rot = rotationInNode;//node.rotationX;
        let parent = node;//.parent;
        while (parent) {//} && parent.parent) {
            if (isNaN(parent.angle)) {
                parent = parent.parent;
                continue;
            }
            rot += parent.angle;
            parent = parent.parent;
        }
        return rot;
    }
    /**
     * 获得世界坐标下的旋转在node本地坐标下的旋转量
     * @param {Node} node 
     * @param {float} rotationInWorld 
     */
    getWorldToNodeAngle(node: Node, rotationInWorld: number) {
        // if (node === null)
        //     return rotationInWorld;
        let rotation = rotationInWorld;
        // rotation -= node.rotation;
        let parent = node;//.parent;
        while (parent) {//} && parent.parent) {
            if (isNaN(parent.angle)) {
                parent = parent.parent;
                continue;
            }
            rotation -= parent.angle;
            parent = parent.parent;
        }
        return rotation;
    }

    /**
     * 计算节点的世界包围盒，但是不包含子节点
     *
     * @param {Node} node
     * @return {*} 
     * @memberof TransformUtils
     */
    public getBoundingBoxToWorldWithoutChildren(node: Node) {
        node.parent.getWorldMatrix(_worldMatrix);
        Mat4.fromRTS(_matrix, node.getRotation(), node.getPosition(), node.getScale());
        const width = node.uiTransform.contentSize.width;
        const height = node.uiTransform.contentSize.height;
        const rect = new Rect(
            -node.uiTransform.anchorPoint.x * width,
            -node.uiTransform.anchorPoint.y * height,
            width,
            height,
        );

        Mat4.multiply(_worldMatrix, _worldMatrix, _matrix);
        rect.transformMat4(_worldMatrix);

        return rect;
    }
    private static _instance: TransformUtils = null
    public static getInstance(): TransformUtils {
        if (!this._instance) {
            this._instance = new TransformUtils();
        }
        return this._instance;
    }
}

tnt.transformUtils = TransformUtils.getInstance();
export { };