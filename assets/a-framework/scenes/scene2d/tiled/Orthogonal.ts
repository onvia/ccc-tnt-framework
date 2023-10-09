
import { Vec2, _decorator, } from 'cc';
const { ccclass, property } = _decorator;


declare global {

    interface ITmx {
        Orthogonal: typeof Orthogonal;
    }

    namespace tnt {
        namespace tmx {
            type Orthogonal = InstanceType<typeof Orthogonal>;
        }
    }
}

@ccclass('Orthogonal')
class Orthogonal extends tnt.tmx.OrientationAdapter {
    init(): void {
    }

    pixelToTileCoords(position: Vec2): Vec2;
    pixelToTileCoords(x: number, y: number): Vec2;
    pixelToTileCoords(xOrPos: number | Vec2, y?: number): Vec2;
    pixelToTileCoords(xOrPos: number | Vec2, y?: number): Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }

        this._checkAnchor();

        // 从左下角转为左上角
        y = this.mapSizeInPixel.height - y;

        let tiledX = Math.floor(x / this.tileSize.width);
        let tiledY = Math.floor(y / this.tileSize.height);

        return new Vec2(tiledX, tiledY);
    }
    tileToPixelCoords(position: Vec2): Vec2;
    tileToPixelCoords(x: number, y: number): Vec2;
    tileToPixelCoords(xOrPos: number | Vec2, y?: number): Vec2;
    tileToPixelCoords(xOrPos: number | Vec2, y?: number): Vec2 {
        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }

        this._checkAnchor();

        let pixelX = x * this.tileSize.width;
        let pixelY = y * this.tileSize.height;
        // 转为左下角
        pixelY = this.mapSizeInPixel.height - pixelY - this.tileSize.height;

        return new Vec2(pixelX, pixelY);
    }

}

tnt.tmx.Orthogonal = Orthogonal;

export { };