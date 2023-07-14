
import RVOMath from "./RVOMath";
import Simulator from "./Simulator";
import Agent from "./Agent";
import Obstacle from "./Obstacle";
import Vector2D from "./Vector2D";

export default class KdTree {
    public simulator: Simulator = null;

    public MAX_LEAF_SIZE = 100;

    private agents: Agent[] = [];
    private agentTree: AgentTreeNode[] = [];
    private obstacleTree: ObstacleTreeNode = null;

    /**
     * Builds an agent k-D tree.
     *
     * @memberof KdTree
     */
    buildAgentTree() {

        if (this.agents == null || this.agents.length != this.simulator.agents.length) {
            this.agents = new Array(this.simulator.agents.length);

            for (let i = 0; i < this.agents.length; ++i) {
                this.agents[i] = this.simulator.agents[i];
            }

            this.agentTree = new Array<AgentTreeNode>(2 * this.agents.length);

            for (let i = 0; i < this.agentTree.length; ++i) {
                this.agentTree[i] = new AgentTreeNode();
            }
        }

        if (this.agents.length != 0) {
            this.buildAgentTreeRecursive(0, this.agents.length, 0);
        }
    }
    /**
     * Builds an obstacle k-D tree.
     *
     * @memberof KdTree
     */
    buildObstacleTree() {
        this.obstacleTree = new ObstacleTreeNode();

        let obstacles = new Array<Obstacle>(this.simulator.obstacles.length);

        for (let i = 0; i < this.simulator.obstacles.length; ++i) {
            obstacles.push(this.simulator.obstacles[i]);
        }

        this.obstacleTree = this.buildObstacleTreeRecursive(obstacles);
    }

    /**
     * Computes the agent neighbors of the specified agent.
     *
     * @param {Agent} agent The agent for which agent neighbors are to be computed.
     * @param {number} rangeSq The squared range around the agent.
     * @return {*}  {number}
     * @memberof KdTree
     */
    computeAgentNeighbors(agent: Agent, rangeSq: number): number {

        return this.queryAgentTreeRecursive(agent, rangeSq, 0);
    }

    /**
     * Computes the obstacle neighbors of the specified agent.
     *
     * @param {Agent} agent The agent for which obstacle neighbors are to be computed.
     * @param {number} rangeSq The squared range around the agent.
     * @memberof KdTree
     */
    computeObstacleNeighbors(agent: Agent, rangeSq: number) {
        this.queryObstacleTreeRecursive(agent, rangeSq, this.obstacleTree);
    }
    /**
     * Queries the visibility between two points within a specified radius.
     *
     * @param {Vector2D} q1 The first point between which visibility is to be tested.
     * @param {Vector2D} q2 The second point between which visibility is to be tested.
     * @param {number} radius The radius within which visibility is to be tested.
     * @return {*}  {boolean} True if q1 and q2 are mutually visible within the radius; false otherwise.
     * @memberof KdTree
     */
    queryVisibility(q1: Vector2D, q2: Vector2D, radius: number): boolean {
        return this.queryVisibilityRecursive(q1, q2, radius, this.obstacleTree);
    }

