
import { _decorator, math, UITransform } from 'cc';

const { ccclass, property } = _decorator;

declare global {

    interface ITiled {
        Isometric: typeof Isometric;
    }

    namespace tnt {
        namespace tiled {
            type Isometric = InstanceType<typeof Isometric>;
        }
    }
}


@ccclass('Isometric')
class Isometric extends tnt.tiled.OrientationAdapter {
    init(): void {
    }

    pixelToTileCoords(position: math.Vec2): math.Vec2;
    pixelToTileCoords(x: number, y: number): math.Vec2;
    pixelToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;
    pixelToTileCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as math.Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }


        this._checkAnchor();

        // 从左下角转为左上角
        y = this.mapSizeInPixel.height - y;


        // TiledMap 算法
        let tileWidth = this.tileSize.width;
        let tileHeight = this.tileSize.height;

        x -= this.mapSize.height * tileWidth / 2;
        const tileY = y / tileHeight;
        const tileX = x / tileWidth;

        return new math.Vec2(Math.floor(tileY + tileX), Math.floor(tileY - tileX));
    }
    tileToPixelCoords(position: math.Vec2): math.Vec2;
    tileToPixelCoords(x: number, y: number): math.Vec2;
    tileToPixelCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2;
    tileToPixelCoords(xOrPos: number | math.Vec2, y?: number): math.Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as math.Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }

        this._checkAnchor();

        // TiledMap 算法

        const tileWidth = this.tileSize.width;
        const tileHeight = this.tileSize.height;
        const originX = this.mapSize.height * tileWidth / 2;

        let pixelX = (x - y) * tileWidth / 2 + originX;
        let pixelY = (x + y) * tileHeight / 2;

        // // 转换坐标系 转为左下角坐标系
        pixelX = pixelX - tileWidth / 2;
        pixelY = this.mapSizeInPixel.height - pixelY - tileHeight;

        return new math.Vec2(pixelX, pixelY);
    }

}

tnt.tiled.Isometric = Isometric;

export { };