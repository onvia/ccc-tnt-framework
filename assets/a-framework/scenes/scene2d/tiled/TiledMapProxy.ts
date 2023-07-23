
import { _decorator, Node, TiledMap, Size, Vec2, IVec2Like, TiledLayer } from 'cc';
import { IOrientation } from './_InterfaceTiledMap';
const { ccclass } = _decorator;


declare global {

    interface ITiled {
        TiledMapProxy: typeof TiledMapProxy;
    }

    namespace tnt{
        namespace tiled {
            type TiledMapProxy = InstanceType<typeof TiledMapProxy>;
        }
    }
}

@ccclass('TiledMapProxy')
export class TiledMapProxy implements IOrientation {
    tiledMap: TiledMap = null;
    tileSize: Readonly<Size> = null; //瓷砖的大小 
    mapSize: Readonly<Size> = null; //
    mapSizeInPixel: Readonly<Size> = null;

    private _orientationAdapter: tnt.tiled.OrientationAdapter = null;
    public get orientationAdapter(): tnt.tiled.OrientationAdapter {
        return this._orientationAdapter;
    }

    constructor(map: TiledMap | Node) {
        if (map instanceof TiledMap) {
            this.tiledMap = map;
        } else if (map instanceof Node) {
            this.tiledMap = map.getComponent(TiledMap);
        }
        if (!this.tiledMap) {
            throw new Error("tiledMap is null");
        }
        this.tileSize = this.tiledMap.getTileSize();
        this.mapSize = this.tiledMap.getMapSize();


        let orientation = this.tiledMap.getMapOrientation();

        switch (orientation) {
            case 0: // ORTHO
                this._orientationAdapter = new tnt.tiled.Orthogonal();
                break;
            case 1: // HEX
                this._orientationAdapter = new tnt.tiled.Hexagonal();
                break;
            case 2: // ISO
                this._orientationAdapter = new tnt.tiled.Isometric();
                break;

            default:
                break;
        }

        this.computeMapSizeInPixel();
        if (this._orientationAdapter) {
            this._orientationAdapter.tiledMap = this.tiledMap;
            this._orientationAdapter.tileSize = this.tileSize;
            this._orientationAdapter.mapSize = this.mapSize;
            this._orientationAdapter.mapSizeInPixel = this.mapSizeInPixel;
            this._orientationAdapter.init();
        }
    }

    init(): void {

    }

    private computeMapSizeInPixel() {
        let orientation = this.tiledMap.getMapOrientation();
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
                    let staggerAxis = this.tiledMap._mapInfo.getStaggerAxis()
                    let sideLength = this.tiledMap._mapInfo.getHexSideLength();

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

    isSafe(tiledCoords: Vec2) {
        return this.orientationAdapter.isSafe(tiledCoords);
    }

    //遍历图层的图块
    forEachTiles(layer: TiledLayer | string, callback: (gid: number, x: number, y: number) => void) {
        this.orientationAdapter.forEachTiles(layer, callback);
    }

}

tnt.tiled.TiledMapProxy = TiledMapProxy;

export { };