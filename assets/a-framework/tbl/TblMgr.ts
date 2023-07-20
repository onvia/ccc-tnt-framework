
import { JsonAsset, _decorator } from "cc";
import { Tbl } from "./Tbl";
const { ccclass } = _decorator;

declare global {
    interface ITNT {
        tblMgr: TblMgr;
    }
}

@ccclass('TblMgr')
export class TblMgr {

    init(allTable: JsonAsset[]) {
        for (let table of allTable) {
            let tbl = new Tbl();
            tbl.init(table.name, table.json);
            tnt.tbl[table.name] = window[table.name] = tbl;
        }
    }

    private static _instance: TblMgr = null
    public static getInstance(): TblMgr {
        if (!this._instance) {
            this._instance = new TblMgr();
        }
        return this._instance;
    }
}

tnt.tblMgr = TblMgr.getInstance();
