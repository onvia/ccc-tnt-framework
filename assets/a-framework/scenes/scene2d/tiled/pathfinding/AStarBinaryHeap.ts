import { Vec2 } from "cc";

class BinaryHeap {
    public heap: tnt.pf.GridNode[] = [];
    public scoreFunc: any = null;

    constructor(scoreFunc: any) {
        this.scoreFunc = scoreFunc;
    }

    public push(node: tnt.pf.GridNode) {
        this.heap.push(node);
        this.sinkDown(this.heap.length - 1);
    }

    public pop(): tnt.pf.GridNode {
        let result = this.heap[0];
        let end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.bubbleUp(0);
        }
        return result;
    }

    public remove(node: tnt.pf.GridNode) {
        let index = this.heap.indexOf(node);
        let end = this.heap.pop();
        if (index !== this.heap.length - 1) {
            this.heap[index] = end;
            if (this.scoreFunc(end) < this.scoreFunc(node)) {
                this.sinkDown(index);
            } else {
                this.bubbleUp(index);
            }
        }
    }

    public size(): number {
        return this.heap.length;
    }

    public rescore(node: tnt.pf.GridNode) {
        this.sinkDown(this.heap.indexOf(node));
    }

    private sinkDown(index: number): void {
        let element = this.heap[index];
        while (index > 0) {
            let parentIndex = ((index + 1) >> 1) - 1;
            let parent = this.heap[parentIndex];
            if (this.scoreFunc(element) < this.scoreFunc(parent)) {
                this.heap[parentIndex] = element;
                this.heap[index] = parent;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    private bubbleUp(index: number): void {
        let length = this.heap.length;
        let element = this.heap[index];
        let elemScore = this.scoreFunc(element);

        while (true) {
            let childRIndex = (index + 1) << 1;
            let childLIndex = childRIndex - 1;
            let swap = null;
            let childLScore;

            if (childLIndex < length) {
                let childL = this.heap[childLIndex];
                childLScore = this.scoreFunc(childL);
                if (childLScore < elemScore) {
                    swap = childLIndex;
                }
            }

            if (childRIndex < length) {
                let childR = this.heap[childRIndex];
                var childRScore = this.scoreFunc(childR);
                if (childRScore < (swap === null ? elemScore : childLScore)) {
                    swap = childRIndex;
                }
            }

            if (swap !== null) {
                this.heap[index] = this.heap[swap];
                this.heap[swap] = element;
                index = swap;
            } else {
                break;
            }
        }
    }

    reset() {
        this.heap.length = 0;
    }
}

class DefaultWall implements tnt.pf.IWall {
    isWall(weight: number): boolean {
        return weight === 0;
    }
}

const tmp1_v2 = new Vec2();
export abstract class RouteGraph {
    public grid: tnt.pf.GridNode[][] = [];
    public calculatedWeight = false; // 是否计算权重
    public dirtyNodes: tnt.pf.GridNode[] = [];

    coordinateTransform: tnt.pf.ICoordinateTransform = null;

    public init(gridIn: number[][]) {
        this.grid = [];
        for (let x = 0; x < gridIn.length; x++) {
            this.grid[x] = [];
            let row = gridIn[x];
            if (row != null) {
                for (let y = 0; y < row.length; y++) {
                    let node = this.createGridNode(x, y, row[y]);
                    this.grid[x][y] = node;
                }
            }
        }
    }
    createGridNode(x: number, y: number, weight: number) {
        let node = new tnt.pf.GridNode(x, y, weight);
        if (this.coordinateTransform) {
            // let grid = new Vec2(node.x, node.y);
            let grid = tmp1_v2.set(node.x, node.y);
            let pixelPosition = this.coordinateTransform.gridToPixel(grid);
            node.pixelX = pixelPosition.x;
            node.pixelY = pixelPosition.y;

            let worldPosition = this.coordinateTransform.gridToWorld(grid);
            node.worldX = worldPosition.x;
            node.worldY = worldPosition.y;
        }
        return node;
    }
    abstract getNeighborsRound(gridNode: tnt.pf.GridNode): number[][];

    public neighbors(gridNode: tnt.pf.GridNode): tnt.pf.GridNode[] {
        let arr: tnt.pf.GridNode[] = [];
        let grid = this.grid;

        let round: number[][] = this.getNeighborsRound(gridNode);

        for (let i = 0; i < round.length; i++) {
            const x = round[i][0];
            const y = round[i][1];

            let _grid = grid[gridNode.x + x]?.[gridNode.y + y];
            if (_grid) {
                arr.push(_grid);
            }
        }

        return arr;
    }

    public getGridNode(pos: Vec2): tnt.pf.GridNode {
        let gridNode = null;
        if (this.grid[pos.x]) {
            gridNode = this.grid[pos.x][pos.y];
        }
        return gridNode;
    }

    public markDirty(gridNode: tnt.pf.GridNode): void {
        this.dirtyNodes.push(gridNode);
    }

    public cleanDirty(): void {
        for (let i = 0; i < this.dirtyNodes.length; i++) {
            const node = this.dirtyNodes[i];
            node.clear();
        }
        this.dirtyNodes.length = 0;
    }
}

export class AStarBinaryHeap implements tnt.pf.IPathFinder {

    constructor(public coordinateTransform: tnt.pf.ICoordinateTransform, public wall: tnt.pf.IWall, public graph: RouteGraph, gridIn: number[][]) {
        this.graph.coordinateTransform = coordinateTransform;
        this.graph.init(gridIn);
    }


    // public wall: tnt.pf.IWall = null;
    // public coordinateTransform: tnt.pf.ICoordinateTransform = null;
    // private graph: RouteGraph;

    // 曼哈顿距离
    public static manhattan(node1: tnt.pf.GridNode, node2: tnt.pf.GridNode) {
        var d1 = Math.abs(node2.x - node1.x);
        var d2 = Math.abs(node2.y - node1.y);
        return (d1 + d2);
    }

    // 六角距离
    public static hexagonal(node1: tnt.pf.GridNode, node2: tnt.pf.GridNode) {
        const distance = (Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y) + Math.abs(node1.x + node1.y - node2.x - node2.y)) / 2;
        return distance;
    }

    // 欧几里得距离
    public static euclidean(node1: tnt.pf.GridNode, node2: tnt.pf.GridNode) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**寻路
     * @param graph 寻路网格
     * @param start 起点
     * @param end 终点
     * @param [manhattan=null] 距离计算方法,默认曼哈顿距离
     */
    public search(start: Vec2, end: Vec2, manhattan: any = null): tnt.pf.GridNode[] {
        let graph = this.graph;
        graph.cleanDirty();
        let heuristic = manhattan || AStarBinaryHeap.manhattan;
        this.wall = this.wall || new DefaultWall();

        let openHeap = new BinaryHeap(function (gridNode: tnt.pf.GridNode) { return gridNode.f });
        let startNode = graph.getGridNode(start);
        let endNode = graph.getGridNode(end);

        if (startNode === endNode) {
            return [];
        }

        let currentNode;
        let findRoute = false;

        startNode.h = heuristic(startNode, endNode);
        graph.markDirty(startNode);
        openHeap.push(startNode);
        while (openHeap.size() > 0) {
            currentNode = openHeap.pop();
            if (currentNode === endNode) {
                findRoute = true;
                break;
            }

            currentNode.closed = true;
            let neighbors = graph.neighbors(currentNode);
            for (let i = 0, len = neighbors.length; i < len; i++) {
                let neighbor = neighbors[i];
                if (neighbor.closed || neighbor.isWall(this.wall)) {
                    continue;
                }
                let gScore = currentNode.g + neighbor.getCost(currentNode, graph.calculatedWeight);
                let beenVisited = neighbor.visited;
                if (!beenVisited || gScore < neighbor.g) {
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor, end);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    graph.markDirty(neighbor);
                    if (!beenVisited) {
                        openHeap.push(neighbor);
                    } else {
                        openHeap.rescore(neighbor);
                    }
                }
            }
        }

        return findRoute ? this.pathTo(currentNode) : [];
    }

    // /**创建寻路网格
    //  * @param gridIn 网格坐标组,权重0表示墙
    //  * @param [diagonal=false] 是否启用8向,默认4向
    //  */
    // public createRouteGraph(gridIn: number[][], diagonal: boolean = false): RouteGraph {
    //     let graph = new RouteGraph();
    //     graph.coordinateTransform = this.coordinateTransform;
    //     graph.init(gridIn, diagonal);
    //     this.graph = graph;
    //     return graph;
    // }

    /**
     * 更新寻路网格
     *
     * @param {RouteGraph} graph
     * @param {number[][]} gridIn
     * @memberof AStarBinaryHeap
     */
    public updateRouteGraph(graph: RouteGraph, gridIn: number[][]) {
        this.graph = graph;
        this.graph.coordinateTransform = this.coordinateTransform;
        this.graph.init(gridIn);
    }

    private pathTo(gridNode: tnt.pf.GridNode): tnt.pf.GridNode[] {
        let currentNode = gridNode;
        let path: tnt.pf.GridNode[] = [];
        while (currentNode.parent) {
            path.unshift(currentNode);
            currentNode = currentNode.parent;
        }
        return path;
    }

    createGridNode(x: number, y: number, weight: number) {

        return this.graph.createGridNode(x, y, weight);
    }

}

declare global {
    interface IPathFinding {
        RouteGraph: typeof RouteGraph;
        AStarBinaryHeap: typeof AStarBinaryHeap;
    }

    namespace tnt {
        namespace pf {
            type AStarBinaryHeap = InstanceType<typeof AStarBinaryHeap>;
            type RouteGraph = InstanceType<typeof RouteGraph>;
        }
    }
}
tnt.pf.RouteGraph = RouteGraph;
tnt.pf.AStarBinaryHeap = AStarBinaryHeap;