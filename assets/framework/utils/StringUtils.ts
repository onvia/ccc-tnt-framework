
declare global {
    interface ITNT {
        stringUtils: GStringUtils;
    }
}

class GStringUtils {
    Base64 = new GBase64();

    /** 支持不定参数基础类型数据  和 对象
     * 
     * format_0("hello_{0},I like to write in {1}.","world","typescript");
     * print: hello_world,I like to write in typescript
     * 
     * format_0("hello_{world},I like to write in {language}.",{world: "world",language: "typescript"});
     * print: hello_world,I like to write in typescript
     */
    format_0(str: string, ...args) {
        var result = str;

        if (args.length > 0) {
            let isObject = typeof (args[0]) == "object";
            let notArray = !Array.isArray(args[0]);
            if (args.length == 1 && isObject && notArray) {
                args = args[0];

                // 匹配所有
                let regexAll = /\{(.+?.?)\}/g;
                let resRegexAllArr = result.match(regexAll);
                if (!resRegexAllArr) {
                    return result;
                }

                let regex = /\{(.+?.?)\}/;
                for (let i = 0; i < resRegexAllArr.length; i++) {
                    const e = resRegexAllArr[i];
                    let arr = e.match(regex); //匹配到的数组 [{{value}}, value]
                    let reg = arr[0]
                    let matchName = arr[1];

                    let matchInfos = matchName.split(':');
                    let _key = matchInfos[0];
                    let val = args[_key];
                    if (matchInfos) {
                        for (let j = 1; j < matchInfos.length; j++) {
                            const matchInfo = matchInfos[j];
                            val = this.deal(val, matchInfo);
                        }
                    }
                    result = result.replace(reg, val);
                }

                // // 通过 key 替换数据
                // for (var key in args) {
                //     var reg = new RegExp("(%{" + key + "})", "g");
                //     result = result.replace(reg, args[key]);
                // }
            } else {

                let regexAll = /\{(.+?)\}/g;
                let resRegexAllArr = result.match(regexAll);
                if (!resRegexAllArr) {
                    return result;
                }
                let regex = /\{(.+?)\}/;
                for (let i = 0; i < resRegexAllArr.length; i++) {
                    const e = resRegexAllArr[i];
                    let arr = e.match(regex); //匹配到的数组 [{{value}}, value]
                    let indexNum = parseInt(arr[1] || '0') || 0; //取出数组的 value 元素 转换成整数
                    let matchName = arr[1];

                    // 只能进行一次 格式化 {0:int}
                    // let matchInfo = matchName.split(':')[1] || '';
                    // let v = StringFunction.deal(args[indexNum],matchInfo);

                    let v = args[indexNum];
                    let matchInfos = matchName.split(':');
                    if (!matchInfos) {
                        // matchInfos = "";
                    } else {
                        for (let j = 1; j < matchInfos.length; j++) {
                            const matchInfo = matchInfos[j];
                            v = this.deal(v, matchInfo);
                        }
                    }
                    result = result.replace(e, v);
                }
            }
        }

        return result;
    }
    /**
     * 只支持 {0},{1},{2} 的形式，不支持 {key:value} 形式
     * @param key 
     * @param args 
     * @returns 
     */
    format_1(key, ...args) {
        let result = key;
        if (args.length) {
            let regexAll = /\{(.+?)\}/g;  ////这个在索引大于9时会有问题
            let resRegexAllArr = result.match(regexAll);
            if (!resRegexAllArr) {
                return result;
            }
            let regex = /\{(.+?)\}/;
            for (let i = 0; i < resRegexAllArr.length; i++) {
                const e = resRegexAllArr[i];
                let arr = e.match(regex); //匹配到的数组 [{{value}}, value]
                let indexNum = parseInt(arr[1] || '0') || 0; //取出数组的 value 元素 转换成整数
                let matchName = arr[1];

                // 只能进行一次 格式化 {0:int}
                // let matchInfo = matchName.split(':')[1] || '';
                // let v = StringFunction.deal(args[indexNum],matchInfo);

                let v = args[indexNum];
                let matchInfos = matchName.split(':');
                if (!matchInfos) {
                    matchInfos = "";
                } else {
                    for (let j = 1; j < matchInfos.length; j++) {
                        const matchInfo = matchInfos[j];
                        v = this.deal(v, matchInfo);
                    }
                }
                result = result.replace(e, v);
            }
        }
        return result;
    }

    deal(value, format) {
        if (format == '') {
            return value;
        }

        format = format.toLowerCase().trim();//不区分大小
        let match_func = format.match(/^[a-z|A-Z]+/gi);//匹配到 format 中的 函数名
        let match_num = format.match(/\d+$/gi);   //匹配到 format 中的参数
        let func: string = '';
        let num: number;
        let res: number | string = '';

        if (match_func) func = match_func[0];
        if (match_num) num = parseInt(match_num[0]);

        if (typeof value == 'number') {
            switch (func) {
                case 'int': res = this.int(value); break;
                case 'fix': res = this.fix(value, num); break;
                case 'kmbt': res = this.KMBT(value); break;
                case 'per': res = this.per(value, num); break;
                case 'pad': res = this.pad(value, num); break;
                case 'sep': res = this.sep(value); break;
                case 'mmss': res = this.mmss(value); break;
                case 'hhmmss': res = this.hhmmss(value); break;

                default:
                    break;
            }

        } else {
            switch (func) {
                case 'limit': res = this.limit(value, num); break;

                default:
                    break;
            }
            // res = value;
        }

        return res;
    }

