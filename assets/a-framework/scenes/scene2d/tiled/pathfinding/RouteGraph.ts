import { RouteGraph } from "./AStarBinaryHeap";
import { getHexagonalNeighborsRound, getNormalNeighborsRound, getStaggeredNeighborsRound } from "./NeighborsDirections";

class RouteGraphHexagonal extends RouteGraph {
    staggerX: boolean = false;
    staggerEven: boolean = false;
    constructor(staggerX: boolean, staggerEven: boolean) {
        super();
        this.staggerX = staggerX;
        this.staggerEven = staggerEven;

    }

    getNeighborsRound(gridNode: tnt.pf.GridNode): number[][] {
        return getHexagonalNeighborsRound(gridNode, this.staggerX, this.staggerEven);
    }

}

/** 六角地图模拟45度交错地图 */
class RouteGraphStaggered extends RouteGraph {
    staggerX: boolean = false;
    staggerEven: boolean = false;
    constructor(staggerX: boolean, staggerEven: boolean) {
        super();
        this.staggerX = staggerX;
        this.staggerEven = staggerEven;
    }

    getNeighborsRound(gridNode: tnt.pf.GridNode): number[][] {
        return getStaggeredNeighborsRound(gridNode, this.staggerX, this.staggerEven);
    }

}

class RouteGraphNormal extends RouteGraph {
    diagonal: boolean = false;
    constructor(diagonal: boolean) {
        super();
        this.diagonal = diagonal
        this.calculatedWeight = !diagonal;
    }

    getNeighborsRound(gridNode: tnt.pf.GridNode): number[][] {
        return getNormalNeighborsRound(this.diagonal);
    }

}



declare global {
    interface IPathFinding {
        RouteGraphHexagonal: typeof RouteGraphHexagonal;
        RouteGraphStaggered: typeof RouteGraphStaggered;
        RouteGraphNormal: typeof RouteGraphNormal;
    }

    namespace tnt {
        namespace pf {
            type RouteGraphHexagonal = InstanceType<typeof RouteGraphHexagonal>;
            type RouteGraphStaggered = InstanceType<typeof RouteGraphStaggered>;
            type RouteGraphNormal = InstanceType<typeof RouteGraphNormal>;
        }
    }
}


tnt.pf.RouteGraphHexagonal = RouteGraphHexagonal;
tnt.pf.RouteGraphStaggered = RouteGraphStaggered;
tnt.pf.RouteGraphNormal = RouteGraphNormal;

export { };