import { IVec2Like } from "cc";

// 正常8方向
const NORMAL_ROUND_8: number[][] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
// 正常4方向
const NORMAL_ROUND_4: number[][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];

// 六角网格地图
// 参考 https://ld0.indienova.com/indie-game-development/hex-grids-reference/#iah-5   偏移坐标
// 奇数行
const HEXAGONAL_Y_ODD = [
    [[+1, 0], [0, -1], [-1, -1],
    [-1, 0], [-1, +1], [0, +1]],
    [[+1, 0], [+1, -1], [0, -1],
    [-1, 0], [0, +1], [+1, +1]]
]

// 偶数行
const HEXAGONAL_Y_EVEN = [
    [[+1, 0], [+1, -1], [0, -1],
    [-1, 0], [0, +1], [+1, +1]],
    [[+1, 0], [0, -1], [-1, -1],
    [-1, 0], [-1, +1], [0, +1]]
]

// 奇数列
const HEXAGONAL_X_ODD = [
    [[+1, 0], [+1, -1], [0, -1],
    [-1, -1], [-1, 0], [0, +1]],
    [[+1, +1], [+1, 0], [0, -1],
    [-1, 0], [-1, +1], [0, +1]]
]

//  偶数列
const HEXAGONAL_X_EVEN = [
    [[+1, +1], [+1, 0], [0, -1],
    [-1, 0], [-1, +1], [0, +1]],
    [[+1, 0], [+1, -1], [0, -1],
    [-1, -1], [-1, 0], [0, +1]]
]

// 六角模拟等角交错
// 奇数行
const STAGGERED_Y_ODD = [
    [[0, -1], [-1, -1],
    [-1, +1], [0, +1]],
    [[+1, -1], [0, -1],
    [0, +1], [+1, +1]]
]

// 偶数行
const STAGGERED_Y_EVEN = [
    [[+1, -1], [0, -1],
    [0, +1], [+1, +1]],
    [[0, -1], [-1, -1],
    [-1, +1], [0, +1]]
]

// 奇数列
const STAGGERED_X_ODD = [
    [[+1, 0], [+1, -1],
    [-1, -1], [-1, 0]],
    [[+1, +1], [+1, 0],
    [-1, 0], [-1, +1]]
]

//  偶数列
const STAGGERED_X_EVEN = [
    [[+1, +1], [+1, 0],
    [-1, 0], [-1, +1]],
    [[+1, 0], [+1, -1],
    [-1, -1], [-1, 0]]
]

/**
 * 六角交错地图使用
 *
 * @param {IVec2Like} gird
 * @param {boolean} staggerX
 * @param {boolean} staggerEven
 * @return {*} 
 */
function getHexagonalNeighborsRound(gird: IVec2Like, staggerX: boolean, staggerEven: boolean) {
    if (staggerX) {
        let parity = gird.x & 1;
        if (staggerEven) {
            // 偶数列
            return HEXAGONAL_X_EVEN[parity];
        }
        // 奇数列
        return HEXAGONAL_X_ODD[parity];
    }

    let parity = gird.y & 1;
    if (staggerEven) {
        // 偶数行
        return HEXAGONAL_Y_EVEN[parity];
    }
    // 奇数行
    return HEXAGONAL_Y_ODD[parity];
}

/**
 * 六角交错地图模拟等角交错地图使用
 *
 * @param {IVec2Like} gird
 * @param {boolean} staggerX
 * @param {boolean} staggerEven
 * @return {*} 
 */
function getStaggeredNeighborsRound(gird: IVec2Like, staggerX: boolean, staggerEven: boolean) {
    if (staggerX) {
        let parity = gird.x & 1;
        if (staggerEven) {
            // 偶数列
            return STAGGERED_X_EVEN[parity];
        }
        // 奇数列
        return STAGGERED_X_ODD[parity];
    }

    let parity = gird.y & 1;
    if (staggerEven) {
        // 偶数行
        return STAGGERED_Y_EVEN[parity];
    }
    // 奇数行
    return STAGGERED_Y_ODD[parity];
}

/**
 * 正常地图、45度使用
 *
 * @param {boolean} diagonal
 * @return {*} 
 */
function getNormalNeighborsRound(diagonal: boolean = false) {
    return diagonal ? NORMAL_ROUND_8 : NORMAL_ROUND_4;
}

export {
    getHexagonalNeighborsRound,
    getStaggeredNeighborsRound,
    getNormalNeighborsRound
};