    /** [value:per2] 将取值0~1 变成 1~100,可以指定修饰的小数位数 */
    per(value: number, fd: number) {
        return (value * 100).toFixed(fd);
    }

    /** [value:int] 将取值变成整数 */
    int(value: number) {
        return Math.round(value);
    }

    /** [value:pad2]  补位参数2: 1 显示为 01   参数 3: 1 显示为 001 */
    pad(value, fd: number) {
        var len = value.toString().length;
        while (len < fd) {
            value = "0" + value;
            len++;
        }
        return value;
    }

    /** [value:fix2]数值转换为小数*/
    fix(value: number, fd: number) {
        return value.toFixed(fd)
    }

    /** [value:limit3]字符串长度限制 */
    limit(value: string, count: number) {
        return value.substring(0, count);
    }

    //将数字按分号显示
    sep(value: number) {
        let num = Math.round(value).toString();
        return num.replace(new RegExp('(\\d)(?=(\\d{3})+$)', 'ig'), "$1,");
    }
    /** 将数字缩短显示为KMBT单位 大写,目前只支持英文 */
    KMBT(value: number) {
        //10^4=万, 10^8=亿,10^12=兆,10^16=京，
        let counts = [1000, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27];
        let units = ['', 'k', 'm', 'b', 't', 'aa', 'bb', 'cc', 'dd', 'ee'];
        return this.compressUnit(value, counts, units, 2);
    }

    /** 时:分:秒 */
    hhmmss(value: number) {
        return this.parseTimer(value, true);
    }
    /** 分:秒 */
    mmss(value: number) {
        return this.parseTimer(value, false);
    }
    /** 时间格式转换 */
    parseTimer(timer = 0, isFullTimer = true) {
        let t = Math.floor(timer);
        let hours = Math.floor(t / 3600);
        let mins = Math.floor((t % 3600) / 60);
        let secs = t % 60;
        let h = '' + hours;
        let m = '' + mins;
        let s = '' + secs;
        if (secs < 10) s = '0' + secs;
        if (hours < 10) h = '0' + hours;

        //full timer 按小时算,无论有没有小时
        if (isFullTimer) {
            if (mins < 10) m = '0' + mins;
            return h + ':' + m + ':' + s;
        } else {
            // m = ''+ (mins +hours*60);
            // if(mins<10) m = '0' + mins;
            // return m+':'+s;
            if (mins < 10) m = '0' + mins;
            if (hours > 0) {
                return h + ':' + m + ':' + s;
            }
            return m + ':' + s;
        }
    }

    //压缩任意单位的数字，后缀加上单位文字
    compressUnit(value, valueArr: number[], unitArr: string[], fixNum: number = 2): string {
        let counts = valueArr;
        let units = unitArr;
        let res: string;
        let index;
        for (index = 0; index < counts.length; index++) {
            const e = counts[index];
            if (value < e) {
                if (index > 0) {
                    res = (value / counts[index - 1]).toFixed(fixNum);
                } else {
                    res = value.toFixed(0);
                }
                break;
            }

        }
        return res + units[index];
    }
    // 计算字符串长度
    stringLen(str: string) {
        ///<summary>获得字符串实际长度，中文2，英文1</summary>
        ///<param name="str">要获得长度的字符串</param>
        var realLength = 0, len = str.length, charCode = -1;
        for (var i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128)
                realLength += 1;
            else
                realLength += 2;
        }
        return realLength;
    }
    md5(bit = 16 | 32) {
        var sMessage = this;

        function RotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function AddUnsigned(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            if (lX4 | lY4) {
                if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            } else return (lResult ^ lX8 ^ lY8);
        }

        function F(x, y, z) {
            return (x & y) | ((~x) & z);
        }

        function G(x, y, z) {
            return (x & z) | (y & (~z));
        }

        function H(x, y, z) {
            return (x ^ y ^ z);
        }

        function I(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function FF(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }

        function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }

        function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }

        function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(RotateLeft(a, s), b);
        }

        function ConvertToWordArray(sMessage) {
            var lWordCount;
            var lMessageLength = sMessage.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (sMessage.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function WordToHex(lValue) {
            var WordToHexValue = "",
                WordToHexValue_temp = "",
                lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
        }
        var x = Array();
        var k, AA, BB, CC, DD, a, b, c, d
        var S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22;
        var S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20;
        var S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23;
        var S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;
        // Steps 1 and 2. Append padding bits and length and convert to words 
        x = ConvertToWordArray(sMessage);
        // Step 3. Initialise 
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        // Step 4. Process the message in 16-word blocks 
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }
        if (bit == 32) {
            return WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
        } else {
            return WordToHex(b) + WordToHex(c);
        }
    }
    private static _instance: GStringUtils = null
    public static getInstance(): GStringUtils {
        if (!this._instance) {
            this._instance = new GStringUtils();
        }
        return this._instance;
    }
}
class GBase64 {

    // private property
    private readonly _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // public method for encoding
    public encode(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    }

    // public method for decoding
    public decode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = this._utf8_decode(output);

        return output;

    }

    // private method for UTF-8 encoding
    private _utf8_encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    // private method for UTF-8 decoding
    private _utf8_decode(utftext) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }
    private static _instance: GBase64 = null
    public static getInstance(): GBase64 {
        if (!this._instance) {
            this._instance = new GBase64();
        }
        return this._instance;
    }
}

export { };

tnt.stringUtils = GStringUtils.getInstance();