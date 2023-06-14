import { native } from "cc";
declare global {

    interface IHotUpdateListener {

        /**
         * 版本信息
         *
         * @param {string} curVersion
         * @param {string} newVersion
         */
        onVersionInfo(curVersion: string, newVersion: string);

        /** 已经是最新版本 */
        onAlreadyLatestVersion();

        /** 跳过更新 */
        onSkipUpdate(event: native.EventAssetsManager);

        /** 
         * 有更新
         * @param {number} totalBytes
         */
        onFindedNewVersion(totalBytes: number);

        /** 更新的进度 */
        onUpdateProgress(event: native.EventAssetsManager);

        /** 更新成功 */
        onUpdateSucceed();

        /** 更新失败 */
        onUpdateFailed(event: native.EventAssetsManager);

    }
}

export { };