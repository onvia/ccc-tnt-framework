
import Vector2D from "./Vector2D";
import Obstacle from "./Obstacle";
import Agent, { IAgent } from "./Agent";
import RVOMath from "./RVOMath";
import KdTree from "./KdTree";
import Line from "./Line";



let s_totalID = 0;
export default class Simulator {

    public agents: Agent[] = [];
    public obstacles: Obstacle[] = [];
    // private _goals: Vector2D[] = [];
    public kdTree: KdTree = new KdTree();

    public timeStep = 0.25;
    private defaultAgent: IAgent; // Agent
    private globalTime = 0;
    private delDirty = false;

    private agentNo2indexDict: Record<number, number> = {};
    private index2agentNoDict: Record<number, number> = {};
    private needDelArray: number[] = [];

    constructor() {
        this.kdTree.simulator = this;
        this.kdTree.MAX_LEAF_SIZE = 1000;
    }

    /**
     * Sets the default properties for any new agent that is added.
     *
     * @param {number} neighborDistThe default maximum distance (center point
     * to center point) to other agents a new agent takes into account in
     * the navigation. The larger this number, the longer he running time of
     * the simulation. If the number is too low, the simulation will not be
     * safe. Must be non-negative.
     * @param {number} maxNeighbors The default maximum number of other agents
     * a new agent takes into account in the navigation. The larger this
     * number, the longer the running time of the simulation. If the number
     * is too low, the simulation will not be safe.<
     * @param {number} timeHorizon The default minimal amount of time for
     * which a new agent's velocities that are computed by the simulation
     * are safe with respect to other agents. The larger this number, the
     * sooner an agent will respond to the presence of other agents, but the
     * less freedom the agent has in choosing its velocities. Must be
     * positive.
     * @param {number} timeHorizonObst The default minimal amount of time for
     * which a new agent's velocities that are computed by the simulation
     * are safe with respect to obstacles. The larger this number, the
     * sooner an agent will respond to the presence of obstacles, but the
     * less freedom the agent has in choosing its velocities. Must be
     * positive.
     * @param {number} radius The default radius of a new agent. Must be non-negative.
     * @param {number} maxSpeed The default maximum speed of a new agent. Must be non-negative.
     * @param {Vector2D} velocity The default initial two-dimensional linear velocity of a new agent.
     *
     */
    setAgentDefaults(
        neighborDist: number,
        maxNeighbors: number,
        timeHorizon: number,
        timeHorizonObst: number,
        radius: number,
        maxSpeed: number,
        velocityX: number = 0, velocityY: number = 0) {
        if (this.defaultAgent == null) {
            this.defaultAgent = {
                neighborDist,
                maxNeighbors,
                timeHorizon,
                timeHorizonObst,
                radius,
                maxSpeed,
                velocity: new Vector2D(velocityX, velocityY),
            };
        } else {
            this.defaultAgent.maxNeighbors = maxNeighbors;
            this.defaultAgent.maxSpeed = maxSpeed;
            this.defaultAgent.neighborDist = neighborDist;
            this.defaultAgent.radius = radius;
            this.defaultAgent.timeHorizon = timeHorizon;
            this.defaultAgent.timeHorizonObst = timeHorizonObst;
            this.defaultAgent.velocity = new Vector2D(velocityX, velocityY);
        }
    }
    getAgentDefaults() {
        return this.defaultAgent;
    }
    delAgent(agentNo: number) {
        let index = this.agentNo2indexDict[agentNo];
        if (typeof index == 'number') {
            // this.agents[index].needDelete = true;
            this.delDirty = true;
            this.needDelArray.push(agentNo);
        }
    }

    updateDeleteAgent() {
        if (this.delDirty) {
            // let isDelete = false;
            for (let i = 0; i < this.needDelArray.length; i++) {
                const agentNo = this.needDelArray[i];
                let index = this.agentNo2indexDict[agentNo];

                if (index >= 0) {

                    this.agents[index] = this.agents[this.agents.length - 1];
                    this.agents.length--;
                    // isDelete = true;

                    if (this.agents[index]) {
                        delete this.agentNo2indexDict[agentNo];
                        delete this.index2agentNoDict[this.agents.length];
                        let newAgentNo = this.agents[index].id
                        this.agentNo2indexDict[newAgentNo] = index;
                        this.index2agentNoDict[index] = newAgentNo;
                    }
                }
            }
            // if (isDelete) {
            //     this.onDelAgent();
            // }
            this.delDirty = false;
            this.needDelArray.length = 0;
        }
    }

