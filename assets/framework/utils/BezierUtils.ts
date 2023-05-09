import { v2, Vec2 } from "cc";

declare global {
    interface ITNT {
        bezierUtils: BezierUtils;
    }
}

class BezierUtils {

    /**
     * 根据 progress 获取三阶贝塞尔曲线上的点
     *
     * @param {number} t
     * @param {Vec2} p0
     * @param {Vec2} p1
     * @param {Vec2} p2
     * @param {Vec2} p3
     * @return {*} 
     * @memberof BezierUtils
     */
    public bezierPoint(t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2) {
        let u = 1 - t;
        let tt = t * t;
        let uu = u * u;
        let uuu = uu * u;
        let ttt = tt * t;

        let p = v2();
        p.x = uuu * p0.x;
        p.y = uuu * p0.y;

        p.x += 3 * uu * t * p1.x;
        p.y += 3 * uu * t * p1.y;

        p.x += 3 * u * tt * p2.x;
        p.y += 3 * u * tt * p2.y;

        p.x += ttt * p3.x;
        p.y += ttt * p3.y;

        return p;
    }
    /**
     * 获取三阶贝塞尔曲线的长度
     *
     * @param {Vec2} p0
     * @param {Vec2} p1
     * @param {Vec2} p2
     * @param {Vec2} p3
     * @param {number} [pointCount=30]
     * @return {*}  {number}
     * @memberof BezierUtils
     */
    public getBezier_length(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, pointCount = 30): number {
        let length = 0.0;
        pointCount = Math.floor(pointCount);
        let lastPoint = this.bezierPoint(0.0 / pointCount, p0, p1, p2, p3);
        for (let i = 1; i <= pointCount; i++) {
            let point = this.bezierPoint(i / pointCount, p0, p1, p2, p3);
            length += Math.sqrt((point.x - lastPoint.x) * (point.x - lastPoint.x) + (point.y - lastPoint.y) * (point.y - lastPoint.y));
            lastPoint = point;
        }


        if (pointCount == Math.floor(length) || pointCount == Math.ceil(length)) {
            return pointCount;
        }
        return this.getBezier_length(p0, p1, p2, p3, length);
    }
    /**
     * 获取三阶贝塞尔曲线的所有点
     *
     * @param {Vec2} p0
     * @param {Vec2} p1
     * @param {Vec2} p2
     * @param {Vec2} p3
     * @return {*} 
     * @memberof BezierUtils
     */
    public getAllPoints(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2) {
        let length = this.getBezier_length(p0, p1, p2, p3);
        let points = [];
        for (let i = 1; i <= length; i++) {
            let point = this.bezierPoint(i / length, p0, p1, p2, p3);
            // point.x = Math.floor(point.x);
            // point.y = Math.floor(point.y);
            points.push(point);
        }
        return points;
    }


    private static instance: BezierUtils = null;
    public static getInstance(): BezierUtils {
        if (!this.instance) {
            this.instance = new BezierUtils();
        }
        return this.instance;
    }
}

tnt.bezierUtils = BezierUtils.getInstance();
export { };