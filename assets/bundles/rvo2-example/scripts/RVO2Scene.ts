import { _decorator, Node, Button, EventTouch, math, instantiate, Camera, v3, KeyCode } from "cc";
import RVOMath from "../rvo2/RVOMath";
import Simulator from "../rvo2/Simulator";
import Vector2D from "../rvo2/Vector2D";

const { ccclass } = _decorator;
const { node, sprite, button } = tnt._decorator;

// 参考 https://github.com/warmtrue/RVO2-Unity.git

declare global {
    interface RVO2SceneOptions {

    }
}

let tmp1_v3 = v3();
let tmp2_v3 = v3();
@ccclass('RVO2Scene')
export class RVO2Scene extends tnt.SceneBase<RVO2SceneOptions> implements ITouch {

    simulator: Simulator = null;

    rectTemplate: Node = null;

    gameRoot: Node = null;

    gameCamera: Camera = null;


    speed: number = 10;

    targetPosition: Vector2D = null;
    rectMap: Map<number, Node> = new Map();
    isDelMode = false;

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
        this.rectTemplate = this.find("rect", null, this.scene);

        console.log(`RVO2Scene-> `);

        this.initGameObject();
    }

    initGameObject() {
        let parent = this.rectTemplate.parent;
        this.rectTemplate.removeFromParent();
        for (let i = 0; i < 5; i++) {
            let x = math.randomRangeInt(-400, 400);
            let y = math.randomRangeInt(-300, 300);
            let rect = instantiate(this.rectTemplate)
            rect.setPosition(x, y, 0);
            rect.parent = parent;

            let sid = this.simulator.addAgent(new Vector2D(x, y));

            if (i === 0) {
                this.simulator.setAgentMaxSpeed(sid, 20);
            }
            this.rectMap.set(sid, rect);
        }


        // 障碍
        let obstacles1 = this.find("obstacles1", null, this.scene);
        let obstacles2 = this.find("obstacles2", null, this.scene);

        this.generateObstacle(obstacles1);
        this.generateObstacle(obstacles2);
        this.simulator.processObstacles();
    }

    generateObstacle(node: Node) {
        let box = node.uiTransform.getBoundingBox();

        let obs: Vector2D[] = [];
        obs.push(new Vector2D(box.xMin, box.yMin));
        obs.push(new Vector2D(box.xMax, box.yMin));
        obs.push(new Vector2D(box.xMax, box.yMax));
        obs.push(new Vector2D(box.xMin, box.yMax));
        this.simulator.addObstacle(obs);
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
        if (tnt.keyboard.isPressed(KeyCode.CTRL_LEFT)) {
            this.isDelMode = true;
        } else {
            this.isDelMode = false;
        }

        this.processTouch(event);

    }

    onTouchMoved(event: EventTouch) {
        this.processTouch(event);
    }

    onTouchEnded(event: EventTouch) {
        if (this.targetPosition) {
            this.stopMove();
        }
    }

    onTouchCancel(event: EventTouch) {

    }

    // 停止移动
    stopMove() {
        this.targetPosition = null;
        let agentCount = this.simulator.getNumAgents();
        for (let i = 0; i < agentCount; i++) {
            this.simulator.agents[i].prefVelocity.set(0, 0);
        }
    }

    // 处理触摸
    processTouch(event: EventTouch) {
        let location = event.getLocation();

        tmp1_v3.set(location.x, location.y);
        this.gameCamera.screenToWorld(tmp1_v3, tmp2_v3);
        this.gameRoot.uiTransform.convertToNodeSpaceAR(tmp2_v3, tmp2_v3);

        // 删除模式
        if (this.isDelMode) {
            let agentNo = this.simulator.queryNearAgent(new Vector2D(tmp2_v3.x, tmp2_v3.y), 15);
            if (agentNo == -1 || !this.rectMap.has(agentNo)) {
                return;
            }
            this.simulator.delAgent(agentNo);
            let rect = this.rectMap.get(agentNo);
            rect.destroy();
            this.rectMap.delete(agentNo);
        } else {
            // 正常更新位置
            if (this.targetPosition) {
                this.targetPosition.set(tmp2_v3.x, tmp2_v3.y);
            } else {
                this.targetPosition = new Vector2D(tmp2_v3.x, tmp2_v3.y);
            }
        }
    }

    protected update(dt: number): void {
        if (!this.targetPosition) {
            return;
        }

        // 更新逻辑坐标
        let agentCount = this.simulator.getNumAgents();
        for (let i = 0; i < agentCount; i++) {
            let agent = this.simulator.agents[i];
            let position = agent.position;
            let goalVector = this.targetPosition.minus(position);
            if (RVOMath.absSq(goalVector) > 1.0) {
                goalVector = RVOMath.normalize(goalVector).scale(agent.maxSpeed);
            }
            agent.prefVelocity = goalVector;
        }
        this.simulator.update(dt);

        // // 更新渲染坐标
        this.rectMap.forEach((v, k) => {
            let pos = this.simulator.getAgentPosition(k);
            v.setPosition(pos.x, pos.y);
        });

    }
}
