import { _decorator, Node, Camera, TiledMap, TiledMapAsset, Vec3, UITransform, Color, color, Vec2, Toggle, Size, TiledLayer, director, Director, __private, Rect } from "cc";
import CameraController from "../../../a-framework/scenes/scene2d/tiled/controller/CameraController";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global {
    interface FloodFillDemoOptions {

    }
}

const FLIPPED_MASK = (~(0x80000000 | 0x40000000 | 0x20000000 | 0x10000000)) >>> 0;
// @ts-ignore
TiledLayer.prototype._updateTileForGID = function (gidAndFlags, x: number, y: number): void {
    const idx = 0 | (x + y * this._layerSize!.width);
    if (idx >= this.tiles.length) {
        return;
    }

    const oldGIDAndFlags = this.tiles[idx];
    if (gidAndFlags === oldGIDAndFlags) {
        return;
    }

    const gid = (((gidAndFlags as unknown as number) & FLIPPED_MASK) >>> 0);
    const grid = this.texGrids!.get(gid as unknown);

    if (grid) {
        this.tiles[idx] = gidAndFlags;
        this._updateVertex(x, y);
    } else {
        this.tiles[idx] = 0 as unknown;
    }
    this._cullingDirty = true;
    // 下一帧更新
    director.once(Director.EVENT_BEFORE_COMMIT, () => {
        this.markForUpdateRenderData();
    });
}
function setAnchorPointZero(node: Node) {
    let uiTransform = node.getComponent(UITransform);
    uiTransform.setAnchorPoint(0, 0);
    node.position.set(0, 0, 0);
}

const tmp1_v2 = new Vec2();
const tmp2_v2 = new Vec2();
const tmp1_v3 = new Vec3();
const tmp2_v3 = new Vec3();
const HALF_v2 = new Vec2(0.5, 0.5);

enum MapType {
    Orthogonal,
    Isometric,
    HexagonXOdd, // 六角 X 奇数
    HexagonXEven, // 六角 X 偶数
    HexagonYOdd, // 六角 Y 奇数
    HexagonYEven, // 六角 Y 偶数
    StaggerXOdd,
    StaggerXEven,
    StaggerYOdd,
    StaggerYEven,

}

@ccclass('FloodFillDemo')
export class FloodFillDemo extends tnt.SceneBase<FloodFillDemoOptions> {

    debugGraphics: tnt.game.DebugGraphics = null;

    tiledMapProxy: tnt.tmx.TiledMapProxy = null;
    tiledMapGesture: tnt.tmx.TiledMapGesture = null;

    gameCamera: Camera = null;
    tiledMap: TiledMap = null;
    cameraController: CameraController = null;

    worldCoord = "0,0";
    tiledCoord = "0,0";
    screenCoord = "0,0";
    mapType: MapType = null;

    onEnterTransitionStart(sceneName?: string): void {
        this.initGUI();

        this.gameCamera = tnt.componentUtils.findComponent("Camera", Camera, this.scene);

        this.tiledMap = tnt.componentUtils.findComponent("map", TiledMap, this.scene);

        this.updateMap(MapType.Orthogonal, true);
    }
    onExitTransitionStart(sceneName?: string): void {
        // 关闭手势
        this.tiledMapGesture.disable();
        tnt.gui.destroy();
    }

