
import { _decorator, TiledMap, math, UITransform, TiledLayer } from 'cc';
import { IOrientation } from './_InterfaceTiledMap';
const { ccclass, property } = _decorator;


declare global {

    interface ITiled {
        OrientationAdapter: typeof OrientationAdapter;
    }

    namespace tnt {
        namespace tiled {
            type OrientationAdapter = InstanceType<typeof OrientationAdapter>;
        }
    }
}


let tmp1_v3 = new math.Vec3();
@ccclass('OrientationAdapter')
abstract class OrientationAdapter implements IOrientation {
    public tiledMap: TiledMap;
    public tileSize: Readonly<math.Size>;
    public mapSize: Readonly<math.Size>;
    public mapSizeInPixel: Readonly<math.Size>;

    private _isCheckPassed = false;
    init(): void {

    }

    public abstract pixelToTileCoords(position: math.Vec2): math.Vec2
    public abstract pixelToTileCoords(x: number, y: number): math.Vec2
    public abstract pixelToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;


    public abstract tileToPixelCoords(position: math.Vec2): math.Vec2
    public abstract tileToPixelCoords(x: number, y: number): math.Vec2
    public abstract tileToPixelCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;



    public worldToTileCoords(position: math.Vec2): math.Vec2;
    public worldToTileCoords(x: number, y: number): math.Vec2;
    public worldToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2
    public worldToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as math.Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }

        let uiTransform = this.tiledMap.node.getComponent(UITransform);
        tmp1_v3.set(x, y);
        let localPos = uiTransform.convertToNodeSpaceAR(tmp1_v3, tmp1_v3);

        return this.pixelToTileCoords(localPos.x, localPos.y);
    }

    public tileToWorldCoords(position: math.Vec2): math.Vec2;
    public tileToWorldCoords(x: number, y: number): math.Vec2;
    public tileToWorldCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;
    public tileToWorldCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as math.Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }
        let position = this.tileToPixelCoords(x, y);
        let uiTransform = this.tiledMap.node.getComponent(UITransform);
        tmp1_v3.set(position.x, position.y);
        let worldPos = uiTransform.convertToWorldSpaceAR(tmp1_v3, tmp1_v3);
        return new math.Vec2(worldPos.x, worldPos.y);
    }


    public hitTest(worldPos: math.Vec2): boolean {

        let uiTransform = this.tiledMap.node.getComponent(UITransform);
        tmp1_v3.set(worldPos.x, worldPos.y);
        let localPos = uiTransform.convertToNodeSpaceAR(tmp1_v3, tmp1_v3);


        let boxRect = uiTransform.getBoundingBoxToWorld();
        if (boxRect.contains(worldPos)) {
            let pos = this.pixelToTileCoords(localPos.x, localPos.y);
            return this.isSafe(pos);
        }
        return false;
    }

    public isSafe(tiledCoords: math.Vec2): boolean {
        return tiledCoords.x >= 0 && tiledCoords.y >= 0 && tiledCoords.x < this.mapSize.width && tiledCoords.y < this.mapSize.height;
    }


    //遍历图层的图块
    public forEachTiles(layer: TiledLayer | string, callback: (gid: number, x: number, y: number) => void) {
        if (typeof layer == "string") {
            layer = this.tiledMap.getLayer(layer);
        }
        for (let i = 0; i < this.mapSize.width; i++) {
            for (let j = 0; j < this.mapSize.height; j++) {
                let gid = layer.getTileGIDAt(i, j);
                callback(gid, i, j);
            }
        }
    }

    protected _checkAnchor() {
        if (this._isCheckPassed) {
            return;
        }
        let uiTransform = this.tiledMap.node.getComponent(UITransform);
        if (uiTransform.anchorX != 0 && uiTransform.anchorY != 0) {
            throw new Error("TiledMap 地图暂时只支持 锚点为 0,0 的坐标转换，请设置 TiledMap 节点的锚点为 0,0");
        }
        this._isCheckPassed = true;
    }
}

tnt.tiled.OrientationAdapter = OrientationAdapter;
export { };