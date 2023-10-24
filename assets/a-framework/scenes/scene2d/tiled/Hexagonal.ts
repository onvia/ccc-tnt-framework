
import { _decorator, TiledMap, Vec2, Size, Rect } from 'cc';
const { ccclass } = _decorator;

/**
 * 说明：Cocos Creator 3.7.2（当前最高版本） 以及之前的版本 六角交错地图宽高计算有误，图层渲染有误，
 * 本代码中的计算方法正确，如果出现错误，请检查地图是否进行特殊处理，
 * 特殊处理：
 *      栅格轴方向：X  栅格类型：奇数  向上移动半个图块高度
 *      栅格轴方向：Y  栅格类型：偶数  向右移动半个图块宽度
 *      
 */


declare global {

    interface ITmx {
        Hexagonal: typeof Hexagonal;
    }

    namespace tnt {
        namespace tmx {
            type Hexagonal = InstanceType<typeof Hexagonal>;
        }
    }
}

class HexParams {
    tileWidth: number = 0;
    tileHeight: number = 0;
    sideLengthX: number = 0;
    sideLengthY: number = 0;
    sideOffsetX: number = 0;
    sideOffsetY: number = 0;
    staggerX: boolean = false;
    staggerEven: boolean = false;
    columnWidth: number = 0;
    rowHeight: number = 0;

    initWithTiledMap(tiledMap: TiledMap) {
        let tileSize = tiledMap.getTileSize();
        this.tileWidth = tileSize.width & ~1;
        this.tileHeight = tileSize.height & ~1;
        this.staggerX = tiledMap._mapInfo.getStaggerAxis() === 0;
        this.staggerEven = tiledMap._mapInfo.getStaggerIndex() === 1;

        if (tiledMap._mapInfo.orientation === 1) {
            if (this.staggerX) {
                this.sideLengthX = tiledMap._mapInfo.getHexSideLength();
            }
            else {
                this.sideLengthY = tiledMap._mapInfo.getHexSideLength();
            }
        }

        this.sideOffsetX = (this.tileWidth - this.sideLengthX) / 2;
        this.sideOffsetY = (this.tileHeight - this.sideLengthY) / 2;

        this.columnWidth = this.sideOffsetX + this.sideLengthX;
        this.rowHeight = this.sideOffsetY + this.sideLengthY;
    }

    doStaggerX(x: number) {
        return this.staggerX && (x & 1) ^ (this.staggerEven ? 1 : 0);
    }

    doStaggerY(y: number) {
        return !this.staggerX && (y & 1) ^ (this.staggerEven ? 1 : 0);
    }
}

const offsetsStaggerX = [new Vec2(0, 0), new Vec2(1, -1), new Vec2(1, 0), new Vec2(2, 0)];
const offsetsStaggerY = [new Vec2(0, 0), new Vec2(-1, 1), new Vec2(0, 1), new Vec2(0, 2)];

@ccclass('Hexagonal')
class Hexagonal extends tnt.tmx.OrientationAdapter {

    tiledMap: TiledMap = null;
    tileSize: Readonly<Size> = null;
    mapSize: Readonly<Size> = null;
    mapSizeInPixel: Readonly<Size> = null;

    hexParams: HexParams = null;

    init() {
        this.hexParams = new HexParams();
        this.hexParams.initWithTiledMap(this.tiledMap);
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


        // 参考 https://github.com/mapeditor/tiled/blob/master/src/libtiled/hexagonalrenderer.cpp
        let p = this.hexParams;
        if (p.staggerX) {
            x -= p.staggerEven ? p.tileWidth : p.sideOffsetX;
        }
        else {
            y -= p.staggerEven ? p.tileHeight : p.sideOffsetY;
        }

        // Start with the coordinates of a grid-aligned tile
        let referencePoint = new Vec2(
            Math.floor(x / (p.columnWidth * 2)),
            Math.floor(y / (p.rowHeight * 2))
        );

        // Relative x and y position on the base square of the grid-aligned tile
        const rel = new Vec2(
            x - referencePoint.x * (p.columnWidth * 2),
            y - referencePoint.y * (p.rowHeight * 2));

        // Adjust the reference point to the correct tile coordinates
        let staggerAxisIndex = p.staggerX ? referencePoint.x : referencePoint.y;
        staggerAxisIndex *= 2;
        if (p.staggerEven) {
            ++staggerAxisIndex;
        }
        if (p.staggerX) {
            referencePoint.x = staggerAxisIndex;
        } else {
            referencePoint.y = staggerAxisIndex;
        }
        // p.staggerX ? referencePoint.x : referencePoint.y = staggerAxisIndex;

        // Determine the nearest hexagon tile by the distance to the center
        let centers: Vec2[] = new Array(4);

        if (p.staggerX) {
            const left = p.sideLengthX / 2;
            const centerX = left + p.columnWidth;
            const centerY = p.tileHeight / 2;

            centers[0] = new Vec2(left, centerY);
            centers[1] = new Vec2(centerX, centerY - p.rowHeight);
            centers[2] = new Vec2(centerX, centerY + p.rowHeight);
            centers[3] = new Vec2(centerX + p.columnWidth, centerY);
        } else {
            const top = p.sideLengthY / 2;
            const centerX = p.tileWidth / 2;
            const centerY = top + p.rowHeight;

            centers[0] = new Vec2(centerX, top);
            centers[1] = new Vec2(centerX - p.columnWidth, centerY);
            centers[2] = new Vec2(centerX + p.columnWidth, centerY);
            centers[3] = new Vec2(centerX, centerY + p.rowHeight);
        }

        let nearest = 0;
        let minDist = Number.MAX_SAFE_INTEGER;

        for (let i = 0; i < 4; ++i) {
            const center = centers[i];
            const dc = center.subtract(rel).lengthSqr();
            if (dc < minDist) {
                minDist = dc;
                nearest = i;
            }
        }

        const offsets = p.staggerX ? offsetsStaggerX : offsetsStaggerY;

        return referencePoint.add(offsets[nearest]);
    }

