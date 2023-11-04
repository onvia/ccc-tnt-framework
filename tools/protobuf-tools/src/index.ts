
import minimist from 'minimist';
import fs from 'fs-extra';
import { fileUtils } from './FileUtils';
import { GenProtoDeclare } from './GenProtoDeclare';
import path from 'path';
const MainProto = "_all.proto";
export class Main {

  // 
  syntax: number = 3;
  output_ts: string = 'out';
  output_dts: string = 'out';
  hasAllProto: boolean = false;
  public exec(args) {
    if (args.help || args.h) {
      console.log("--input 或者 -i: 输入的 proto 协议位置,\n--outts 或者 -ots: 输出的 ts 文件位置\n--outdts 或者 -odts: 输出的 *.d.ts 文件位置\n--syntax: 语法版本 2 | 3 默认为 3");
      return;
    }
    let input = args.i || args.input;
    if (!input) {
      console.error(`protobuf-tools 没有输入路径`);
      return;
    }
    const output_ts = args.outts || args.ots;
    if (!output_ts) {
      console.error(`protobuf-tools 没有  outts  输出路径`);
      return;
    }

    const output_dts = args.outdts || args.odts || args.outts;
    if (!output_dts) {
      console.error(`protobuf-tools 没有 outdts 输出路径`);
      return;
    }
    this.output_ts = output_ts;
    this.output_dts = output_dts;

    this.syntax = args.syntax || 3;

    // 不再清空文件，会出现清空项目的情况
    // fs.emptyDirSync(output_dts);

    input = input.replace(/\\+/g, "/");
    let inputStat = fs.statSync(input);
    if (inputStat.isFile()) {
      let idx = input.lastIndexOf("/");
      input = input.substring(0, idx);
    }

    // 创建主文件
    this.createMainFile(input);
    this.genProtoDeclare(path.join(input, MainProto));

    if (!this.hasAllProto) {
      this.delMainFile(input);
    }
  }
  delMainFile(input: string) {

    fs.unlinkSync(path.join(input, MainProto));
  }
  // 创建一个主文件
  createMainFile(input: string) {
    let arr: string[] = [];
    fileUtils.checkoutFiles(input, arr);

    let content: string = `syntax = "proto${this.syntax}";\npackage ${MainProto.split(".")[0]};\n`;
    for (let i = 0; i < arr.length; i++) {

      let filepath = arr[i];
      filepath = filepath.replace(/\\+/g, "/");
      // 跳过已存在 的 MainProto
      if (path.basename(filepath) == MainProto) {
        this.hasAllProto = true;
        continue;
      }
      filepath = filepath.replace(input + "/", "");
      content += `import "${filepath}";\n`
    }
    // 如果有则覆盖已存在的 MainProto
    fs.writeFileSync(path.join(input, MainProto), content, { encoding: "utf-8" });
  }

  async genProtoDeclare(protoUrl: any) {
    console.time('print-time');

    let g = new GenProtoDeclare();
    await g.parse(protoUrl, { genModuleInterface: true })


    // 确保文件夹存在，但是不清空文件夹
    fs.mkdirp(this.output_ts);
    fs.mkdirp(this.output_dts);
    fs.writeFile(path.join(this.output_ts, "MsgID.ts"), g.IDContent);
    fs.writeFile(path.join(this.output_ts, "NetMsgErrorID.ts"), g.RETContent);
    fs.writeFile(path.join(this.output_dts, "cs.d.ts"), g.messageContent);
    fs.writeFile(path.join(this.output_dts, "cs.module.d.ts"), g.moduleInterfaceContent);

    console.timeEnd('print-time');
  }
}


const oargs = process.argv.slice(2);
const args = minimist(oargs);

let main = new Main();
if (oargs.length) {
  main.exec(args);
} else {
  // 测试
  main.genProtoDeclare("./proto/single/*");
}

