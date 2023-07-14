import RVOMath from "./RVOMath";
import Simulator from "./Simulator";
import Vector2D from "./Vector2D";
import Obstacle from "./Obstacle";
import Line from "./Line";

export interface IAgent {
    neighborDist: number;
    maxNeighbors: number;
    timeHorizon: number;
    timeHorizonObst: number;
    radius: number;
    maxSpeed: number;
    velocity: Vector2D;
}
export default class Agent implements IAgent {
    public id = 0;
    public simulator: Simulator = null;
    public agentNeighbors: KeyValuePair<number, Agent>[] = [];
    public maxNeighbors = 0;
    public maxSpeed = 0.0;
    public neighborDist = 0.0;
    private _newVelocity: Vector2D = new Vector2D();
    public obstacleNeighbors: KeyValuePair<number, Obstacle>[] = [];
    public orcaLines: Line[] = [];
    public position: Vector2D = null;

    public prefVelocity: Vector2D = new Vector2D();

    public radius = 0.0;
    public timeHorizon = 0.0;
    public timeHorizonObst = 0.0;
    public velocity: Vector2D;

    public needDelete = false;


    /* Computes the neighbors of this agent. */
    public computeNeighbors() {
        this.obstacleNeighbors.length = 0;
        let rangeSq = RVOMath.sqr(this.timeHorizonObst * this.maxSpeed + this.radius);
        this.simulator.kdTree.computeObstacleNeighbors(this, rangeSq);

        this.agentNeighbors.length = 0;
        if (this.maxNeighbors > 0) {
            rangeSq = RVOMath.sqr(this.neighborDist);
            this.simulator.kdTree.computeAgentNeighbors(this, rangeSq);
        }
    }

