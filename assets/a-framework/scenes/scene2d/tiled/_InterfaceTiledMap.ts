import { TiledMap, math, TiledLayer } from "cc";



export interface IOrientation {

    // tiledMap: TiledMap;
    tileSize: Readonly<math.Size>;
    mapSize: Readonly<math.Size>;
    mapSizeInPixel: Readonly<math.Size>;

    init(): void;

    pixelToTileCoords(position: math.Vec2): math.Vec2
    pixelToTileCoords(x: number, y: number): math.Vec2
    pixelToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;

    worldToTileCoords(position: math.Vec2): math.Vec2
    worldToTileCoords(x: number, y: number): math.Vec2
    worldToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;

    tileToPixelCoords(position: math.Vec2): math.Vec2
    tileToPixelCoords(x: number, y: number): math.Vec2
    tileToPixelCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;

    tileToWorldCoords(position: math.Vec2): math.Vec2
    tileToWorldCoords(x: number, y: number): math.Vec2
    tileToWorldCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;


    hitTest(worldPos: math.Vec2): boolean;

    /**
     * 判断图块坐标是否在地图内
     *
     * @param {math.Vec2} tiledCoords
     * @return {*}  {boolean}
     * @memberof IOrientation
     */
    isSafe(tiledCoords: math.Vec2): boolean;

    /**
     * 遍历图层的图块
     *
     * @param {(TiledLayer | string)} layer
     * @param {(gid: number,x: number,y: number) => void} callback
     * @memberof IOrientation
     */
    forEachTiles(layer: TiledLayer | string, callback: (gid: number, x: number, y: number) => void);

}