    onInit() {

        // 使用了摄像机需要把自动裁剪关闭
        this.tiledMap.enableCulling = false;
        this.tiledMapProxy = tnt.tmx.TiledMapProxy.create(this.tiledMap.node, {
            orientation: this.tiledMap._mapInfo.getOrientation(),
            tileSize: this.tiledMap.getTileSize(),
            mapSize: this.tiledMap.getMapSize(),
            staggerAxis: this.tiledMap._mapInfo.getStaggerAxis(),
            staggerIndex: this.tiledMap._mapInfo.getStaggerIndex(),
            hexSideLength: this.tiledMap._mapInfo.getHexSideLength(),
        });
        this.cameraController = CameraController.create(this.gameCamera, this.tiledMapProxy.mapSizeInPixel);


        this.tiledMapGesture = tnt.tmx.TiledMapGesture.create(this.gameCamera, {
            minZoomRatio: 0.5,
            getCameraTargetZoomRatio: () => {
                return this.cameraController.zoomRatio;
            },

            getCameraCurrentZoomRatio: () => {
                return this.cameraController.visualZoomRatio;
            },

            getCameraCurrentPosition: () => {
                return this.cameraController.visualPosition;
            },

            updateCameraPosition: (position: Vec3) => {
                this.cameraController.forcePosition(position);
            },

            updateCameraZoomRatio: (zoomRatio: number) => {
                this.cameraController.forceZoomRatio(zoomRatio);
            },
            onClick: (worldPosition: Vec2) => this.onClickTile(worldPosition),
        });

        setAnchorPointZero(this.tiledMap.node);
        // 地图锚点 设置为 [0,0]
        this.tiledMap._layers.forEach((layer) => {
            setAnchorPointZero(layer.node);
        });


        // 启用手势
        this.tiledMapGesture.enable(this.node, true);

        this.initDebugGraphics();

        let testRect = this.tiledMapProxy.boundingRect(0, 0, 2, 1)
        this.debugGraphics.clear();
        this.debugGraphics.rect(0, 0, this.tiledMapProxy.mapSizeInPixel.width, this.tiledMapProxy.mapSizeInPixel.height);


        this.debugGraphics.rect(testRect.x, testRect.y, testRect.width, testRect.height);
        console.log(`FloodFillDemo->${MapType[this.mapType]} cocos-creator mapSizeInPixel `, this.tiledMapProxy.mapSizeInPixel.toString());
        console.log(`FloodFillDemo->${MapType[this.mapType]} test Rect `, testRect.toString());



    }
    async initGUI() {
        await new Promise<void>((resolve, reject) => {
            tnt.resourcesMgr.loadBundle("cc-gui", () => {
                resolve();
            });
        });

        let guiWindow = await tnt.gui.create("Debug", new Size(240, 640));

        guiWindow.left()
            .addItem("TileXY", () => {
                return this.tiledCoord;
            })
            .addItem("WorldXY", () => {
                return this.worldCoord;
            })
            .addItem("ScreenXY", () => {
                return this.screenCoord;
            })
            .addSlider("Zoom", {
                defaultValue: 1, minValue: 0.5, maxValue: 3,
                callback: (progress, value) => {
                    this.cameraController.forceZoomRatio(value);
                }
            })


        let mapGroup = guiWindow.addGroup("Map");
        // MapType.Orthogonal

        for (const key in MapType) {
            // 正则判断 key  是否是数字

            if (/^\d+$/.test(key)) {
                if (Object.prototype.hasOwnProperty.call(MapType, key)) {
                    const element = MapType[key];
                    mapGroup.addToggle(element, (isChecked) => {
                        this.updateMap(key as any as number, isChecked);
                    }, key === MapType[MapType.Orthogonal]);
                }
            }
        }
        // .addToggle("Orthogonal", (isChecked) => {
        //     // 正交地图
        //     this.updateMap(MapType.Orthogonal, isChecked);
        // }, true)
        // .addToggle("Hexagonal", (isChecked) => {
        //     // 六角
        //     this.updateMap(MapType.Hexagonal, isChecked);
        // }, false)
        // .addToggle("Hex2Stagger", (isChecked) => {
        //     // 六角交错模拟45度交错
        //     this.updateMap(MapType.Hex2Stagger, isChecked);
        // }, false).justWidget().setGUIEnable(false)
        // .addToggle("Isometric", (isChecked) => {
        //     // 45度地图
        //     this.updateMap(MapType.Isometric, isChecked);
        // }, false).justWidget().setGUIEnable(false)
    }


    updateMap(mapType: MapType, isChecked: boolean) {
        if (!isChecked) {
            return;
        }
        if (this.mapType == mapType) {
            return;
        }
        this.mapType = mapType;
        let mapNameMap = {
            [MapType.Orthogonal]: "map_orthogonal",
            [MapType.Isometric]: "map_isometric",
            [MapType.HexagonXOdd]: "map_hexagon_x_odd", // 六角 X 奇数
            [MapType.HexagonXEven]: "map_hexagon_x_even", // 六角 X 偶数
            [MapType.HexagonYOdd]: "map_hexagon_y_odd", // 六角 Y 奇数
            [MapType.HexagonYEven]: "map_hexagon_y_even", // 六角 Y 偶数
            [MapType.StaggerXOdd]: "map_hexagon2stagger_x_odd",
            [MapType.StaggerXEven]: "map_hexagon2stagger_x_even",
            [MapType.StaggerYOdd]: "map_hexagon2stagger_y_odd",
            [MapType.StaggerYEven]: "map_hexagon2stagger_y_even",
        }
        let mapName = mapNameMap[mapType];
        if (!mapName) {
            return;
        }
        this.loader.load(`flood-fill#map/${mapName}`, TiledMapAsset, (err, asset) => {
            if (err) {
                console.log(`FloodFillDemo-> `, err);
                return;
            }
            this.tiledMap.tmxAsset = asset;
            this.onInit();
        });
    }

