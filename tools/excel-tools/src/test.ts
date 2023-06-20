
import { toArray, toObject } from "./utils";

enum DataType {
    unknow,
    object,
    array
}

export class Test {

    objects: Record<string, any>;

    exec() {
        let text = "1,\"str\",2,\"str\"";
        text = '{"key1": ["c","d"],key2: ["e","f"]}';
        text = '{key1: [c,d],key2: [1,f x],key3: ["  d a",sd fa]}';
        text = '[2,3,4],[1,3,5]';
        text = 'flag:false,arr:[2,1,"31"]';
        // this._exec(text);
        let results = {};
        try {
            let datas = text.split(",");
            datas.forEach((res) => {
                let kvs = res.split(":");
                kvs.map((kv) => {
                    return kv.trim();
                });
                if (kvs.length >= 2) {
                    results[kvs[0]] = kvs[1];
                }
            });
        } catch (error) {
            results = null;
        }
        console.log(`test-> `);
        
    }
    _exec(text: string) {
        text = this.addQuotation(text);
        let reg = text.match(/\w/gi)
        console.log(`test-> `, reg);


        console.log(`test-> `);
        let results = null;
        let type = this.parseType(text);
        switch (type) {
            case DataType.array:
                results = toArray(text);
                break;
            case DataType.object:
                results = toObject(text);
                break;
            case DataType.unknow:
                results = text;
                break;
            default:
                break;
        }
        console.log(`test-> `);

    }



    parseType(text: string) {

        for (let i = 0; i < text.length; i++) {
            const char = text.charAt(i);
            if (char === ":" || char === "{") {
                return DataType.object;
            }
            if (char === "," || char === "[") {
                return DataType.array;
            }
        }
        return DataType.unknow;
    }

    addQuotation(text: string) {

        let curIdx = 0;
        let charArr = text.split("");
        while (curIdx < charArr.length - 1) {
            const curChar = charArr[curIdx];
            const nextChar = charArr[curIdx + 1];

            if (curIdx === 0 && curChar.match(/\w/i)) {
                charArr.splice(curIdx, 0, '"');
                curIdx += 2;
                continue;
            }
            if (nextChar.match(/\w/i) && !curChar.match(/\w/i) && !curChar.match(/\"|\'| /)) {
                charArr.splice(curIdx + 1, 0, '"');
                curIdx += 2;
                continue;
            }

            if (!nextChar.match(/\w/i) && !nextChar.match(/\"|\'| /) && curChar.match(/\w/i)) {
                charArr.splice(curIdx + 1, 0, '"');
                curIdx += 2;
                continue;
            }
            curIdx++;
        }

        return charArr.join('');
    }

}



// ["a","b"]
//
// {["c","d"],["e","f"]}

