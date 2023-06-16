import { error, log, warn } from "cc";

enum LoggerLevel {
    OFF = 0,
    ERROR,
    WARN,
    INFO,
    DEBUG,
    ALL,
}

/** 日志系统 */
class Logger {
    public static readonly Level = LoggerLevel;
    private _level: LoggerLevel = LoggerLevel.ALL;
    public get level(): LoggerLevel {
        return this._level;
    }
    public set level(value: LoggerLevel) {
        this._level = value;
    }

    time(label: string): void {
        console.time(label);
    }

    timeEnd(label: string): void {
        console.timeEnd(label);
    }

    table(msg: any): void {
        console.table(msg);
    }

    log(msg: any) {
        if (this.level >= LoggerLevel.INFO) {
            var backLog = console.log || log;
            backLog.call(null, "%s%s:%o", this.getDateString(), this.stack(5), msg);
        }
    }

    warn(msg: any) {
        if (this.level >= LoggerLevel.WARN) {
            var backLog = console.warn || warn;
            backLog.call(null, "%s%s:%o", this.getDateString(), this.stack(5), msg);
        }
    }

    error(msg: any) {
        if (this.level >= LoggerLevel.ERROR) {
            var backLog = console.error || error;
            backLog.call(null, "%s%s:%o", this.getDateString(), this.stack(5), msg);
        }
    }


    private stack(index: number): string {
        var e = new Error();
        var lines = e.stack!.split("\n");
        var result: Array<any> = [];
        lines.forEach((line) => {
            line = line.substring(7);
            var lineBreak = line.split(" ");
            if (lineBreak.length < 2) {
                result.push(lineBreak[0]);
            }
            else {
                result.push({ [lineBreak[0]]: lineBreak[1] });
            }
        });

        var list: string[] = [];
        var splitList: Array<string> = [];
        if (index < result.length - 1) {
            var value: string;
            for (var a in result[index]) {
                var splitList = a.split(".");

                if (splitList.length == 2) {
                    list = splitList.concat();
                }
                else {
                    value = result[index][a];
                    var start = value!.lastIndexOf("/");
                    var end = value!.lastIndexOf(".");
                    if (start > -1 && end > -1) {
                        var r = value!.substring(start + 1, end);
                        list.push(r);
                    }
                    else {
                        list.push(value);
                    }
                }
            }
        }

        if (list.length == 1) {
            return "[" + list[0] + "]";
        }
        else if (list.length == 2) {
            return "[" + list[0] + "->" + list[1] + "]";
        }
        return "";
    }

    private getDateString(): string {
        let d = new Date();
        let str = d.getHours().toString();
        let timeStr = "";
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMinutes().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getSeconds().toString();
        timeStr += (str.length == 1 ? "0" + str : str) + ":";
        str = d.getMilliseconds().toString();
        if (str.length == 1) str = "00" + str;
        if (str.length == 2) str = "0" + str;
        timeStr += str;

        timeStr = "[" + timeStr + "]";
        return timeStr;
    }

    private static _instance: Logger = null
    public static getInstance(): Logger {
        if (!this._instance) {
            this._instance = new Logger();
        }
        return this._instance;
    }
}

declare global {
    interface ITNT {
        logger: Logger;
    }
}

tnt.logger = Logger.getInstance();
export { };