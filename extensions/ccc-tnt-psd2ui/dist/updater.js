"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updater = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const package_json_1 = __importDefault(require("../package.json"));
class Updater {
    constructor() {
        this.branch = "master";
    }
    async getRemotePackageJson() {
        const packageJsonUrl = `${package_json_1.default.repository.url}/raw/${this.branch}/package.json`;
        let res = await (0, node_fetch_1.default)(packageJsonUrl, {
            method: 'GET',
        });
        // 请求结果
        if (res.status !== 200) {
            return null;
        }
        const json = await res.json();
        return json;
    }
    async getRemoteVersion() {
        let json = await this.getRemotePackageJson();
        return (json === null || json === void 0 ? void 0 : json.version) || null;
    }
    getLocalVersion() {
        return package_json_1.default.version;
    }
    compareVersion(localVersion, remoteVersion) {
        const parts1 = localVersion.split('.');
        const parts2 = remoteVersion.split('.');
        if (parts1.length != parts2.length) {
            // 版本号格式不正确，返回 -100
            return -100;
        }
        for (let i = 0; i < 2; i++) {
            if (parts1[i] != parts2[i]) {
                return parts1[i] < parts2[i] ? -10 : 10;
            }
        }
        if (parts1[2] !== parts2[2]) {
            // 最后一位不一致，返回 -1 或 1
            return parts1[2] < parts2[2] ? -1 : 1;
        }
        return 0;
    }
    async checkUpdate() {
        let remoteVersion = await this.getRemoteVersion();
        let localVersion = this.getLocalVersion();
        let compareResult = this.compareVersion(localVersion, remoteVersion);
        return compareResult;
    }
    async downloadCoreAsBuffer(file) {
        const targetUrl = `${package_json_1.default.repository.url}/raw/${this.branch}/${file}`;
        let res = await (0, node_fetch_1.default)(targetUrl, {
            method: 'GET',
        });
        let buffer = await res.buffer();
        return buffer;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new Updater();
        }
        return this._instance;
    }
}
Updater._instance = null;
exports.updater = Updater.getInstance();
