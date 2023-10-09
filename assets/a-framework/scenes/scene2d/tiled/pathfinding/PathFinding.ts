import { Vec2, _decorator } from "cc";

const { ccclass } = _decorator;

declare global {
    interface IPathFinding {
        GridNode: typeof GridNode;
    }
    namespace tnt {
        namespace pf {
            type GridNode = InstanceType<typeof GridNode>;

            interface IWall {
                isWall(weight: number): boolean;
            }
            interface ICoordinateTransform {
                /** 转换到世界坐标 */
                gridToWorld(grid: Readonly<Vec2>): Vec2;

                /** 转换到像素坐标 */
                gridToPixel(grid: Readonly<Vec2>): Vec2;
            }

            interface IPathFinder {
                wall: IWall;
                /** 坐标转换 */
                coordinateTransform: ICoordinateTransform;

                // createRouteGraph(gridIn: number[][], ...args);
                search(startNode: Vec2, endNode: Vec2, ...args): GridNode[];

                createGridNode(x: number, y: number, weight: number): GridNode;
            }

        }
    }
}

class GridNode {
    public f: number = null;
    public g: number = null;
    public h: number = null;

    public x: number = null;
    public y: number = null;

    public pixelX: number = null;
    public pixelY: number = null;
    public worldX: number = null;
    public worldY: number = null;


    public weight: number = null;
    public parent: GridNode = null;

    public closed: boolean = false;
    public visited: boolean = false;

    constructor(x: number, y: number, weight: number) {
        this.x = x;
        this.y = y;
        this.weight = weight;
    }

    public isWall(wall: tnt.pf.IWall): boolean {
        return wall.isWall(this.weight);
    }

    public getCost(fromNeighbor: GridNode, calculatedWeight: boolean): number {
        if (!calculatedWeight) {
            return 10//this.weight;
        }
        if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
            // return 14//this.weight * 1.41421;
            return this.weight * 1.41421
        }
        return 10//this.weight;
    }
    clear() {
        this.f = null;
        this.g = null;
        this.h = null;
        this.closed = false;
        this.visited = false;
        this.parent = null;
    }
    toJSON() {
        return {
            f: this.f,
            g: this.g,
            h: this.h,
            x: this.x,
            y: this.y,
            weight: this.weight,
            pixelX: this.pixelX,
            pixelY: this.pixelY,
            worldX: this.worldX,
            worldY: this.worldY,
        };
    }
}

tnt.pf.GridNode = GridNode;
export { };