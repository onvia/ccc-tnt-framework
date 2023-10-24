import { _decorator, Node, Graphics, Vec3, Color, game } from "cc";

const { ccclass, property } = _decorator;

declare global {
    interface IGame {
        DebugGraphics: typeof DebugGraphics;
    }
    namespace tnt {
        namespace game {
            type DebugGraphics = InstanceType<typeof DebugGraphics>;
        }
    }

}

@ccclass('DebugGraphics')
export class DebugGraphics {

    private graphics: Graphics = null;

    constructor(parent: Node) {
        this.onCtor(parent);
    }

    onCtor(parent: Node) {
        let node = new Node();
        node.parent = parent;
        node.position = new Vec3();
        this.graphics = node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = node.addComponent(Graphics);
        }
        this.graphics.lineWidth = 5;
    }

    moveTo(x, y) {
        // 设置笔刷起始位置
        this.graphics.moveTo(x, y);
    }

    setLineWidth(lineWidth) {
        // 设置笔刷粗细
        this.graphics.lineWidth = lineWidth;
    }

    setColor(color) {
        // 设置笔刷颜色(包括边框颜色和填充颜色)
        this.graphics.strokeColor = color;
        this.graphics.fillColor = color;
    }

    drawTo(x, y) {
        // 从起始位置一直画到目标位置
        this.graphics.lineTo(x, y);
        this.graphics.stroke();
    }

    ellipse(cx: number, cy: number, rx: number, ry: number) {
        this.graphics.ellipse(cx, cy, rx, ry);
        this.graphics.stroke();
    }
    rect(x: number, y: number, w: number, h: number) {
        this.graphics.rect(x, y, w, h);
        this.graphics.stroke();
    }

    drawPath(grids: tnt.pf.GridNode[], color: Color = Color.RED) {
        if (!grids?.length) {
            return;
        }
        this.graphics.clear();
        let first = grids[0];
        this.graphics.strokeColor = color;
        this.graphics.moveTo(first.pixelX, first.pixelY);
        for (let i = 1; i < grids.length; i++) {
            const grid = grids[i];
            this.graphics.lineTo(grid.pixelX, grid.pixelY);
            this.graphics.moveTo(grid.pixelX, grid.pixelY);
        }
        this.graphics.close();
        this.graphics.stroke();
    }

    clear() {
        this.graphics.clear();
    }

}


tnt.game.DebugGraphics = DebugGraphics;