    /**
     * Adds a new agent with default properties to the simulation.
     *
     * @param {Vector2D} positionThe two-dimensional starting position of this agent.
     * @param {IAgent} [agentConfig]
     * @return {*}  The number of the agent, or -1 when the agent defaults have  not been set.
     *
     */
    addAgent(position: Vector2D, agentConfig?: IAgent) {
        if (!this.defaultAgent && !agentConfig) {
            throw new Error("no default agent");
        }
        let _agentConfig = agentConfig || this.defaultAgent;
        if (!position) {
            position = new Vector2D();
        }
        let agent: Agent = new Agent();
        agent.id = s_totalID;
        s_totalID++;
        agent.maxNeighbors = _agentConfig.maxNeighbors;
        agent.maxSpeed = _agentConfig.maxSpeed;
        agent.neighborDist = _agentConfig.neighborDist;
        agent.position = position;
        agent.radius = _agentConfig.radius;
        agent.timeHorizon = _agentConfig.timeHorizon;
        agent.timeHorizonObst = _agentConfig.timeHorizonObst;
        agent.velocity = _agentConfig.velocity;
        agent.simulator = this;
        this.agents.push(agent);
        this.onAddAgent();
        return agent.id;
    }

    // private onDelAgent() {
    //     this.agentNo2indexDict = {};
    //     this.index2agentNoDict = {};

    //     for (let i = 0; i < this.agents.length; i++) {
    //         let agentNo = this.agents[i].id;
    //         this.agentNo2indexDict[agentNo] = i;
    //         this.index2agentNoDict[i] = agentNo;
    //     }
    // }

    private onAddAgent() {
        if (this.agents.length == 0)
            return;

        let index = this.agents.length - 1;
        let agentNo = this.agents[index].id;
        this.agentNo2indexDict[agentNo] = index;
        this.index2agentNoDict[index] = agentNo;
    }

    /**
     * Adds a new obstacle to the simulation.
     * 
     * To add a "negative" obstacle, e.g. a bounding polygon around
     * the environment, the vertices should be listed in clockwise order.
     * @param {Vector2D[]} vertices List of the vertices of the polygonal obstacle in counterclockwise order.
     * @return {*}  The number of the first vertex of the obstacle, or -1 when the number of vertices is less than two.
     *
     */
    addObstacle(vertices: Vector2D[]) {
        if (vertices.length < 2) {
            return -1;
        }
        let obstacleNo = this.obstacles.length;

        for (let i = 0; i < vertices.length; ++i) {
            let obstacle = new Obstacle();
            obstacle.point = vertices[i];

            if (i != 0) {
                obstacle.previous = this.obstacles[this.obstacles.length - 1];
                obstacle.previous.next = obstacle;
            }

            if (i == vertices.length - 1) {
                obstacle.next = this.obstacles[obstacleNo];
                obstacle.next.previous = obstacle;
            }

            obstacle.direction = RVOMath.normalize(vertices[(i == vertices.length - 1 ? 0 : i + 1)].minus(vertices[i]));

            if (vertices.length == 2) {
                obstacle.isConvex = true;
            }
            else {
                obstacle.isConvex = (RVOMath.leftOf(vertices[(i == 0 ? vertices.length - 1 : i - 1)], vertices[i], vertices[(i == vertices.length - 1 ? 0 : i + 1)]) >= 0.0);
            }

            obstacle.id = this.obstacles.length;
            this.obstacles.push(obstacle);
        }

        return obstacleNo;
    }

