

declare global {

    interface RedPointInfo {
        id: number,
        name: string;
        parent: number;
        showType: tnt.RedPoint.ShowType;
        priority?: number; // 优先级
    }
    interface IRedPointRequestUpdate {
        requestUpdate<Options = any>(parent: number, id: number, options?: Options): number;
    }
}

export { };