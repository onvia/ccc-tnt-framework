import { _decorator, Node, Button, EventTouch, math, instantiate, Camera, v3 } from "cc";
import RVOMath from "../rvo2/RVOMath";
import Simulator from "../rvo2/Simulator";
import Vector2D from "../rvo2/Vector2D";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;


declare global {
    interface RVO2SceneOptions {

    }
}

let tmp1_v3 = v3();
let tmp2_v3 = v3();
@ccclass('RVO2Scene')
export class RVO2Scene extends tnt.SceneBase<RVO2SceneOptions> implements ITouch {

    simulator: Simulator = null;

    rectTemplete: Node = null;

    gameRoot: Node = null;

    gameCamera: Camera = null;

    rects: Node[] = [];

    speed: number = 100;

    targetPosition: Vector2D = null;
    rectWeak: WeakMap<Node, number> = new WeakMap();

    onEnterTransitionStart(sceneName?: string): void {
        this.simulator = new Simulator();
        this.simulator.setAgentDefaults(
            //在寻找周围邻居的搜索距离，这个值设置越大，会让小球在越远距离做出避障行为
            200, // neighbor distance (min = radius * radius)

            //寻找周围邻居的最大数目，这个值设置越大，最终计算的速度越 精确，但会加大计算量
            10, // max neighbors

            //计算动态的物体时的时间窗口
            100, // time horizon

            //代表计算静态的物体时的时间窗口，比如在RTS游戏中，小兵 向城墙移动时，没必要做出避障，这个值需要设置的很
            1, // time horizon obstacles

            //代表计算ORCA时的小球的半径，这个值不一定与小球实际显示的半径 一样，偏小有利于小球移动顺畅
            15, // agent radius

            //小球最大速度值
            this.speed, // max speed
            //初始速度
            // 0, // default velocity for x
            // 0, // default velocity for y
        )

        this.gameCamera = this.findComponent("Camera", Camera, null, this.scene);
        this.gameRoot = this.find("GameRoot", null, this.scene);
        this.rectTemplete = this.find("rect", null, this.scene);

        console.log(`RVO2Scene-> `);

        this.initGameObject();
    }

    initGameObject() {
        let parent = this.rectTemplete.parent;
        this.rectTemplete.removeFromParent();
        for (let i = 0; i < 5; i++) {
            let x = math.randomRangeInt(-400, 400);
            let y = math.randomRangeInt(-300, 300);
            let rect = instantiate(this.rectTemplete)
            rect.setPosition(x, y, 0);
            this.rects.push(rect);
            rect.parent = parent;

            let sid = this.simulator.addAgent(new Vector2D(x, y));

            this.rectWeak.set(rect, sid);
        }
    }


    onEnter(): void {
        tnt.touch.on(this);
    }

    onExitTransitionStart(sceneName?: string): void {
        tnt.touch.off(this);
    }
    onExit(): void {
    }


    onTouchBegan(event: EventTouch) {
        this.updateTargetPosition(event);

    }

    onTouchMoved(event: EventTouch) {
        this.updateTargetPosition(event);
    }

    onTouchEnded(event: EventTouch) {
        this.targetPosition = null;
        // 停止移动
        let agentCount = this.simulator.getNumAgents();
        for (let i = 0; i < agentCount; i++) {
            this.simulator.agents[i].prefVelocity = new Vector2D();
        }
    }

    onTouchCancel(event: EventTouch) {

    }

    updateTargetPosition(event: EventTouch) {
        let location = event.getLocation();
        console.log(`RVO2Scene-> 屏幕坐标 `, location);

        tmp1_v3.set(location.x, location.y);
        this.gameCamera.screenToWorld(tmp1_v3, tmp2_v3);
        this.gameRoot.uiTransform.convertToNodeSpaceAR(tmp2_v3, tmp2_v3);

        console.log(`RVO2Scene-> `, tmp2_v3);

        if (this.targetPosition) {
            this.targetPosition.x = tmp2_v3.x;
            this.targetPosition.y = tmp2_v3.y;;
        } else {
            this.targetPosition = new Vector2D(tmp2_v3.x, tmp2_v3.y);
        }
    }

    protected update(dt: number): void {
        if (!this.targetPosition) {
            return;
        }
        // 更新逻辑坐标
        let agentCount = this.simulator.getNumAgents();
        for (let i = 0; i < agentCount; i++) {
            // let prefVel = this.simulator.agents[i].prefVelocity;
            let agent = this.simulator.agents[i];
            let position = agent.position;
            let goalVector = this.targetPosition.minus(position);
            if (RVOMath.absSq(goalVector) > 1.0) {
                goalVector = RVOMath.normalize(goalVector).scale(agent.maxSpeed);
            }

            agent.prefVelocity = goalVector;
        }

        this.simulator.update(dt);

        // 更新渲染坐标
        for (let j = 0; j < this.rects.length; j++) {
            let node = this.rects[j];
            let sid = this.rectWeak.get(node);
            let pos = this.simulator.getAgentPosition(sid);
            node.setPosition(pos.x, pos.y);
        }
    }
}
