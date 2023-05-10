
type FileProgressCallback = (loaded: number, total: number) => void;

export default function downloadFile (
    url: string,
    options: Record<string, any>,
    onProgress: FileProgressCallback | null | undefined,
    onComplete: ((err: Error | null, data?: any | null) => void),
): XMLHttpRequest {
    const xhr = new XMLHttpRequest();
    const errInfo = `download failed: ${url}, status: `;

    xhr.open('GET', url, true);

    if (options.xhrResponseType !== undefined) { xhr.responseType = options.xhrResponseType; }
    if (options.xhrWithCredentials !== undefined) { xhr.withCredentials = options.xhrWithCredentials; }
    if (options.xhrMimeType !== undefined && xhr.overrideMimeType) { xhr.overrideMimeType(options.xhrMimeType); }
    if (options.xhrTimeout !== undefined) { xhr.timeout = options.xhrTimeout; }

    if (options.xhrHeader) {
        for (const header in options.xhrHeader) {
            xhr.setRequestHeader(header, options.xhrHeader[header]);
        }
    }

    xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
            if (onComplete) { onComplete(null, xhr.response); }
        } else if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(no response)`)); }
    };

    if (onProgress) {
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                onProgress(e.loaded, e.total);
            }
        };
    }

    xhr.onerror = () => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(error)`)); }
    };

    xhr.ontimeout = () => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(time out)`)); }
    };

    xhr.onabort = () => {
        if (onComplete) { onComplete(new Error(`${errInfo}${xhr.status}(abort)`)); }
    };

    xhr.send(null);

    return xhr;
}