    tileToPixelCoords(position: Vec2): Vec2;
    tileToPixelCoords(x: number, y: number): Vec2;
    tileToPixelCoords(xOrPos: number | Vec2, y?: number): Vec2;
    tileToPixelCoords(xOrPos: number | Vec2, y?: number): Vec2 {

        this._checkAnchor();

        let x = 0;
        if (typeof y === 'undefined') {
            let pos = (xOrPos as Vec2);
            x = pos.x;
            y = pos.y;
        } else {
            x = xOrPos as number;
        }

        let p = this.hexParams;

        // TiledMap 编辑器 算法
        // 参考 https://github.com/mapeditor/tiled/blob/master/src/libtiled/hexagonalrenderer.cpp
        const tileX = Math.floor(x);
        const tileY = Math.floor(y);
        let pixelX, pixelY;

        if (p.staggerX) {
            pixelY = tileY * (p.tileHeight + p.sideLengthY);
            if (p.doStaggerX(tileX)) {
                pixelY += p.rowHeight;
            }
            pixelX = tileX * p.columnWidth;

            // // 转换坐标系 从左上角坐标系转为左下角坐标系     
            pixelY = this.mapSizeInPixel.height - pixelY - p.tileHeight;

        } else {
            pixelX = tileX * (p.tileWidth + p.sideLengthX);
            if (p.doStaggerY(tileY)) {
                pixelX += p.columnWidth;
            }
            pixelY = tileY * p.rowHeight;

            // // 转换坐标系 从左上角坐标系转为左下角坐标系     
            pixelY = this.mapSizeInPixel.height - (pixelY + p.tileHeight) + Math.floor(p.sideLengthY / 2) + Math.floor((p.tileHeight - p.sideLengthY) / 2) - Math.floor(p.tileHeight / 2);
        }

        return new Vec2(pixelX, pixelY);
    }
    public boundingRect(x: number, y: number, width: number, height: number): Rect {
        let p = this.hexParams;
        let topLeft = this.tileToPixelCoords(x, y);
        let _width: number;
        let _height: number;

        if (p.staggerX) {
            _width = width * p.columnWidth + p.sideOffsetX;
            _height = height * (p.tileHeight + p.sideLengthY);

            if (width > 1) {
                height += p.rowHeight;
                if (p.doStaggerX(x)) {
                    topLeft.y -= p.rowHeight;
                }
            }
        } else {
            _width = width * (p.tileWidth + p.sideLengthX);
            _height = height * p.rowHeight + p.sideOffsetY;

            if (height > 1) {
                width += p.columnWidth;
                if (p.doStaggerY(y)) {
                    topLeft.x -= p.columnWidth;
                }
            }
        }
        return new Rect(topLeft.x, topLeft.y, _width, _height);
    }
    tileToScreenPolygon(x: number, y: number) {
        let p = this.hexParams;
        let topRight = this.tileToPixelCoords(x, y);
        let polygon: Vec2[] = [];
        for (let i = 0; i < 8; i++) {
            polygon[i] = new Vec2();
        }
        polygon[0] = Vec2.add(polygon[0], topRight, new Vec2(0, p.tileHeight - p.sideOffsetY));
        polygon[1] = Vec2.add(polygon[1], topRight, new Vec2(0, p.sideOffsetY));
        polygon[2] = Vec2.add(polygon[2], topRight, new Vec2(p.sideOffsetX, 0));
        polygon[3] = Vec2.add(polygon[3], topRight, new Vec2(p.tileWidth - p.sideOffsetX, 0));
        polygon[4] = Vec2.add(polygon[4], topRight, new Vec2(p.tileWidth, p.sideOffsetY));
        polygon[5] = Vec2.add(polygon[5], topRight, new Vec2(p.tileWidth, p.tileHeight - p.sideOffsetY));
        polygon[6] = Vec2.add(polygon[6], topRight, new Vec2(p.tileWidth - p.sideOffsetX, p.tileHeight));
        polygon[7] = Vec2.add(polygon[7], topRight, new Vec2(p.sideOffsetX, p.tileHeight));

        return polygon;
    }
}
tnt.tmx.Hexagonal = Hexagonal; 
export { };