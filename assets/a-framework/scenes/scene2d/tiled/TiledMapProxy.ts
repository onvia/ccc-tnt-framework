
import { _decorator, Node, TiledMap, Size, Vec2, IVec2Like, TiledLayer, Rect } from 'cc';
import { IOrientation } from './_InterfaceTiledMap';
const { ccclass } = _decorator;


declare global {

    interface ITmx {
        TiledMapProxy: typeof TiledMapProxy;

    }

    namespace tnt {
        namespace tmx {
            type TiledMapProxy = InstanceType<typeof TiledMapProxy>;
            interface MapInfo {
                orientation: number,
                tileSize: Size,
                mapSize: Size,

                staggerAxis: number,
                staggerIndex: number,
                hexSideLength: number,
            }
        }
    }

}
const weakMap = new WeakMap<Node, TiledMapProxy>();

@ccclass('TiledMapProxy')
class TiledMapProxy implements IOrientation {
    tileSize: Readonly<Size> = null; //瓷砖的大小 
    mapSize: Readonly<Size> = null; //
    mapSizeInPixel: Readonly<Size> = null;
    mapInfo: tnt.tmx.MapInfo = null;
    mapRoot: Node = null;
    static create(mapRoot: Node, mapInfo: tnt.tmx.MapInfo) {

        let tiledMapProxy: TiledMapProxy = null;
        if (weakMap.has(mapRoot)) {
            tiledMapProxy = weakMap.get(mapRoot);
        } else {
            tiledMapProxy = new TiledMapProxy();
            weakMap.set(mapRoot, tiledMapProxy);
        }
        tiledMapProxy.onCtor(mapRoot, mapInfo);
        return tiledMapProxy;
    }

    private _orientationAdapter: tnt.tmx.OrientationAdapter = null;
    public get orientationAdapter(): tnt.tmx.OrientationAdapter {
        return this._orientationAdapter;
    }


    private onCtor(mapRoot: Node, mapInfo: tnt.tmx.MapInfo) {

        this.mapInfo = mapInfo;
        this.mapRoot = mapRoot;
        this.tileSize = mapInfo.tileSize;
        this.mapSize = mapInfo.mapSize;


        let orientation = mapInfo.orientation;

        switch (orientation) {
            case 0: // ORTHO
                this._orientationAdapter = new tnt.tmx.Orthogonal();
                break;
            case 1: // HEX
                this._orientationAdapter = new tnt.tmx.Hexagonal();
                break;
            case 2: // ISO
                this._orientationAdapter = new tnt.tmx.Isometric();
                break;

            default:
                break;
        }

        this.computeMapSizeInPixel();
        if (this._orientationAdapter) {
            this._orientationAdapter.mapInfo = this.mapInfo;
            this._orientationAdapter.mapRoot = this.mapRoot;
            this._orientationAdapter.tileSize = this.tileSize;
            this._orientationAdapter.mapSize = this.mapSize;
            this._orientationAdapter.mapSizeInPixel = this.mapSizeInPixel;
            this._orientationAdapter.init();
        }
    }
    init(): void {

    }

    private computeMapSizeInPixel() {
        let orientation = this.mapInfo.orientation;
        let widthPixel = 0;
        let heightPixel = 0;
        let offset = 0;
        switch (orientation) {
            case 0: //ORTHO
                {
                    widthPixel = this.tileSize.width * this.mapSize.width;
                    heightPixel = this.tileSize.height * this.mapSize.height;
                }
                break;
            case 1: // HEX
                {
                    let staggerAxis = this.mapInfo.staggerAxis;
                    let sideLength = this.mapInfo.hexSideLength;

                    switch (staggerAxis) {
                        case 1: // StaggerAxis.STAGGERAXIS_Y
                            offset = Math.floor((this.tileSize.height - sideLength) / 2);
                            widthPixel = this.tileSize.width * this.mapSize.width + Math.floor(this.tileSize.width / 2);
                            heightPixel = (this.tileSize.height - offset) * this.mapSize.height + offset;
                            break;
                        case 0: // StaggerAxis.STAGGERAXIS_X
                            offset = Math.floor((this.tileSize.width - sideLength) / 2);
                            widthPixel = (this.tileSize.width - offset) * this.mapSize.width + offset;
                            heightPixel = this.tileSize.height * this.mapSize.height + Math.floor(this.tileSize.height / 2);
                            break;
                    }
                }
                break;
            case 2: //ISO
                const wh = this.mapSize.width + this.mapSize.height;
                widthPixel = this.tileSize.width * 0.5 * wh;
                heightPixel = this.tileSize.height * 0.5 * wh;
                break;

            default:
                break;
        }


        this.mapSizeInPixel = new Size(widthPixel, heightPixel);
    }

    pixelToTileCoords(position: Vec2): Vec2
    pixelToTileCoords(x: number, y: number): Vec2
    pixelToTileCoords(xOrPos: number | Vec2, y?: number | IVec2Like): Vec2
    pixelToTileCoords(xOrPos: any, y?: any): Vec2 {
        return this.orientationAdapter.pixelToTileCoords(xOrPos, y);
    }