    queryNearAgent(point: Vector2D, radius: number): number {
        let res = {
            rangeSq: Number.MAX_VALUE,
            agentNo: -1,
        }
        this.queryAgentTreeRecursiveByVector2D(point, res, 0);
        if (res.rangeSq < radius * radius) {
            return res.agentNo;
        }

        return -1;
    }
    /**
     * Recursive method for building an agent k-D tree.
     * 
     * @private
     * @param {number} begin The beginning agent k-D tree node node index.
     * @param {number} end The ending agent k-D tree node index.
     * @param {number} node The current agent k-D tree node index.
     * @memberof KdTree
     */
    private buildAgentTreeRecursive(begin: number, end: number, node: number) {

        this.agentTree[node].begin_ = begin;
        this.agentTree[node].end_ = end;
        this.agentTree[node].minX_ = this.agentTree[node].maxX_ = this.agents[begin].position.x;
        this.agentTree[node].minY_ = this.agentTree[node].maxY_ = this.agents[begin].position.y;

        for (let i = begin + 1; i < end; ++i) {
            this.agentTree[node].maxX_ = Math.max(this.agentTree[node].maxX_, this.agents[i].position.x);
            this.agentTree[node].minX_ = Math.min(this.agentTree[node].minX_, this.agents[i].position.x);
            this.agentTree[node].maxY_ = Math.max(this.agentTree[node].maxY_, this.agents[i].position.y);
            this.agentTree[node].minY_ = Math.min(this.agentTree[node].minY_, this.agents[i].position.y);
        }

        if (end - begin > this.MAX_LEAF_SIZE) {
            /* No leaf node. */
            let isVertical = this.agentTree[node].maxX_ - this.agentTree[node].minX_ > this.agentTree[node].maxY_ - this.agentTree[node].minY_;
            let splitValue = 0.5 * (isVertical ? this.agentTree[node].maxX_ + this.agentTree[node].minX_ : this.agentTree[node].maxY_ + this.agentTree[node].minY_);

            let left = begin;
            let right = end;

            while (left < right) {
                while (left < right && (isVertical ? this.agents[left].position.x : this.agents[left].position.y) < splitValue) {
                    ++left;
                }

                while (right > left && (isVertical ? this.agents[right - 1].position.x : this.agents[right - 1].position.y) >= splitValue) {
                    --right;
                }

                if (left < right) {
                    let tempAgent = this.agents[left];
                    this.agents[left] = this.agents[right - 1];
                    this.agents[right - 1] = tempAgent;
                    ++left;
                    --right;
                }
            }

            let leftSize = left - begin;

            if (leftSize == 0) {
                ++leftSize;
                ++left;
                ++right;
            }

            this.agentTree[node].left_ = node + 1;
            this.agentTree[node].right_ = node + 2 * leftSize;

            this.buildAgentTreeRecursive(begin, left, this.agentTree[node].left_);
            this.buildAgentTreeRecursive(left, end, this.agentTree[node].right_);
        }
    }

    /**
     * Recursive method for building an obstacle k-D tree.
     *
     * @private
     * @param {Obstacle[]} obstacles A list of obstacles.
     * @return {*}  {ObstacleTreeNode} An obstacle k-D tree node.
     * @memberof KdTree
     */
    private buildObstacleTreeRecursive(obstacles: Obstacle[]): ObstacleTreeNode {

        if (obstacles.length == 0) {
            return null;
        }

        let node = new ObstacleTreeNode();

        let optimalSplit = 0;
        let minLeft = obstacles.length;
        let minRight = obstacles.length;

        for (let i = 0; i < obstacles.length; ++i) {
            let leftSize = 0;
            let rightSize = 0;

            let obstacleI1 = obstacles[i];
            let obstacleI2 = obstacleI1.next;

            /* Compute optimal split node. */
            for (let j = 0; j < obstacles.length; ++j) {
                if (i == j) {
                    continue;
                }

                let obstacleJ1 = obstacles[j];
                let obstacleJ2 = obstacleJ1.next;

                let j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
                let j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);

                if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON) {
                    ++leftSize;
                }
                else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON) {
                    ++rightSize;
                }
                else {
                    ++leftSize;
                    ++rightSize;
                }

