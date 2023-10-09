import { _decorator, Node, Camera, TiledMap, TiledMapAsset, Vec3, UITransform, Color, color, Vec2, Toggle, Size } from "cc";
import CameraController, { CameraState } from "../../../a-framework/scenes/scene2d/tiled/controller/CameraController";
import { DebugGraphics } from "./DebugGraphics";
import { Player } from "./Player";
import { TiledMapEvents } from "./TiledMapEvents";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global {
    interface PathFindingDemoOptions {

    }
}

const tmp1_v2 = new Vec2();
const tmp2_v2 = new Vec2();
const tmp1_v3 = new Vec3();
const tmp2_v3 = new Vec3();
const HALF_v2 = new Vec2(0.5, 0.5);

@ccclass('PathFindingDemo')
export class PathFindingDemo extends tnt.SceneBase<PathFindingDemoOptions> {

    tiledMapProxy: tnt.tmx.TiledMapProxy = null;
    tiledMapGesture: tnt.tmx.TiledMapGesture = null;

    gameCamera: Camera = null;
    tiledMap: TiledMap = null;

    debugPathGraphics: DebugGraphics = null;
    debugGridGraphics: DebugGraphics = null;

    player: Player = null;

    // A* 寻路
    pathFinder: tnt.pf.IPathFinder = null;

    cameraController: CameraController = null;

    // 所有的格子
    grids: number[][] = [];

    worldCoord = "0,0";
    tiledCoord = "0,0";
    screenCoord = "0,0";

    // 是否跟随角色
    isFollowPlayer = false;
    onEnterTransitionFinished(sceneName?: string): void {
        this.gameCamera = tnt.componentUtils.findComponent("Camera", Camera, this.scene);

        this.tiledMap = tnt.componentUtils.findComponent("map", TiledMap, this.scene);

        this.loader.load("tiled-map-example#map/map_hexagonal_y", TiledMapAsset, (err, asset) => {
            // this.loader.load("tiled-map-example#map/map", TiledMapAsset, (err, asset) => {
            if (err) {
                console.log(`PathFindingDemo-> `, err);
                return;
            }
            this.tiledMap.tmxAsset = asset;
            this.onInit();

        });
    }

    onExitTransitionStart(sceneName?: string): void {
        // 关闭手势
        this.tiledMapGesture.disable();
    }

    onInit() {

        // 使用了摄像机需要把自动裁剪关闭
        this.tiledMap.enableCulling = false;
        this.tiledMapProxy = new tnt.tmx.TiledMapProxy(this.tiledMap);
        this.cameraController = CameraController.create(this.gameCamera, this.tiledMapProxy.mapSizeInPixel);
        this.tiledMapGesture = new tnt.tmx.TiledMapGesture(this.tiledMapProxy, this.gameCamera, {
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
            clickTile: (tileCoords: Vec2) => {
                let start = this.tiledMapProxy.pixelToTileCoords(this.player.node.position.x, this.player.node.position.y);
                let grids = this.pathFinder.search(start, tileCoords, (node1: tnt.pf.GridNode, node2: tnt.pf.GridNode) => {
                    var d1 = node2.x - node1.x
                    var d2 = node2.y - node1.y
                    return Math.sqrt(d1 * d1 + d2 * d2);
                }
                );
                this.isFollowPlayer && this.cameraController.follow(this.player.node);
                console.log(`路径 `, JSON.parse(JSON.stringify(grids)));
                this.player.moveByRoad(grids);

                let startGridNode = this.pathFinder.createGridNode(start.x, start.y, 0);
                let copyGrids = [...grids];
                copyGrids.unshift(startGridNode);
                this.debugPathGraphics?.drawPath(copyGrids);
            },
        });

        this.setAnchorPointZero(this.tiledMap.node);
        // 地图锚点 设置为 [0,0]
        this.tiledMap._layers.forEach((layer) => {
            this.setAnchorPointZero(layer.node);
        });


        this.initEvents();
        this.initRole();
        this.initAStar();
        this.initDebugGraphics();


        // 启用手势
        this.tiledMapGesture.enable(this.node);

        this.initGUI();
    }
    initEvents() {
        tnt.eventMgr.on(TiledMapEvents.PLAYER_MOVE_END, this.onPlayerMoveEndListener, this);
    }

