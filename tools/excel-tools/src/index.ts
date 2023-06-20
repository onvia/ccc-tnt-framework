


import minimist from 'minimist';
import { Main } from './Main';
// ##################
// 输入
const oargs = process.argv.slice(2);
const args = minimist(oargs);

let main = new Main();
if (oargs.length) {
    main.exec(args);
} else {
    // 测试
    main.test();
}

// ##################

export {}