                if (new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize))._get(new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight)))) {
                    break;
                }
            }

            if (new FloatPair(Math.max(leftSize, rightSize), Math.min(leftSize, rightSize))._mt(new FloatPair(Math.max(minLeft, minRight), Math.min(minLeft, minRight)))) {
                minLeft = leftSize;
                minRight = rightSize;
                optimalSplit = i;
            }
        }

        {
            /* Build split node. */
            let leftObstacles = new Array<Obstacle>(minLeft)

            // for (let n = 0; n < minLeft; ++n)
            // {
            //     leftObstacles.push(null);
            // }

            let rightObstacles = new Array<Obstacle>(minRight);

            // for (let n = 0; n < minRight; ++n)
            // {
            //     rightObstacles.push(null);
            // }

            let leftCounter = 0;
            let rightCounter = 0;
            let i = optimalSplit;

            let obstacleI1 = obstacles[i];
            let obstacleI2 = obstacleI1.next;

            for (let j = 0; j < obstacles.length; ++j) {
                if (i == j) {
                    continue;
                }

                let obstacleJ1 = obstacles[j];
                let obstacleJ2 = obstacleJ1.next;

                let j1LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ1.point);
                let j2LeftOfI = RVOMath.leftOf(obstacleI1.point, obstacleI2.point, obstacleJ2.point);

                if (j1LeftOfI >= -RVOMath.RVO_EPSILON && j2LeftOfI >= -RVOMath.RVO_EPSILON) {
                    leftObstacles[leftCounter++] = obstacles[j];
                }
                else if (j1LeftOfI <= RVOMath.RVO_EPSILON && j2LeftOfI <= RVOMath.RVO_EPSILON) {
                    rightObstacles[rightCounter++] = obstacles[j];
                }
                else {
                    /* Split obstacle j. */
                    let t = RVOMath.det(obstacleI2.point.minus(obstacleI1.point), obstacleJ1.point.minus(obstacleI1.point)) / RVOMath.det(obstacleI2.point.minus(obstacleI1.point), obstacleJ1.point.minus(obstacleJ2.point));

                    let splitPoint = obstacleJ1.point.plus(obstacleJ2.point.minus(obstacleJ1.point).scale(t));

                    let newObstacle = new Obstacle();
                    newObstacle.point = splitPoint;
                    newObstacle.previous = obstacleJ1;
                    newObstacle.next = obstacleJ2;
                    newObstacle.isConvex = true;
                    newObstacle.direction = obstacleJ1.direction;

                    newObstacle.id = this.simulator.obstacles.length;

                    this.simulator.obstacles.push(newObstacle);

                    obstacleJ1.next = newObstacle;
                    obstacleJ2.previous = newObstacle;

                    if (j1LeftOfI > 0.0) {
                        leftObstacles[leftCounter++] = obstacleJ1;
                        rightObstacles[rightCounter++] = newObstacle;
                    }
                    else {
                        rightObstacles[rightCounter++] = obstacleJ1;
                        leftObstacles[leftCounter++] = newObstacle;
                    }
                }
            }

            node.obstacle_ = obstacleI1;
            node.left_ = this.buildObstacleTreeRecursive(leftObstacles);
            node.right_ = this.buildObstacleTreeRecursive(rightObstacles);

            return node;
        }
    }

    private queryAgentTreeRecursiveByVector2D(position: Vector2D, options: { rangeSq: number, agentNo: number }, node: number) {
        if (this.agentTree[node].end_ - this.agentTree[node].begin_ <= this.MAX_LEAF_SIZE) {
            for (let i = this.agentTree[node].begin_; i < this.agentTree[node].end_; ++i) {
                let distSq = RVOMath.absSq(position.minus(this.agents[i].position));
                if (distSq < options.rangeSq) {
                    options.rangeSq = distSq;
                    options.agentNo = this.agents[i].id;
                }
            }
        }
        else {

            let distSqLeft = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left_].minX_ - position.x)) + RVOMath.sqr(Math.max(0.0, position.x - this.agentTree[this.agentTree[node].left_].maxX_)) + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left_].minY_ - position.y)) + RVOMath.sqr(Math.max(0.0, position.y - this.agentTree[this.agentTree[node].left_].maxY_));
            let distSqRight = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right_].minX_ - position.x)) + RVOMath.sqr(Math.max(0.0, position.x - this.agentTree[this.agentTree[node].right_].maxX_)) + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right_].minY_ - position.y)) + RVOMath.sqr(Math.max(0.0, position.y - this.agentTree[this.agentTree[node].right_].maxY_));

            if (distSqLeft < distSqRight) {
                if (distSqLeft < options.rangeSq) {
                    this.queryAgentTreeRecursiveByVector2D(position, options, this.agentTree[node].left_);

                    if (distSqRight < options.rangeSq) {
                        this.queryAgentTreeRecursiveByVector2D(position, options, this.agentTree[node].right_);
                    }
                }
            }
            else {
                if (distSqRight < options.rangeSq) {
                    this.queryAgentTreeRecursiveByVector2D(position, options, this.agentTree[node].right_);

                    if (distSqLeft < options.rangeSq) {
                        this.queryAgentTreeRecursiveByVector2D(position, options, this.agentTree[node].left_);
                    }
                }
            }
        }
    }

    /**
     * Recursive method for computing the agent neighbors of the specified agent.
     *
     * @private
     * @param {Agent} agent The agent for which agent neighbors are to be computed.
     * @param {number} rangeSq The squared range around the agent.
     * @param {number} node The current agent k-D tree node index.
     * @return {*}  {number}
     * @memberof KdTree
     */
    private queryAgentTreeRecursive(agent: Agent, rangeSq: number, node: number): number {

        if (this.agentTree[node].end_ - this.agentTree[node].begin_ <= this.MAX_LEAF_SIZE) {
            for (let i = this.agentTree[node].begin_; i < this.agentTree[node].end_; ++i) {
                // rangeSq = agent.insertAgentNeighbor(this.agents[i], rangeSq);
                agent.insertAgentNeighbor(this.agents[i], rangeSq);
            }
        }
        else {
            let distSqLeft = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left_].minX_ - agent.position.x))
                + RVOMath.sqr(Math.max(0.0, agent.position.x - this.agentTree[this.agentTree[node].left_].maxX_))
                + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].left_].minY_ - agent.position.y))
                + RVOMath.sqr(Math.max(0.0, agent.position.y - this.agentTree[this.agentTree[node].left_].maxY_));

            let distSqRight = RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right_].minX_ - agent.position.x))
                + RVOMath.sqr(Math.max(0.0, agent.position.x - this.agentTree[this.agentTree[node].right_].maxX_))
                + RVOMath.sqr(Math.max(0.0, this.agentTree[this.agentTree[node].right_].minY_ - agent.position.y))
                + RVOMath.sqr(Math.max(0.0, agent.position.y - this.agentTree[this.agentTree[node].right_].maxY_));

            if (distSqLeft < distSqRight) {
                if (distSqLeft < rangeSq) {
                    // rangeSq = this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left_);
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left_);

                    if (distSqRight < rangeSq) {
                        // rangeSq = this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right_);
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right_);
                    }
                }
            }
            else {
                if (distSqRight < rangeSq) {
                    // rangeSq = this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right_);
                    this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].right_);

                    if (distSqLeft < rangeSq) {
                        // rangeSq = this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left_);
                        this.queryAgentTreeRecursive(agent, rangeSq, this.agentTree[node].left_);
                    }
                }
            }
        }
        return rangeSq;
    }
    /**
     * Recursive method for computing the obstacle neighbors of the specified agent.
     *
     * @private
     * @param {Agent} agent The agent for which obstacle neighbors are to be computed.
     * @param {number} rangeSq The squared range around the agent.
     * @param {ObstacleTreeNode} node The current obstacle k-D node.
     * @memberof KdTree
     */
    private queryObstacleTreeRecursive(agent: Agent, rangeSq: number, node: ObstacleTreeNode) {

        if (node != null) {
            let obstacle1: Obstacle = node.obstacle_;
            let obstacle2: Obstacle = obstacle1.next;

            let agentLeftOfLine = RVOMath.leftOf(obstacle1.point, obstacle2.point, agent.position);

            this.queryObstacleTreeRecursive(agent, rangeSq, agentLeftOfLine >= 0.0 ? node.left_ : node.right_);

            let distSqLine = RVOMath.sqr(agentLeftOfLine) / RVOMath.absSq(obstacle2.point.minus(obstacle1.point));

            if (distSqLine < rangeSq) {
                if (agentLeftOfLine < 0.0) {
                    /*
                     * Try obstacle at this node only if agent is on right side of
                     * obstacle (and can see obstacle).
                     */
                    agent.insertObstacleNeighbor(node.obstacle_, rangeSq);
                }

                /* Try other side of line. */
                this.queryObstacleTreeRecursive(agent, rangeSq, agentLeftOfLine >= 0.0 ? node.right_ : node.left_);
            }
        }
    }
    /**
     * Recursive method for querying the visibility between two points within a specified radius.
     *
     * @private
     * @param {Vector2D} q1 The first point between which visibility is to be tested.
     * @param {Vector2D} q2 The second point between which visibility is to be tested.
     * @param {number} radius The radius within which visibility is to be tested.
     * @param {ObstacleTreeNode} node The current obstacle k-D node.
     * @return {*}  {boolean} True if q1 and q2 are mutually visible within the radius; false otherwise.
     * @memberof KdTree
     */
    private queryVisibilityRecursive(q1: Vector2D, q2: Vector2D, radius: number, node: ObstacleTreeNode): boolean {

        if (node == null) {
            return true;
        }

        let obstacle1: Obstacle = node.obstacle_;
        let obstacle2: Obstacle = obstacle1.next;

        let q1LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q1);
        let q2LeftOfI = RVOMath.leftOf(obstacle1.point, obstacle2.point, q2);
        let invLengthI = 1.0 / RVOMath.absSq(obstacle2.point.minus(obstacle1.point));

        if (q1LeftOfI >= 0.0 && q2LeftOfI >= 0.0) {
            return this.queryVisibilityRecursive(q1, q2, radius, node.left_) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || this.queryVisibilityRecursive(q1, q2, radius, node.right_));
        }

        if (q1LeftOfI <= 0.0 && q2LeftOfI <= 0.0) {
            return this.queryVisibilityRecursive(q1, q2, radius, node.right_) && ((RVOMath.sqr(q1LeftOfI) * invLengthI >= RVOMath.sqr(radius) && RVOMath.sqr(q2LeftOfI) * invLengthI >= RVOMath.sqr(radius)) || this.queryVisibilityRecursive(q1, q2, radius, node.left_));
        }

        if (q1LeftOfI >= 0.0 && q2LeftOfI <= 0.0) {
            /* One can see through obstacle from left to right. */
            return this.queryVisibilityRecursive(q1, q2, radius, node.left_) && this.queryVisibilityRecursive(q1, q2, radius, node.right_);
        }

        let point1LeftOfQ = RVOMath.leftOf(q1, q2, obstacle1.point);
        let point2LeftOfQ = RVOMath.leftOf(q1, q2, obstacle2.point);
        let invLengthQ = 1.0 / RVOMath.absSq(q2.minus(q1));

        return point1LeftOfQ * point2LeftOfQ >= 0.0 && RVOMath.sqr(point1LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && RVOMath.sqr(point2LeftOfQ) * invLengthQ > RVOMath.sqr(radius) && this.queryVisibilityRecursive(q1, q2, radius, node.left_) && this.queryVisibilityRecursive(q1, q2, radius, node.right_);

    }
}

class FloatPair {

    public a = 0;
    public b = 0;

    constructor(a: number = 0, b: number = 0) {
        this.a = a;
        this.b = b;
    }

    // < 小于 
    _mt(rhs: FloatPair): boolean {
        return this.a < rhs.a || !(rhs.a < this.a) && this.b < rhs.b;
    }

    // <= 小于等于
    _met(rhs: FloatPair): boolean {
        return (this.a == rhs.a && this.b == rhs.b) || this._mt(rhs);
    }


    // > 大于
    _gt(rhs: FloatPair): boolean {
        return !this._met(rhs);
    }

    // >= 大于等于
    _get(rhs: FloatPair): boolean {
        return !this._mt(rhs);
    }
}


class AgentTreeNode {
    begin_ = 0;
    end_ = 0;
    left_ = 0;
    right_ = 0;
    maxX_ = 0;
    maxY_ = 0;
    minX_ = 0;
    minY_ = 0;
}

class ObstacleTreeNode {
    obstacle_: Obstacle;
    left_: ObstacleTreeNode;
    right_: ObstacleTreeNode;
}