    /**
     * Performs a simulation step and updates the two-dimensional position and two-dimensional velocity of each agent.
     * 
     * @param {*} dt
     */
    update(dt) {
        this.updateDeleteAgent();

        if (this.timeStep != 0) {
            dt = this.timeStep;
        }

        this.kdTree.buildAgentTree();


        for (let i = 0; i < this.getNumAgents(); i++) {
            this.agents[i].computeNeighbors();
            this.agents[i].computeNewVelocity();
        }
        for (let i = 0; i < this.getNumAgents(); i++) {
            this.agents[i].update(dt);
        }

        this.globalTime += dt;

        return this.globalTime;
    }

    getAgent(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]];
    }
    /**
     * Returns the specified agent neighbor of the specified agent.
     *
     * @param {number} agentNo The number of the agent whose agent neighbor is to be retrieved.
     * @param {number} neighborNo The number of the agent neighbor to be retrieved.
     * @return {*}  The number of the neighboring agent.
     *
     */
    getAgentAgentNeighbor(agentNo: number, neighborNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].agentNeighbors[neighborNo].value.id;
    }

    /**
     * Returns the maximum neighbor count of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose maximum neighbor count is to be retrieved.
     * @return {*} The present maximum neighbor count of the agent.
     * 
     */
    getAgentMaxNeighbors(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].maxNeighbors;
    }

    /**
     * Returns the maximum speed of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose maximum speed is to be retrieved.
     * @return {*} The present maximum speed of the agent.
     *
     */
    getAgentMaxSpeed(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].maxSpeed;
    }

    /**
     * Returns the maximum neighbor distance of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose maximum neighbor distance is to be retrieved.
     * @return {*} The present maximum neighbor distance of the agent.
     *
     */
    getAgentNeighborDist(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].neighborDist;
    }

    /**
     * Returns the count of agent neighbors taken into account to compute the current velocity for the specified agent.
     *
     * @param {number} agentNo The number of the agent whose count of agent neighbors is to be retrieved.
     * @return {*} The count of agent neighbors taken into account to compute the current velocity for the specified agent.
     *
     */
    getAgentNumAgentNeighbors(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].agentNeighbors.length;
    }
    /**
     * Returns the count of obstacle neighbors taken into account
     * to compute the current velocity for the specified agent.
     *
     * @param {number} agentNo The number of the agent whose count of obstacle neighbors is to be retrieved.
     * @return {*}  The count of obstacle neighbors taken into account to compute the current velocity for the specified agent.
     *
     */
    getAgentNumObstacleNeighbors(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].obstacleNeighbors.length;
    }

    /**
     * Returns the specified obstacle neighbor of the specified agent.
     *
     * @param {number} agentNo The number of the agent whose obstacle neighbor is to be retrieved.
     * @param {number} neighborNo The number of the obstacle neighbor to be retrieved.
     * @return {*} The number of the first vertex of the neighboring obstacle edge.
     *
     */
    getAgentObstacleNeighbor(agentNo: number, neighborNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].obstacleNeighbors[neighborNo].value.id;
    }
    /**
     * Returns the ORCA constraints of the specified agent.
     *
     * The halfplane to the left of each line is the region of
     * permissible velocities with respect to that ORCA constraint.
     * 
     * @param {number} agentNo The number of the agent whose ORCA constraints are to be retrieved.
     * @return {*} A list of lines representing the ORCA constraints.
     *
     */
    getAgentOrcaLines(agentNo: number): Line[] {
        return this.agents[this.agentNo2indexDict[agentNo]].orcaLines;
    }

    /**
     * Returns the two-dimensional position of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose two-dimensional position is to be retrieved.
     * @return {*}  The present two-dimensional position of the (center of the) agent.
     *
     */
    getAgentPosition(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].position;
    }

    /**
     * Returns the two-dimensional preferred velocity of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose two-dimensional preferred velocity is to be retrieved.
     * @return {*} The present two-dimensional preferred velocity of the agent.
     */
    getAgentPrefVelocity(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].prefVelocity;
    }

    /**
     * Returns the radius of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose radius is to be
     * retrieved.
     * @return {*} The present radius of the agent.
     */
    public getAgentRadius(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].radius;
    }

    /**
     * Returns the time horizon of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose time horizon is
     * @return {*}The present time horizon of the agent. to be retrieved.
     */
    public getAgentTimeHorizon(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].timeHorizon;
    }

    /**
     * Returns the time horizon with respect to obstacles of a
     * specified agent.
     *
     * @param {number} agentNo The number of the agent whose time horizon with
     * respect to obstacles is to be retrieved.
     * @return {*}The present time horizon with respect to obstacles of the agent.
     */
    public getAgentTimeHorizonObst(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].timeHorizonObst;
    }

    /**
     * Returns the two-dimensional linear velocity of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose two-dimensional
     * linear velocity is to be retrieved.
     * @return {*}The present two-dimensional linear velocity of the agent.
     */
    public getAgentVelocity(agentNo: number) {
        return this.agents[this.agentNo2indexDict[agentNo]].velocity;
    }

    /**
     * Returns the global time of the simulation.
     *
     * @return {*}The present global time of the simulation (zero initially).
     */
    public getGlobalTime() {
        return this.globalTime;
    }

    /**
     * Returns the count of agents in the simulation.
     *
     * @return {*}The count of agents in the simulation.
     */
    public getNumAgents() {
        return this.agents.length;
    }

    /**
     * Returns the count of obstacle vertices in the simulation.
     * 
     * @return {*}The count of obstacle vertices in the simulation.
     */
    public getNumObstacleVertices() {
        return this.obstacles.length;
    }


    /**
     * Returns the two-dimensional position of a specified obstacle
     * vertex.
     *
     * @param {number} vertexNo The number of the obstacle vertex to be
     * retrieved.
     * @return {*}The two-dimensional position of the specified obstacle
     * vertex.
     */
    public getObstacleVertex(vertexNo: number) {
        return this.obstacles[vertexNo].point;
    }

    /**
     * Returns the number of the obstacle vertex succeeding the
     * specified obstacle vertex in its polygon.
     *
     * @param {number} vertexNo The number of the obstacle vertex whose
     * successor is to be retrieved.
     * @return {*}The number of the obstacle vertex succeeding the specified
     * obstacle vertex in its polygon.
     */
    public getNextObstacleVertexNo(vertexNo: number) {
        return this.obstacles[vertexNo].next.id;
    }

    /**
     * Returns the number of the obstacle vertex preceding the
     * specified obstacle vertex in its polygon.
     *
     * @param {number} vertexNo The number of the obstacle vertex whose
     * predecessor is to be retrieved.
     * @return {*}The number of the obstacle vertex preceding the specified
     * obstacle vertex in its polygon.
     */
    public getPrevObstacleVertexNo(vertexNo: number) {
        return this.obstacles[vertexNo].previous.id;
    }

    /**
     * Returns the time step of the simulation.
     *
     * @return {*}The present time step of the simulation.
     */
    public getTimeStep() {
        return this.timeStep;
    }

    /**
     * Processes the obstacles that have been added so that they
     * are accounted for in the simulation.
     *
     * Obstacles added to the simulation after this function has
     * been called are not accounted for in the simulation.
     */
    public processObstacles() {
        this.kdTree.buildObstacleTree();
    }

    /**
     * Performs a visibility query between the two specified points
     * with respect to the obstacles.
     * 
     * @param {Vector2D} point1 The first point of the query.
     * @param {Vector2D} point2 The second point of the query.
     * @param {number} radiusThe minimal distance between the line connecting
     * the two points and the obstacles in order for the points to be
     * @return {*} A boolean specifying whether the two points are mutually
     *             visible. Returns true when the obstacles have not been processed.
     * 
     */
    public queryVisibility(point1: Vector2D, point2: Vector2D, radius: number) {
        return this.kdTree.queryVisibility(point1, point2, radius);
    }

    public queryNearAgent(point: Vector2D, radius: number) {
        if (this.getNumAgents() == 0) {
            return -1;
        }
        return this.kdTree.queryNearAgent(point, radius);
    }
    /**
     * Sets the maximum neighbor count of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose maximum neighbor
     * count is to be modified.
     * @param {number} maxNeighbors The replacement maximum neighbor count.
     * 
     */
    public setAgentMaxNeighbors(agentNo: number, maxNeighbors: number) {
        this.agents[this.agentNo2indexDict[agentNo]].maxNeighbors = maxNeighbors;
    }

    /**
     * Sets the maximum speed of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose maximum speed is
     * to be modified.
     * @param {number} maxSpeed The replacement maximum speed. Must be
     * non-negative.
     */
    public setAgentMaxSpeed(agentNo: number, maxSpeed: number) {
        this.agents[this.agentNo2indexDict[agentNo]].maxSpeed = maxSpeed;
    }

    /**
     * Sets the maximum neighbor distance of a specified agent.
     * 
     *
     * @param {number} agentNo The number of the agent whose maximum neighbor
     * distance is to be modified.
     * @param {number} neighborDist The replacement maximum neighbor distance.
     * Must be non-negative.
     */
    public setAgentNeighborDist(agentNo: number, neighborDist: number) {
        this.agents[this.agentNo2indexDict[agentNo]].neighborDist = neighborDist;
    }

    /**
     * Sets the two-dimensional position of a specified agent.
     * 
     *
     * @param {number} agentNo The number of the agent whose two-dimensional
     * position is to be modified.
     * @param {number} position The replacement of the two-dimensional
     * position.
     */
    public setAgentPosition(agentNo: number, position: Vector2D) {
        this.agents[this.agentNo2indexDict[agentNo]].position = position;
    }

    /**
     * Sets the two-dimensional preferred velocity of a specified
     * agent.
     *
     * @param {number} agentNo The number of the agent whose two-dimensional
     * preferred velocity is to be modified.
     * @param {number} prefVelocity The replacement of the two-dimensional
     * preferred velocity.
     */
    public setAgentPrefVelocity(agentNo: number, prefVelocity: Vector2D) {
        this.agents[this.agentNo2indexDict[agentNo]].prefVelocity = prefVelocity;
    }

    /**
     * Sets the radius of a specified agent.
     *
     * @param {number} agentNo The number of the agent whose radius is to be modified.
     * @param {number} radius The replacement radius. Must be non-negative.
     * 
     */
    public setAgentRadius(agentNo: number, radius: number) {
        this.agents[this.agentNo2indexDict[agentNo]].radius = radius;
    }

    /**
     * Sets the time horizon of a specified agent with respect to other agents.
     *
     * @param {number} agentNo The number of the agent whose time horizon is
     * to be modified.
     * @param {number} timeHorizon The replacement time horizon with respect
     * to other agents. Must be positive.
     */
    public setAgentTimeHorizon(agentNo: number, timeHorizon: number) {
        this.agents[this.agentNo2indexDict[agentNo]].timeHorizon = timeHorizon;
    }

    /**
     * Sets the time horizon of a specified agent with respect to obstacles.
     *
     * @param {number} agentNo The number of the agent whose time horizon with
     * respect to obstacles is to be modified.
     * @param {number} timeHorizonObst The replacement time horizon with
     * respect to obstacles. Must be positive.
     */
    public setAgentTimeHorizonObst(agentNo: number, timeHorizonObst: number) {
        this.agents[this.agentNo2indexDict[agentNo]].timeHorizonObst = timeHorizonObst;
    }

    /**
     * Sets the two-dimensional linear velocity of a specified
     * agent.
     *
     * @param {number} agentNo The number of the agent whose two-dimensional
     * linear velocity is to be modified.
     * @param {Vector2D} velocity The replacement two-dimensional linear
     * velocity.
     */
    public setAgentVelocity(agentNo: number, velocity: Vector2D) {
        this.agents[this.agentNo2indexDict[agentNo]].velocity = velocity;
    }

    /**
     * Sets the global time of the simulation.
     *
     * @param {number} globalTime The global time of the simulation.
     */
    public setGlobalTime(globalTime: number) {
        this.globalTime = globalTime;
    }
    /**
     * Sets the time step of the simulation.
     *
     * @param {number} timeStep The time step of the simulation. Must be
     * positive.
     */
    public setTimeStep(timeStep: number) {
        this.timeStep = timeStep;
    }

}