    /* Computes the new velocity of this agent. */
    public computeNewVelocity() {
        this.orcaLines.length = 0;
        let invTimeHorizonObst = 1.0 / this.timeHorizonObst;

        /* Create obstacle ORCA lines. */
        for (let i = 0; i < this.obstacleNeighbors.length; ++i) {
            let obstacle1: Obstacle = this.obstacleNeighbors[i].value;
            let obstacle2: Obstacle = obstacle1.next;

            let relativePosition1: Vector2D = obstacle1.point.minus(this.position);
            let relativePosition2: Vector2D = obstacle2.point.minus(this.position);

            /*
            * Check if velocity obstacle of obstacle is already taken care
            * of by previously constructed obstacle ORCA lines.
            */
            let alreadyCovered = false;

            for (let j = 0; j < this.orcaLines.length; ++j) {
                let orcaLine = this.orcaLines[j]
                if (RVOMath.det(relativePosition1.scale(invTimeHorizonObst).minus(orcaLine.point), orcaLine.direction) - invTimeHorizonObst * this.radius >= -RVOMath.RVO_EPSILON
                    && RVOMath.det(relativePosition2.scale(invTimeHorizonObst).minus(orcaLine.point), orcaLine.direction) - invTimeHorizonObst * this.radius >= -RVOMath.RVO_EPSILON) {
                    alreadyCovered = true;
                    break;
                }
            }
            if (alreadyCovered) {
                continue;
            }

            /* Not yet covered. Check for collisions. */
            let distSq1 = RVOMath.absSq(relativePosition1);
            let distSq2 = RVOMath.absSq(relativePosition2);

            let radiusSq = RVOMath.sqr(this.radius);

            let obstacleVector: Vector2D = obstacle2.point.minus(obstacle1.point);
            let s = relativePosition1.scale(-1).multiply(obstacleVector) / RVOMath.absSq(obstacleVector);
            let distSqLine = RVOMath.absSq(relativePosition1.scale(-1).minus(obstacleVector.scale(s)));

            let line: Line = new Line();
            if (s < 0.0 && distSq1 <= radiusSq) {
                /* Collision with left vertex. Ignore if non-convex. */
                if (obstacle1.isConvex) {
                    line.point = new Vector2D();
                    line.direction = RVOMath.normalize(new Vector2D(-relativePosition1.y, relativePosition1.x));
                    this.orcaLines.push(line);
                }
                continue;
            } else if (s > 1.0 && distSq2 <= radiusSq) {
                /*
                 * Collision with right vertex. Ignore if non-convex or if
                 * it will be taken care of by neighboring obstacle.
                 */
                if (obstacle2.isConvex && RVOMath.det(relativePosition2, obstacle2.direction) >= 0.0) {
                    line.point = new Vector2D();
                    line.direction = RVOMath.normalize(new Vector2D(-relativePosition2.y, -relativePosition2.x));
                    this.orcaLines.push(line);
                }
                continue;
            } else if (s >= 0.0 && s < 1.0 && distSqLine <= radiusSq) {
                /* Collision with obstacle segment. */

                line.point = new Vector2D(0.0, 0.0);
                line.direction = obstacle1.direction.scale(-1);
                this.orcaLines.push(line);
                continue;
            }
            /*
             * No collision. Compute legs. When obliquely viewed, both legs
             * can come from a single vertex. Legs extend cut-off line when
             * non-convex vertex.
             */
            let leftLegDirection: Vector2D, rightLegDirection: Vector2D;
            if (s < 0.0 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that left vertex
                 * defines velocity obstacle.
                 */
                if (!obstacle1.isConvex) {
                    /* Ignore obstacle. */
                    continue;
                }
                obstacle2 = obstacle1;

                let leg1 = Math.sqrt(distSq1 - radiusSq);
                leftLegDirection = new Vector2D(relativePosition1.x * leg1 - relativePosition1.y * this.radius, relativePosition1.x * this.radius + relativePosition1.y * leg1).scale(1 / distSq1);
                rightLegDirection = new Vector2D(relativePosition1.x * leg1 + relativePosition1.y * this.radius, -relativePosition1.x * this.radius + relativePosition1.y * leg1).scale(1 / distSq1);

            }
            else if (s > 1.0 && distSqLine <= radiusSq) {
                /*
                 * Obstacle viewed obliquely so that
                 * right vertex defines velocity obstacle.
                 */
                if (!obstacle2.isConvex) {
                    /* Ignore obstacle. */
                    continue;
                }

                obstacle1 = obstacle2;

                let leg2 = Math.sqrt(distSq2 - radiusSq);
                leftLegDirection = new Vector2D(relativePosition2.x * leg2 - relativePosition2.y * this.radius, relativePosition2.x * this.radius + relativePosition2.y * leg2).scale(1 / distSq2);
                rightLegDirection = new Vector2D(relativePosition2.x * leg2 + relativePosition2.y * this.radius, -relativePosition2.x * this.radius + relativePosition2.y * leg2).scale(1 / distSq2);
            } else {
                /* Usual situation. */
                if (obstacle1.isConvex) {
                    let leg1 = Math.sqrt(distSq1 - radiusSq);
                    leftLegDirection = new Vector2D(relativePosition1.x * leg1 - relativePosition1.y * this.radius, relativePosition1.x * this.radius + relativePosition1.y * leg1).scale(1 / distSq1);
                }
                else {
                    /* Left vertex non-convex; left leg extends cut-off line. */
                    leftLegDirection = obstacle1.direction.scale(-1);
                }

                if (obstacle2.isConvex) {
                    let leg2 = Math.sqrt(distSq2 - radiusSq);
                    rightLegDirection = new Vector2D(relativePosition2.x * leg2 + relativePosition2.y * this.radius, -relativePosition2.x * this.radius + relativePosition2.y * leg2).scale(1 / distSq2);
                }
                else {
                    /* Right vertex non-convex; right leg extends cut-off line. */
                    rightLegDirection = obstacle1.direction;
                }
            }

            /*
             * Legs can never point into neighboring edge when convex
             * vertex, take cutoff-line of neighboring edge instead. If
             * velocity projected on "foreign" leg, no constraint is added.
             */

            let leftNeighbor: Obstacle = obstacle1.previous;
            let isLeftLegForeign = false;
            let isRightLegForeign = false;
            if (obstacle1.isConvex && RVOMath.det(leftLegDirection, leftNeighbor.direction.scale(-1)) >= 0.0) {
                /* Left leg points into obstacle. */
                leftLegDirection = leftNeighbor.direction.scale(-1);
                isLeftLegForeign = true;
            }


            if (obstacle2.isConvex && RVOMath.det(rightLegDirection, obstacle2.direction) <= 0.0) {
                /* Right leg points into obstacle. */
                rightLegDirection = obstacle2.direction;
                isRightLegForeign = true;
            }
            /* Compute cut-off centers. */
            let leftCutOff = obstacle1.point.minus(this.position).scale(invTimeHorizonObst);
            let rightCutOff = obstacle2.point.minus(this.position).scale(invTimeHorizonObst);
            let cutOffVector = rightCutOff.minus(leftCutOff);
            /* Project current velocity on velocity obstacle. */

            /* Check if current velocity is projected on cutoff circles. */
            let t = obstacle1 == obstacle2 ? 0.5 : this.velocity.minus(leftCutOff).multiply(cutOffVector) / RVOMath.absSq(cutOffVector);
            let tLeft = this.velocity.minus(leftCutOff).multiply(leftLegDirection);
            let tRight = this.velocity.minus(rightCutOff).multiply(rightLegDirection);
            if ((t < 0.0 && tLeft < 0.0) || (obstacle1 == obstacle2 && tLeft < 0.0 && tRight < 0.0)) {
                /* Project on left cut-off circle. */
                let unitW = RVOMath.normalize(this.velocity.minus(leftCutOff));

                line.direction = new Vector2D(unitW.y, -unitW.x);
                line.point = leftCutOff.plus(unitW.scale(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);
                continue;
            } else if (t > 1.0 && tRight < 0.0) {
                /* Project on right cut-off circle. */
                let unitW = RVOMath.normalize(this.velocity.minus(rightCutOff));

                line.direction = new Vector2D(unitW.y, -unitW.x);
                line.point = rightCutOff.plus(unitW.scale(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);

                continue;
            }
            /*
            * Project on left leg, right leg, or cut-off line, whichever is
            * closest to velocity.
            */

            let distSqCutoff = (t < 0.0 || t > 1.0 || obstacle1 == obstacle2) ? Number.POSITIVE_INFINITY : RVOMath.absSq(this.velocity.minus(leftCutOff.plus(cutOffVector.scale(t))));
            let distSqLeft = tLeft < 0.0 ? Number.POSITIVE_INFINITY : RVOMath.absSq(this.velocity.minus(leftCutOff.plus(leftLegDirection.scale(tLeft))));
            let distSqRight = tRight < 0.0 ? Number.POSITIVE_INFINITY : RVOMath.absSq(this.velocity.minus(rightCutOff.plus(rightLegDirection.scale(tRight))));

            if (distSqCutoff <= distSqLeft && distSqCutoff <= distSqRight) {
                /* Project on cut-off line. */
                line.direction = obstacle1.direction.scale(-1);
                line.point = leftCutOff.plus(new Vector2D(-line.direction.y, line.direction.x).scale(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);

                continue;
            }


            if (distSqLeft <= distSqRight) {
                /* Project on left leg. */
                if (isLeftLegForeign) {
                    continue;
                }

                line.direction = leftLegDirection;
                line.point = leftCutOff.plus(new Vector2D(-line.direction.y, line.direction.x).scale(this.radius * invTimeHorizonObst));
                this.orcaLines.push(line);

                continue;
            }

            /* Project on right leg. */
            if (isRightLegForeign) {
                continue;
            }
            line.direction = rightLegDirection.scale(-1);
            line.point = rightCutOff.plus(new Vector2D(-line.direction.y, line.direction.x).scale(this.radius * invTimeHorizonObst));
            this.orcaLines.push(line);

        }
        let numObstLines = this.orcaLines.length;
        let invTimeHorizon = 1.0 / this.timeHorizon;
        /* Create agent ORCA lines. */
        for (let i = 0; i < this.agentNeighbors.length; ++i) {
            let other: Agent = this.agentNeighbors[i].value;

            let relativePosition = other.position.minus(this.position);
            let relativeVelocity = this.velocity.minus(other.velocity);
            let distSq = RVOMath.absSq(relativePosition);
            let combinedRadius = this.radius + other.radius;
            let combinedRadiusSq = RVOMath.sqr(combinedRadius);

            let line: Line = new Line();
            let u: Vector2D = null;
            if (distSq > combinedRadiusSq) {

                /* No collision. */
                let w = relativeVelocity.minus(relativePosition.scale(invTimeHorizon));

                /* Vector from cutoff center to relative velocity. */
                let wLengthSq = RVOMath.absSq(w);
                let dotProduct1 = relativePosition.multiply(w);
                if (dotProduct1 < 0.0 && RVOMath.sqr(dotProduct1) > combinedRadiusSq * wLengthSq) {
                    /* Project on cut-off circle. */
                    let wLength = Math.sqrt(wLengthSq);
                    let unitW = w.scale(1 / wLength);

                    line.direction = new Vector2D(unitW.y, -unitW.x);
                    u = unitW.scale(combinedRadius * invTimeHorizon - wLength);
                } else {
                    /* Project on legs. */
                    let leg = Math.sqrt(distSq - combinedRadiusSq);

                    if (RVOMath.det(relativePosition, w) > 0.0) {
                        /* Project on left leg. */
                        line.direction = new Vector2D(relativePosition.x * leg - relativePosition.y * combinedRadius, relativePosition.x * combinedRadius + relativePosition.y * leg).scale(1 / distSq);
                    }
                    else {
                        /* Project on right leg. */
                        line.direction = new Vector2D(relativePosition.x * leg + relativePosition.y * combinedRadius, -relativePosition.x * combinedRadius + relativePosition.y * leg).scale(-1 / distSq);
                    }

                    let dotProduct2 = relativeVelocity.multiply(line.direction);
                    u = line.direction.scale(dotProduct2).minus(relativeVelocity);
                }

            }
            else {
                /* Collision. Project on cut-off circle of time timeStep. */
                let invTimeStep = 1.0 / this.simulator.timeStep;

                /* Vector from cutoff center to relative velocity. */
                let w = relativeVelocity.minus(relativePosition.scale(invTimeStep));

                let wLength = RVOMath.abs(w);
                let unitW = w.scale(1 / wLength);

                line.direction = new Vector2D(unitW.y, -unitW.x);
                u = unitW.scale(combinedRadius * invTimeStep - wLength);
            }
            line.point = this.velocity.plus(u.scale(0.5));
            this.orcaLines.push(line);
        }
        let lineFail = this.linearProgram2(this.orcaLines, this.maxSpeed, this.prefVelocity, false, this._newVelocity);

        if (lineFail < this.orcaLines.length) {
            this.linearProgram3(this.orcaLines, numObstLines, lineFail, this.maxSpeed, this._newVelocity);
        }
    }

    /**
     * Inserts an agent neighbor into the set of neighbors of this agent
     *
     * @param {Agent} agent A pointer to the agent to be inserted.
     * @param {number} rangeSq The squared range around this agent.
     * @return {*} 
     * @memberof Agent
     */
    insertAgentNeighbor(agent: Agent, rangeSq: number) {
        if (this != agent) {
            let distSq = RVOMath.absSq(this.position.minus(agent.position));

            if (distSq < rangeSq) {
                if (this.agentNeighbors.length < this.maxNeighbors) {
                    this.agentNeighbors.push(new KeyValuePair<number, Agent>(distSq, agent));
                }

                let i = this.agentNeighbors.length - 1;

                while (i != 0 && distSq < this.agentNeighbors[i - 1].key) {
                    this.agentNeighbors[i] = this.agentNeighbors[i - 1];
                    --i;
                }

                this.agentNeighbors[i] = new KeyValuePair<number, Agent>(distSq, agent);

                if (this.agentNeighbors.length == this.maxNeighbors) {
                    rangeSq = this.agentNeighbors[this.agentNeighbors.length - 1].key;
                }
            }
        }
        return rangeSq;
    }

    /**
     * Inserts a static obstacle neighbor into the set of neighbors of this agent.
     *
     * @param {Obstacle} obstacle The number of the static obstacle to be inserted.
     * @param {number} rangeSq The squared range around this agent.
     * @memberof Agent
     */
    insertObstacleNeighbor(obstacle: Obstacle, rangeSq: number) {

        let nextObstacle: Obstacle = obstacle.next;

        let distSq = RVOMath.distSqPointLineSegment(obstacle.point, nextObstacle.point, this.position);

        if (distSq < rangeSq) {
            this.obstacleNeighbors.push(new KeyValuePair<number, Obstacle>(distSq, obstacle));

            let i = this.obstacleNeighbors.length - 1;

            while (i != 0 && distSq < this.obstacleNeighbors[i - 1].key) {
                this.obstacleNeighbors[i] = this.obstacleNeighbors[i - 1];
                --i;
            }
            this.obstacleNeighbors[i] = new KeyValuePair<number, Obstacle>(distSq, obstacle);
        }
    }

    /**
     * Updates the two-dimensional position and two-dimensional velocity of this agent.
     *
     * @param {number} dt
     * @memberof Agent
     */
    update(dt: number) {
        this.velocity = this._newVelocity;
        this.position.set(this.position.plus(this.velocity.scale(dt)));
    }
    /**
     * Solves a one-dimensional linear program on a specified line
     * subject to linear constraints defined by lines and a circular
     * constraint.
     *
     * @param {Line[]} lines Lines defining the linear constraints.
     * @param {number} lineNo The specified line constraint.
     * @param {number} radius The radius of the circular constraint.
     * @param {Vector2D} optVelocity The optimization velocity.
     * @param {boolean} directionOpt True if the direction should be optimized.
     * @param {Vector2D} result A reference to the result of the linear program.
     * @return {boolean}  True if successful
     * @memberof Agent
     */
    linearProgram1(lines: Line[], lineNo: number, radius: number, optVelocity: Vector2D, directionOpt: boolean, result: Vector2D) {
        let dotProduct = lines[lineNo].point.multiply(lines[lineNo].direction);
        let discriminant = RVOMath.sqr(dotProduct) + RVOMath.sqr(radius) - RVOMath.absSq(lines[lineNo].point);

        if (discriminant < 0.0) {
            /* Max speed circle fully invalidates line lineNo. */
            return false;
        }

        let sqrtDiscriminant = Math.sqrt(discriminant);
        let tLeft = -dotProduct - sqrtDiscriminant;
        let tRight = -dotProduct + sqrtDiscriminant;

        for (let i = 0; i < lineNo; ++i) {
            let denominator = RVOMath.det(lines[lineNo].direction, lines[i].direction);
            let numerator = RVOMath.det(lines[i].direction, lines[lineNo].point.minus(lines[i].point));

            if (Math.abs(denominator) <= RVOMath.RVO_EPSILON) {
                /* Lines lineNo and i are (almost) parallel. */
                if (numerator < 0.0) {
                    return false;
                }

                continue;
            }

            let t = numerator / denominator;

            if (denominator >= 0.0) {
                /* Line i bounds line lineNo on the right. */
                tRight = Math.min(tRight, t);
            }
            else {
                /* Line i bounds line lineNo on the left. */
                tLeft = Math.max(tLeft, t);
            }

            if (tLeft > tRight) {
                return false;
            }
        }

        if (directionOpt) {
            /* Optimize direction. */
            if (optVelocity.multiply(lines[lineNo].direction) > 0.0) {
                /* Take right extreme. */
                result.set(lines[lineNo].point.plus(lines[lineNo].direction.scale(tRight)));
            }
            else {
                /* Take left extreme. */
                result.set(lines[lineNo].point.plus(lines[lineNo].direction.scale(tLeft)));
            }
        }
        else {
            /* Optimize closest point. */
            let t = lines[lineNo].direction.multiply(optVelocity.minus(lines[lineNo].point));

            if (t < tLeft) {
                result.set(lines[lineNo].point.plus(lines[lineNo].direction.scale(tLeft)));
            }
            else if (t > tRight) {
                result.set(lines[lineNo].point.plus(lines[lineNo].direction.scale(tRight)));
            }
            else {
                result.set(lines[lineNo].point.plus(lines[lineNo].direction.scale(t)));
            }
        }

        return true;
    }



    /**
     * Solves a two-dimensional linear program subject to linear
     * constraints defined by lines and a circular constraint.
     *
     * @param {Line[]} lines Lines defining the linear constraints.
     * @param {number} radius The radius of the circular constraint.
     * @param {Vector2D} optVelocity The optimization velocity.
     * @param {boolean} directionOpt True if the direction should be optimized.
     * @param {Vector2D} result A reference to the result of the linear program.
     * @return {boolean} The number of the line it fails on, and the number of lines if successful.
     * 
     * @memberof Agent
     */
    linearProgram2(lines: Line[], radius: number, optVelocity: Vector2D, directionOpt: boolean, result: Vector2D) {
        if (directionOpt) {
            /*
             * Optimize direction. Note that the optimization velocity is of
             * unit length in this case.
             */
            result.set(optVelocity.scale(radius));
        }
        else if (RVOMath.absSq(optVelocity) > RVOMath.sqr(radius)) {
            /* Optimize closest point and outside circle. */
            result.set(RVOMath.normalize(optVelocity).scale(radius));
        }
        else {
            /* Optimize closest point and inside circle. */
            result.set(optVelocity);
        }

        for (let i = 0; i < lines.length; ++i) {
            if (RVOMath.det(lines[i].direction, lines[i].point.minus(result)) > 0.0) {
                /* Result does not satisfy constraint i. Compute new optimal result. */
                // let tempResult = result;
                let tmpX = result.x;
                let tmpY = result.y;
                if (!this.linearProgram1(lines, i, radius, optVelocity, directionOpt, result)) {
                    result.set(tmpX, tmpY);
                    return i;
                }
            }
        }

        return lines.length;
    }

    /**
     * Solves a two-dimensional linear program subject to linear
     * constraints defined by lines and a circular constraint.
     *
     * @param {Line[]} lines Lines defining the linear constraints.
     * @param {number} numObstLines numObstLines">Count of obstacle lines.
     * @param {number} beginLineThe line on which the 2-d linear program failed.
     * @param {number} radius The radius of the circular constraint.
     * @param {Vector2D} result A reference to the result of the linear program.
     * @memberof Agent
     */
    linearProgram3(lines: Line[], numObstLines: number, beginLine: number, radius: number, result: Vector2D) {

        let distance = 0.0;

        for (let i = beginLine; i < lines.length; ++i) {
            if (RVOMath.det(lines[i].direction, lines[i].point.minus(result)) > distance) {
                /* Result does not satisfy constraint of line i. */
                let projLines: Line[] = [];
                for (let ii = 0; ii < numObstLines; ++ii) {
                    projLines.push(lines[ii]);
                }

                for (let j = numObstLines; j < i; ++j) {
                    let line: Line = new Line();

                    let determinant = RVOMath.det(lines[i].direction, lines[j].direction);

                    if (Math.abs(determinant) <= RVOMath.RVO_EPSILON) {
                        /* Line i and line j are parallel. */
                        if (lines[i].direction.multiply(lines[j].direction) > 0.0) {
                            /* Line i and line j point in the same direction. */
                            continue;
                        }
                        else {
                            /* Line i and line j point in opposite direction. */
                            line.point = (lines[i].point.plus(lines[j].point)).scale(0.5);
                        }
                    }
                    else {
                        line.point = lines[i].point.plus(lines[i].direction.scale(RVOMath.det(lines[j].direction, lines[i].point.minus(lines[j].point)) / determinant));
                    }

                    line.direction = RVOMath.normalize(lines[j].direction.minus(lines[i].direction));
                    projLines.push(line);
                }

                let tmpX = result.x;
                let tmpY = result.y;
                if (this.linearProgram2(projLines, radius, new Vector2D(-lines[i].direction.y, lines[i].direction.x), true, result) < projLines.length) {
                    /*
                     * This should in principle not happen. The result is by
                     * definition already in the feasible region of this
                     * linear program. If it fails, it is due to small
                     * floating point error, and the current result is kept.
                     */
                    result.set(tmpX, tmpY);
                }

                distance = RVOMath.det(lines[i].direction, lines[i].point.minus(result));
            }
        }
    }
}


class KeyValuePair<K, V> {
    public declare key: K;
    public declare value: V;

    constructor(key: K, value: V) {
        this.key = key
        this.value = value
    }
}