    async onClickTile(worldPosition: Vec2) {
        let tileCoords = this.tiledMapProxy.worldToTileCoords(worldPosition.x, worldPosition.y);
        if (this.tiledMapProxy.isSafe(tileCoords)) {

            let layer = this.tiledMap.getLayer("layer");
            let barrier = this.tiledMap.getLayer("barrier");
            // let gid = layer.getTileGIDAt(tileCoords.x, tileCoords.y);
            // layer.setTileGIDAt(3, tileCoords.x, tileCoords.y)

            await this.tiledMapProxy.performFloodFillRegion(tileCoords, (x, y) => {
                // console.log(`FloodFillDemo-> `, JSON.stringify({ x, y }));

                let gid = barrier.getTileGIDAt(x, y);
                return gid === 0;
            }, (x, y) => {
                layer.setTileGIDAt(0, x, y)
            });


            // let tiles = await this.tiledMapProxy.queryFloodFillRegion(tileCoords, (x, y) => {
            //     let gid = barrier.getTileGIDAt(x, y);
            //     return gid === 0;
            // });
            // for (let i = 0; i < tiles.length; i++) {
            //     const tile = tiles[i];
            //     layer.setTileGIDAt(0, tile.x, tile.y)
            // }
        }
    }


    onInputMoveEvent(location: Vec2) {
        tmp1_v3.set(location.x, location.y);
        tmp2_v3.set(location.x, location.y);
        let worldPosition = this.gameCamera.screenToWorld(tmp1_v3, tmp1_v3);

        let posInNode = this.screenToNode(tmp2_v3, this.tiledMapProxy.mapRoot, tmp2_v3);

        tmp1_v2.set(posInNode.x, posInNode.y);
        tmp2_v2.set(worldPosition.x, worldPosition.y);
        let tilePos = this.tiledMapProxy.pixelToTileCoords(tmp1_v2);
        // let hit = this.tiled.hitTest(worldPosition.copyAsVec2());
        // let world2Tile = this.tiledMapProxy.worldToTileCoords(tmp2_v2);

        // let tile2Pixel = this.tiled.tileToPixelCoords(tilePos.x,tilePos.y,new Vec2(0.5,0.5));
        // let tile2WorldPixel = this.tiled.tileToWorldCoords(tilePos.x,tilePos.y,new Vec2(0.5,0.5));

        this.worldCoord = `${Math.round(worldPosition.x)},${Math.round(worldPosition.y)}`;
        this.tiledCoord = `${tilePos.x},${tilePos.y}`;
        this.screenCoord = `${Math.round(location.x)},${Math.round(location.y)}`;

    }

    initDebugGraphics() {
        this.debugGraphics?.clear();
        if (!this.debugGraphics) {
            this.debugGraphics = new tnt.game.DebugGraphics(this.tiledMap.node);
            // this.debugGraphics.setColor(Color.fromHEX(color(), "#B3B3B3"));
            this.debugGraphics.setColor(Color.RED);
            this.debugGraphics.setLineWidth(3);
        }
    }


    /** 屏幕坐标转换到节点本地坐标 */
    screenToNode(screenPos: Vec3, node: Node, out?: Vec3) {
        if (!out) {
            out = new Vec3();
        }
        this.gameCamera.screenToWorld(screenPos, out);
        node.uiTransform.convertToNodeSpaceAR(out, out);
        return out;
    }

    cacheLocation: Vec2 = new Vec2();
    protected update(dt: number): void {
        if (!this.tiledMapGesture) {
            return;
        }
        if (this.cacheLocation.equals(this.tiledMapGesture.location)) {
            return;
        }
        this.onInputMoveEvent(this.tiledMapGesture.location);
        this.cacheLocation = this.tiledMapGesture.location;
    }
}