    async initGUI() {
        await new Promise<void>((resolve, reject) => {
            tnt.resourcesMgr.loadBundle("cc-gui", () => {
                resolve();
            });
        });

        let guiWindow = await tnt.gui.create("Debug", new Size(320, 640));

        guiWindow
            .addCheckbox("Follow", (isChecked) => {
                this.followPlayer(isChecked);
            }, false)
            .addItem("TileXY", () => {
                return this.tiledCoord;
            })
            .addItem("WorldXY", () => {
                return this.worldCoord;
            })
            .addItem("ScreenXY", () => {
                return this.screenCoord;
            })


    }
    initRole() {

        let role = tnt.componentUtils.findNode("role", this.scene);

        let players = this.tiledMap.getObjectGroup("players");
        let spawnPoint = players.getObject("SpawnPoint");
        role.position = new Vec3(spawnPoint.x, spawnPoint.y);

        this.player = role.addComponent(Player);
    }
    initAStar() {
        let grids = [];
        let barrierLayer = this.tiledMap.getLayer("barrier");
        this.tiledMapProxy.forEachTiles(barrierLayer, (gid, x, y) => {
            if (!grids[x]) {
                grids[x] = [];
            }
            grids[x][y] = gid;
        })
        this.grids = grids;

        let wall: tnt.pf.IWall = {
            isWall: (weight) => {
                return weight > 0;
            }
        }

        // 坐标转换
        let coordinateTransform: tnt.pf.ICoordinateTransform = {
            gridToWorld: (grid: Readonly<Vec2>) => {
                let pixel = this.tiledMapProxy.tileToPixelCoords(grid.x, grid.y, HALF_v2);
                tmp1_v3.set(pixel.x, pixel.y);
                let worldPosition = this.gameCamera.screenToWorld(tmp1_v3, tmp1_v3)
                pixel.set(worldPosition.x, worldPosition.y);
                return pixel;
            },
            gridToPixel: (grid: Readonly<Vec2>) => {
                let pixel = this.tiledMapProxy.tileToPixelCoords(grid.x, grid.y, HALF_v2);
                return pixel;
            }
        }

        // this.pathFinder = new AStarBinaryHeap(coordinateTransform, wall, new tnt.pf.RouteGraphNormal(false), this.grids);

        let staggerX = this.tiledMap._mapInfo.getStaggerAxis() === 0;
        let staggerEven = this.tiledMap._mapInfo.getStaggerIndex() === 1;
        this.pathFinder = new tnt.pf.AStarBinaryHeap(coordinateTransform, wall, new tnt.pf.RouteGraphHexagonal(staggerX, staggerEven), this.grids);

    }
    setAnchorPointZero(node: Node) {
        let uiTransform = node.getComponent(UITransform);
        uiTransform.setAnchorPoint(0, 0);
        node.position.set(0, 0, 0);
    }

    onPlayerMoveEndListener() {

    }


    followPlayer(follow: boolean) {
        this.isFollowPlayer = follow;
        if (follow) {
            this.cameraController.follow(this.player.node);
        } else {
            this.cameraController.cameraState = CameraState.Free;
        }

    }
    initDebugGraphics() {
        this.debugGridGraphics = new DebugGraphics(this.tiledMap.node);
        this.debugPathGraphics = new DebugGraphics(this.tiledMap.node);

        let mapSize = this.tiledMapProxy.mapSize;
        let width = mapSize.width;
        let height = mapSize.height;
        this.debugGridGraphics.setColor(Color.fromHEX(color(), "#B3B3B3"));
        // this.debugGridGraphics.setColor(Color.RED);
        this.debugGridGraphics.setLineWidth(3);
        const ANCHOR = new Vec2(0, 1);
        for (let i = 1; i < width; i++) {
            let start = this.tiledMapProxy.tileToPixelCoords(i, 0, ANCHOR);
            this.debugGridGraphics.moveTo(start.x, start.y);
            let end = this.tiledMapProxy.tileToPixelCoords(i, height, ANCHOR);
            this.debugGridGraphics.drawTo(end.x, end.y);
        }
        for (let j = 1; j < height; j++) {
            let start = this.tiledMapProxy.tileToPixelCoords(0, j, ANCHOR);
            this.debugGridGraphics.moveTo(start.x, start.y);
            let end = this.tiledMapProxy.tileToPixelCoords(width, j, ANCHOR);
            this.debugGridGraphics.drawTo(end.x, end.y);
        }
    }



    onInputMoveEvent(location: Vec2) {
        tmp1_v3.set(location.x, location.y);
        tmp2_v3.set(location.x, location.y);
        let worldPosition = this.gameCamera.screenToWorld(tmp1_v3, tmp1_v3);

        let posInNode = this.screenToNode(tmp2_v3, this.tiledMapProxy.tiledMap.node, tmp2_v3);

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
        if (this.cacheLocation.equals(this.tiledMapGesture.location)) {
            return;
        }
        this.onInputMoveEvent(this.tiledMapGesture.location);
        this.cacheLocation = this.tiledMapGesture.location;
    }
}
