
import Vector2D from "./Vector2D";


export default class Obstacle {
    public next: Obstacle = null;
    public previous: Obstacle = null;
    public direction: Vector2D = Vector2D.ZERO;
    public point: Vector2D = Vector2D.ZERO;
    public id = 0;
    public isConvex: boolean = false;
}
