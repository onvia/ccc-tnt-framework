
import { _decorator, Component, Node, log } from 'cc';
const { ccclass, property } = _decorator;

declare global {
    interface ITNT {
        httpMgr: HttpMgr;
    }
    interface IHttpOptions {

        head?: Record<string, string>;
        responseType?: XMLHttpRequestResponseType;
        timeout?: number;
        success(res: any);
        fail?(err: string);
        complete?(status: number, res: any);
    }
}

@ccclass('HttpMgr')
class HttpMgr {

    get(url, params: IHttpOptions) {
        this._request(url, params, 'GET');
    }

    post(url, params: IHttpOptions) {
        this._request(url, params, "POST");
    }

    /**
     * 网络请求
     * @param url
     * @param params 参数根据与服务器协商结果传入
     * @param method 请求方式
     */
    private _request(url: string, params: IHttpOptions, method: 'GET' | 'POST' = "POST") {
        let xhr = new XMLHttpRequest();
        try {
            xhr.responseType = params?.responseType || 'json';
            let errInfo = 'http request failed: ' + url + ', status: ';
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        params?.success?.(xhr.response);
                    } else {
                        params?.fail?.(errInfo + xhr.status + '(no response)');
                    }
                    params?.complete?.(xhr.status, xhr.response);
                }
            };
            // xhr.onload = function () {
            //     if (xhr.status === 200 || xhr.status === 0 ) {
            //         params?.success?.(xhr.response);
            //     } else {
            //         params?.fail?.(errInfo + xhr.status + '(no response)');
            //     }
            // };
            xhr.onerror = function () {
                params?.fail?.(errInfo + xhr.status + '(error)');
            };

            xhr.ontimeout = function () {
                params?.fail?.(errInfo + xhr.status + '(time out)');
            };

            xhr.onabort = function () {
                params?.fail?.(errInfo + xhr.status + '(abort)');
            };

            xhr.open(method || 'POST', url, true);

            //设置发送数据的请求格式
            if (params?.head) {
                for (let key in params.head) {
                    xhr.setRequestHeader(key.toString(), params.head[key]);
                }
            } else {
                xhr.setRequestHeader('content-type', 'application/json');
            }

            xhr.timeout = params.timeout || 10000;
            xhr.send(params ? JSON.stringify(params) : null);
        } catch (error) {
            console.error('客户端发送失败:' + error);
        }
    }

    private static _instance: HttpMgr = null
    public static getInstance(): HttpMgr {
        if (!this._instance) {
            this._instance = new HttpMgr();
        }
        return this._instance;
    }
}

tnt.httpMgr = HttpMgr.getInstance();

export { };