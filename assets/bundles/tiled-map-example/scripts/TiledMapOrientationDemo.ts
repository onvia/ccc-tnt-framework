
import { _decorator, Component, Node, TiledMap, Camera, TiledLayer, EventTouch, math, UITransform, Vec2, EventMouse, sys, Toggle } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('TiledMapOrientationDemo')
export class TiledMapOrientationDemo extends tnt.SceneBase implements ITouch, IMouse, IMVVMObject {

    tiledMap: TiledMap = null;
    gameCamera: Camera = null;
    layer: TiledLayer = null;

    tiledMapProxy: tnt.tmx.TiledMapProxy = null;


    data = {
        tiledCoord: "0,0",
        worldCoord: "0,0",
        screenCoord: "0,0",
    }

    onEnter(): void {
        tnt.vm.observe(this);
        this.bindView();


        this.registerToggleGroupEvent("ToggleGroup", { onChecked: this.onChecked, onUnChecked: this.onUnChecked });
        this.toggleCheck("ToggleGroup", "ToggleHexagonalX");
    }

    bindView() {
        tnt.vm.label(this, this.getNodeByName("tiledCoord"), "*.tiledCoord");
        tnt.vm.label(this, this.getNodeByName("worldCoord"), "*.worldCoord");
        tnt.vm.label(this, this.getNodeByName("screenCoord"), "*.screenCoord");

    }

    onChecked(toggle: Toggle, name: string) {

        let tileMapName = "";
        switch (name) {
            case "ToggleHexagonalX":
                tileMapName = "map_hexagonal_x";
                break;
            case "ToggleHexagonalY":
                tileMapName = "map_hexagonal_y";
                break;
            case "ToggleIsometric":
                tileMapName = "map_isometric";
                break;
            case "ToggleOrthogonal":
                tileMapName = "map_orthogonal";
                break;
            case "ToggleStaggered":
                tileMapName = "map_hexagonal_simulation_staggered";
                break;
            default:
                break;
        }
        let GameCanvas = this.find("GameCanvas", null, this.scene);
        let GameRoot = this.find("GameRoot", GameCanvas, this.scene);
        let tiledMap = this.findComponent(tileMapName, TiledMap, GameRoot, this.scene);
        this.gameCamera = this.findComponent("Camera", Camera, GameCanvas, this.scene);

        // 隐藏之前的
        if (this.tiledMap) {
            this.tiledMap.node.active = false;
        }

        this.tiledMap = tiledMap;
        this.tiledMap.node.active = true;

        this.layer = this.tiledMap.getLayer("layer");
        this.tiledMapProxy = tnt.tmx.TiledMapProxy.create(this.tiledMap.node, {
            orientation: this.tiledMap.getMapOrientation(),
            tileSize: this.tiledMap.getTileSize(),
            mapSize: this.tiledMap.getMapSize(),
            staggerAxis: this.tiledMap._mapInfo.getStaggerAxis(),
            staggerIndex: this.tiledMap._mapInfo.getStaggerIndex(),
            hexSideLength: this.tiledMap._mapInfo.getHexSideLength()
        });

        let mapBg = this.find("map_bg", null, this.scene);
        mapBg.uiTransform.setContentSize(this.tiledMap.node.uiTransform.contentSize);
        mapBg.position = this.tiledMap.node.position;
    }

    onUnChecked(toggle: Toggle, name: string) {

    }

    onExit(): void {
        tnt.vm.violate(this);

    }

    onEnterTransitionFinished(): void {
        if (sys.platform == sys.Platform.DESKTOP_BROWSER) {
            tnt.mouse.on(this);
        } else {
            tnt.touch.on(this);
        }
    }

    onExitTransitionStart(): void {
        tnt.touch.off(this);
        tnt.mouse.off(this);
    }

    onTouchBegan(event: EventTouch) {
        if (!this.tiledMapProxy) {
            return;
        }
    }
    onTouchMoved(event: EventTouch) {
        this.onInputMoveEvent(event);
    }
    onTouchEnded(event: EventTouch) {

    }
    onTouchCancel(event: EventTouch) {

    }

    onMouseDown(event: EventMouse) {
    }
    onMouseUp(event: EventMouse) {

    }
    onMouseMove?(event: EventMouse) {
        this.onInputMoveEvent(event);
    }

    onInputMoveEvent(event: EventMouse | EventTouch) {

        let location = event.getLocation();

        let worldPosition = this.gameCamera.screenToWorld(location.copyAsVec3());

        let posInNode = this.screenToNode(location.copyAsVec3(), this.tiledMap.node);


        let tilePos = this.tiledMapProxy.pixelToTileCoords(posInNode.copyAsVec2());
        // let hit = this.tiled.hitTest(worldPosition.copyAsVec2());
        let world2Tile = this.tiledMapProxy.worldToTileCoords(worldPosition.copyAsVec2());

        // let tile2Pixel = this.tiled.tileToPixelCoords(tilePos.x,tilePos.y,new Vec2(0.5,0.5));
        // let tile2WorldPixel = this.tiled.tileToWorldCoords(tilePos.x,tilePos.y,new Vec2(0.5,0.5));



        this.data.worldCoord = `${Math.round(worldPosition.x)},${Math.round(worldPosition.y)}`;
        this.data.tiledCoord = `${tilePos.x},${tilePos.y}`;
        this.data.screenCoord = `${Math.round(location.x)},${Math.round(location.y)}`;
    }


    /** 屏幕坐标转换到节点本地坐标 */
    screenToNode(screenPos: math.Vec3, node: Node, out?: math.Vec3) {
        if (!out) {
            out = new math.Vec3();
        }
        this.gameCamera.screenToWorld(screenPos, out);
        let uiTransform = node.getComponent(UITransform);
        uiTransform.convertToNodeSpaceAR(out, out);
        return out;
    }

}