    worldToTileCoords(position: Vec2): Vec2
    worldToTileCoords(x: number, y: number): Vec2
    worldToTileCoords(xOrPos: number | Vec2, y?: number): Vec2 {
        return this.orientationAdapter.worldToTileCoords(xOrPos, y);
    }

    tileToPixelCoords(position: Vec2): Vec2
    tileToPixelCoords(position: Vec2, anchor: IVec2Like): Vec2
    tileToPixelCoords(x: number, y: number): Vec2
    tileToPixelCoords(x: number, y: number, anchor: IVec2Like): Vec2
    tileToPixelCoords(xOrPos: number | Vec2, y?: number | IVec2Like, anchor?: IVec2Like): Vec2
    tileToPixelCoords(xOrPos: any, y?: any, anchor?: any): Vec2 {

        if (typeof y !== 'undefined' && typeof y !== 'number') {
            anchor = y;
            y = undefined;
        }
        let position = this.orientationAdapter.tileToPixelCoords(xOrPos, y);

        if (anchor) {
            position.x += anchor.x * this.tileSize.width;
            position.y += anchor.y * this.tileSize.height;
        }
        return position;
    }

    tileToWorldCoords(position: Vec2): Vec2
    tileToWorldCoords(position: Vec2, anchor: IVec2Like): Vec2
    tileToWorldCoords(x: number, y: number): Vec2
    tileToWorldCoords(x: number, y: number, anchor: IVec2Like): Vec2
    tileToWorldCoords(xOrPos: number | Vec2, y?: number | IVec2Like, anchor?: IVec2Like): Vec2
    tileToWorldCoords(xOrPos: any, y?: any, anchor?: any): Vec2 {
        if (typeof y !== 'undefined' && typeof y !== 'number') {
            anchor = y;
            y = undefined;
        }
        let position = this.orientationAdapter.tileToWorldCoords(xOrPos, y);

        if (anchor) {
            position.x += anchor.x * this.tileSize.width;
            position.y += anchor.y * this.tileSize.height;
        }
        return position;
    }

    hitTest(worldPos: Vec2): boolean {
        return this.orientationAdapter.hitTest(worldPos);
    }

    isSafe(position: Vec2): boolean;
    isSafe(x: number, y: number): boolean;
    isSafe(xOrPos: number | Vec2, y?: number): boolean;
    isSafe(xOrPos: number | Vec2, y?: number): boolean {
        return this.orientationAdapter.isSafe(xOrPos, y);
    }

    //遍历图层的图块
    forEachTiles(layer: TiledLayer | string, callback: (gid: number, x: number, y: number) => void) {
        this.orientationAdapter.forEachTiles(layer, callback);
    }

