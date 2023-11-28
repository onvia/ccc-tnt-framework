import { _decorator, Component, Node, Size, Vec2, IVec2Like } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('hexagon_mask')
export class hexagon_mask extends Component {

    @property
    private _tileSize: Size = new Size(74, 64);

    @property
    public get tileSize(): Size {
        return this._tileSize;
    }
    public set tileSize(value: Size) {
        this._tileSize = value;

        this._tileSize.width = value.width & ~1;
        this._tileSize.height = value.height & ~1;

        this.updateSideOffset();
    }

    @property
    public staggerX: boolean = false;


    @property
    private _sideLength: number = 40;

    @property
    public get sideLength(): number {
        return this._sideLength;
    }
    public set sideLength(value: number) {
        this._sideLength = value;
        this.updateSideOffset();
    }


    private _sideLengthX: number = 0;

    public get sideLengthX(): number {
        return this.staggerX ? this._sideLengthX : 0;
    }

    private _sideLengthY: number = 0;
    public get sideLengthY(): number {
        return this.staggerX ? 0 : this._sideLengthY;
    }

    sideOffsetX: number = 0;
    sideOffsetY: number = 0;

    private updateSideOffset() {
        if (this.staggerX) {
            this._sideLengthX = this._sideLength;
        }
        else {
            this._sideLengthX = this._sideLength;
        }
        this.sideOffsetX = (this.tileSize.width - this.sideLengthX) / 2;
        this.sideOffsetY = (this.tileSize.height - this.sideLengthY) / 2;
    }

    protected start(): void {
        let polygon = this.polygon();
        let width = this.node.uiTransform.width;
        let height = this.node.uiTransform.height;


        for (let i = 0; i < polygon.length; i++) {
            const element = polygon[i];
            element.x = element.x / width;
            element.y = element.y / height;

            this.node.sprite.customMaterial.setProperty(`vertex${i}`, new Vec2(element.x, element.y));
        }


        console.log(`hexagon-mask-> `, polygon);
    }
    polygon(): IVec2Like[] {
        let p = this;
        let polygon: Vec2[] = [];
        for (let i = 0; i < 8; i++) {
            polygon[i] = new Vec2();
        }
        this.updateSideOffset();
        polygon[0] = new Vec2(0, p.tileSize.height - p.sideOffsetY);
        polygon[1] = new Vec2(0, p.sideOffsetY);
        polygon[2] = new Vec2(p.sideOffsetX, 0);
        polygon[3] = new Vec2(p.tileSize.width - p.sideOffsetX, 0);
        polygon[4] = new Vec2(p.tileSize.width, p.sideOffsetY);
        polygon[5] = new Vec2(p.tileSize.width, p.tileSize.height - p.sideOffsetY);
        polygon[6] = new Vec2(p.tileSize.width - p.sideOffsetX, p.tileSize.height);
        polygon[7] = new Vec2(p.sideOffsetX, p.tileSize.height);

        let uniqueVec2Array = Array.from(new Set(polygon.map((v) => JSON.stringify(v))), (v) => JSON.parse(v));
        return uniqueVec2Array;
    }
}