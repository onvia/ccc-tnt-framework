import { v2, v3, Vec2, Vec3, _decorator } from "cc";
import { TiledMapEvents } from "./TiledMapEvents";
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends tnt.Actor2D {

    private _position: Vec2 = v2();
    public get position(): Vec2 {
        return this._position;
    }
    public set position(value: Vec2) {
        this._position = value;

    }

    protected moveSpeed: number = 300;

    protected _gluePosition: Vec3 = v3();
    protected _dir: Vec2 = v2();

    path: tnt.pf.GridNode[] = [];


    protected onEnable(): void {
        if (this.node) {
            this.position = v2(this.node.position.x, this.node.position.y);
        }
    }

    public moveByRoad(grids: tnt.pf.GridNode[]) {
        if (!grids?.length) {
            tnt.uiMgr.showDebugToast(`没有找到路径`);
            return;
        }
        this.path = grids;
        tnt.uiMgr.showDebugToast(`开始移动 (${grids[0].x},${grids[0].y}) `);
    }

    protected update(dt: any): void {
        if (!this.path?.length) {
            return;
        }

        let target = this.path[0];
        let dx = target.pixelX - this.position.x;
        let dy = target.pixelY - this.position.y;
        this._dir.set(dx, dy);
        this._dir = this._dir.normalize();
        let speed = this.moveSpeed * dt;

        if (dx * dx + dy * dy > speed * speed) {
            this.position.x += this._dir.x * speed;
            this.position.y += this._dir.y * speed;
        } else {
            this.position.x = target.pixelX;
            this.position.y = target.pixelY;
            this.path.shift();
        }

        this.syncPosition();

        if (!this.path.length) {
            console.log(`Player-> 移动结束`);
            tnt.uiMgr.showDebugToast(`移动结束(${target.x},${target.y}) `);
            tnt.eventMgr.emit(TiledMapEvents.PLAYER_MOVE_END);
        }
    }

    syncPosition() {
        if (this.node) {
            this._gluePosition.set(this.position.x, this.position.y, this.node.position.z);
            this.node.position = this._gluePosition;
        }
    }

    stopMove() {
        this.path.length = 0;
    }
}