    /**
     * 根据位置获取 index
     *
     * @param {Vec2} position
     * @return {*}  {number}
     * @memberof TiledMapProxy
     */
    tileCoordsToIndex(position: Vec2): number;
    tileCoordsToIndex(x: number, y: number): number;
    tileCoordsToIndex(xOrPos: number | Vec2, y?: number): number;
    tileCoordsToIndex(xOrPos: number | Vec2, y?: number): number {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }
        let mapSize = this.mapSize;
        let idx = Math.floor(x) + Math.floor(y) * mapSize.width;
        return idx;
    }

    /**
     * 根据 index 获取位置
     *
     * @param {number} index
     * @return {*} 
     * @memberof TiledMapProxy
     */
    indexToTileCoords(index: number) {
        let mapSize = this.mapSize;
        let x = index % mapSize.width;
        let y = Math.floor(index / mapSize.width);
        return new Vec2(x, y);
    }

    /**
     * 查询洪水填充区域
     *
     * @param {Vec2} origin 
     * @param {(x: number, y: number) => boolean} match
     * @return {*} 
     * @memberof TiledMapProxy
     */
    queryFloodFillRegion(origin: Vec2, match: (x: number, y: number) => boolean) {
        return this._queryFloodFillRegion(origin, match);
    }

    /**
     * 执行洪水填充处理
     *
     * @param {Vec2} origin 
     * @param {(x: number, y: number) => boolean} match
     * @param {(x: number, y: number) => Promise<void>} [handle]
     * @return {*} 
     * @memberof TiledMapProxy
     */
    performFloodFillRegion(origin: Vec2, match: (x: number, y: number) => boolean, handle: (x: number, y: number) => void) {
        this._queryFloodFillRegion(origin, match, handle);
    }

    /**
     * 查询洪水填充区域
     *
     * @param {Vec2} origin 
     * @param {(x: number, y: number) => boolean} match
     * @param {(x: number, y: number) => Promise<void>} [handle]
     * @return {*} 
     * @memberof TiledMapProxy
     */
    private _queryFloodFillRegion(origin: Vec2, match: (x: number, y: number) => boolean, handle?: (x: number, y: number) => void) {
        const queryTiles: Vec2[] = [];
        let _match = (x: number, y: number) => {
            return this.isSafe(x, y) && match(x, y);
        }
        if (!_match(origin.x, origin.y)) {
            return queryTiles;
        }
        const queryIds: Set<number> = new Set();
        const mapSize = this.mapInfo.mapSize;
        const width: number = mapSize.width;
        const height: number = mapSize.height;
        const indexOffset: number = 0;
        let isStaggered = this.mapInfo.orientation == 1; // 是否是交错地图
        // Create a queue to hold cells that need filling
        const fillPositions: Vec2[] = [origin];
        // Create an array that will store which cells have been processed
        // This is faster than checking if a given cell is in the region/list
        const processedCells: boolean[] = Array.from({ length: width * height }, () => false);


        // Loop through queued positions and fill them, while at the same time
        // checking adjacent positions to see if they should be added
        while (fillPositions.length > 0) {
            const currentPoint = fillPositions.shift();
            const startOfLine: number = currentPoint.y * width;
            // Seek as far left as we can
            let left: number = currentPoint.x;
            while (left > 0 && _match(left - 1, currentPoint.y)) {
                --left;
                processedCells[indexOffset + startOfLine + left] = true;
            }
            // Seek as far right as we can
            let right: number = currentPoint.x;
            while (right < width && _match(right + 1, currentPoint.y)) {
                ++right;
                processedCells[indexOffset + startOfLine + right] = true;
            }

            // // Add cells between left and right to the region
            // fillRegion += new QRegion(left, currentPoint.y, right - left + 1, 1);
            // let rect = new Rect(left, currentPoint.y, right - left + 1, 1);
            // console.log(`TiledMapProxy-> `, JSON.stringify(rect));


            let startX = left;
            let endX = right + 1;
            const y = currentPoint.y;

            for (let x = startX; x < endX; x++) {
                const idx = x + y * width;

                if (!queryIds.has(idx)) {
                    queryIds.add(idx);
                    if (!!handle) {
                        handle(x, y);
                    } else {
                        queryTiles.push(new Vec2(x, y));
                    }
                }
            }


            let leftColumnIsStaggered: boolean = false;
            let rightColumnIsStaggered: boolean = false;

            const StaggerX = 0;
            const StaggerY = 1;
            let staggerAxis = this.mapInfo.staggerAxis;
            let staggerIndex = this.mapInfo.staggerIndex;
            // For hexagonal maps with a staggered Y-axis, we may need to extend the search range
            if (isStaggered) {
                if (staggerAxis === StaggerY) {
                    const rowIsStaggered: boolean = !!((currentPoint.y & 1) ^ staggerIndex);
                    if (rowIsStaggered) {
                        right = Math.min(right + 1, width);
                    } else {
                        left = Math.max(left - 1, 0);
                    }
                } else {
                    leftColumnIsStaggered = !!(((left) & 1) ^ staggerIndex);
                    rightColumnIsStaggered = !!(((right) & 1) ^ staggerIndex);
                }
            }


            // Loop between left and right and check if cells above or below need
            // to be added to the queue.
            const findFillPositions = (left: number, right: number, y: number) => {
                let adjacentCellAdded: boolean = false;

                for (let x = left; x <= right; ++x) {
                    const index: number = y * width + x;
                    if (!processedCells[indexOffset + index] && _match(x, y)) {
                        // Do not add the cell to the queue if an adjacent cell was added.
                        if (!adjacentCellAdded) {
                            fillPositions.push(new Vec2(x, y));
                            adjacentCellAdded = true;
                        }
                    } else {
                        adjacentCellAdded = false;
                    }
                    processedCells[indexOffset + index] = true;
                }
            };

            if (currentPoint.y > 0) {
                let _left: number = left;
                let _right: number = right;
                if (isStaggered && staggerAxis === StaggerX) {
                    if (!leftColumnIsStaggered) {
                        _left = Math.max(left - 1, 0);
                    }
                    if (!rightColumnIsStaggered) {
                        _right = Math.min(right + 1, width);
                    }
                }

                findFillPositions(_left, _right, currentPoint.y - 1);
            }

            if (currentPoint.y < height) {
                let _left: number = left;
                let _right: number = right;

                if (isStaggered && staggerAxis === StaggerX) {
                    if (leftColumnIsStaggered) {
                        _left = Math.max(left - 1, 0);
                    }
                    if (rightColumnIsStaggered) {
                        _right = Math.min(right + 1, width);
                    }
                }

                findFillPositions(_left, _right, currentPoint.y + 1);
            }
        }
        return queryTiles;
    }

    public boundingRect(x: number, y: number, width: number, height: number): Rect {
        return this.orientationAdapter.boundingRect(x, y, width, height);
    }
}

tnt.tmx.TiledMapProxy = TiledMapProxy;

export { };