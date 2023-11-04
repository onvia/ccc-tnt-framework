import { Service } from "../service/Service";

type Constructor<T = unknown> = new (...args: any[]) => T;

export class ServiceMgr{

    services: Service[] = [];

    classes: Constructor<Service>[] = [];
    register(cls: Constructor<Service>){
        this.classes.push(cls);
    }

    init(){
        this.classes.forEach((cls)=>{
            let service = new cls();
            this.services.push(service);
            service.onInit();
        });

    }

    destroy(){
        this.services.forEach((service)=>{
            service.onDestroy()
        });
    }

    private static _instance:ServiceMgr = null;
    public static getInstance(): ServiceMgr{
        if(!this._instance){
            this._instance = new ServiceMgr();
        }
        return this._instance;
    }
}

export const serviceMgr = ServiceMgr.getInstance();