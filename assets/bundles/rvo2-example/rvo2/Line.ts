import Vector2D from "./Vector2D";

export default class Line {
   
    constructor(point: Vector2D = null, direction: Vector2D = null) {
        this.direction = direction;
        this.point = point;
    }

    public direction: Vector2D = Vector2D.ZERO;

    
    public point: Vector2D = Vector2D.ZERO;

}
