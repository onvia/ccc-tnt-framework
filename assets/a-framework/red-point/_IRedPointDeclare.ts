

declare global {

    interface RedPointInfo {
        id: number,
        name: string;
        parent: number;
        showType: tnt.RedPoint.ShowType;
    }
    interface IRedPountRequestUpdate {
        requestUpdate<Options = any>(parent: number, id: number, options?: Options): number;
    }



}

export { };