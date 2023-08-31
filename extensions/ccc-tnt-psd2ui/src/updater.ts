
import fetch from "node-fetch";
import packageJSON from '../package.json';

class Updater {
    readonly branch = "master";

    async getRemotePackageJson() {
        const packageJsonUrl = `${packageJSON.repository.url}/raw/${this.branch}/package.json`;
        let res = await fetch(packageJsonUrl, {
            method: 'GET',
        });

        // 请求结果
        if (res.status !== 200) {
            return null;
        }
        const json = await res.json()
        return json;
    }

    async getRemoteVersion() {
        let json = await this.getRemotePackageJson();
        return json?.version || null;
    }

    getLocalVersion() {
        return packageJSON.version;
    }

    compareVersion(localVersion: string, remoteVersion: string) {
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

    async downloadCoreAsBuffer(file: string) {
        const targetUrl = `${packageJSON.repository.url}/raw/${this.branch}/${file}`;
        let res = await fetch(targetUrl, {
            method: 'GET',
        });
        let buffer = await res.buffer();
        return buffer;
    }

    private static _instance: Updater = null!;
    public static getInstance(): Updater {
        if (!this._instance) {
            this._instance = new Updater();
        }
        return this._instance;
    }
}

export let updater = Updater.getInstance();