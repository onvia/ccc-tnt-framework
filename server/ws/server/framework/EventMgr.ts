type _Callback = (...args)=> void;

type Opts<T> =  { [Key in keyof T]?: Key };
type K2V<B> = Opts<B>[keyof B];

interface IHandler<T>{
    key: K2V<T>,
    listener: _Callback,
    target?: any,
    args?: any[],
    once?: boolean,
    /** 优先级 数值越大越优先*/
    priority?: number, 
}

interface IStickyHandler {
    key: string,
    value?: any,
}

export class EventMgr<T = any>{

    private _unuseHandlers: IHandler<T>[] = [];
    private _handlerMap: Record<string, IHandler<T>[]> = {};
    private _stickyHandlerMap: Record<string,IStickyHandler[]> = {};
    private _valueMap: Record<any,any> = {};

  
    public on(key: K2V<T> | IHandler<T> | IHandler<T>[],listener?: _Callback,target?: any,priority?: number,...args: any){
       this._on(key,listener,target,false,priority,...args);
    }

    public once(key: K2V<T> | IHandler<T> | IHandler<T>[],listener?: _Callback,target?: any,priority?: number,...args: any){
        this._on(key,listener,target,true,priority,...args);
    }

    private _on(key: K2V<T> | IHandler<T> | IHandler<T>[],listener?: _Callback,target?: any,once?: boolean,priority?: number,...args: any){
        if(typeof key === 'string' || typeof key === "number"){
            this._addHandler(this._getHandler(key,listener,target,once,priority,...args));
        }else if(Array.isArray(key)){
            let arr: IHandler<T>[] = key;
            arr.forEach((val)=>{
                this._addHandler(val);
            })
        }else{
            this._addHandler(key as IHandler<T>);
        }
    }


    public off(_key: K2V<T>,listener:_Callback,target?: any){
        let key = _key as string;
        if(!key || !key.trim()){
            return;
        }
        const handlerMap = this._handlerMap;
        let handlers: IHandler<T>[] = handlerMap[key];
        if(handlers){            
            for (let i = handlers.length; i--;) {
                let handler = handlers[i];
                if((!target || handler.target === target)
                  &&(!listener || handler.listener === listener)){
                    this._recoverHandler(handler);
                    handlers.splice(i,1);
                  }
            }
            if(!handlers.length){
                delete handlerMap[key];
            }
        }
    }

    public offAllOfKey(_key: K2V<T>){
        let key = _key as string;
        if(!key || !key.trim()){
            return;
        }

        this._stickyHandlerMap[key] = undefined;
        let handlers: IHandler<T>[] = this._handlerMap[key];
        if(handlers){            
            for (let i = handlers.length; i--;) {
                this._recoverHandler(handlers[i]);
            }
        }
        delete this._handlerMap[key];

    }

    public targetOff(target: any){
        let handlerMap = this._handlerMap;
        if(target){
            for (const key in handlerMap) {
                this.off(key as keyof T,null,target);
            }
        }
    }

    /**
     * 
     * @param key 
     * @param args 
     * @returns 
     */
     public emit(key: K2V<T>,...args){
        this.broadcast(key,...args);
    }

    /**
     * 粘性广播
     * @param key 
     * @param args 
     * @returns 
     */
     public emitSticky(key: K2V<T>,... args){
        this.stickyBroadcast(key,...args);
    }

    /**
     * 
     * @param _key 
     * @param args 
     * @returns 
     */
     public broadcast(_key: K2V<T>,... args){
        const handlerMap = this._handlerMap;
        let key = _key as string;


        const handlers = handlerMap[key];
        if(!handlers){
            return false;
        }

        for (let i = 0; i < handlers.length; i++) {
            const handler = handlers[i];
            this._runHandlerWithData(handler,...args);

            if (handler.once) {
                handlers.splice(i,1);
                this._recoverHandler(handler);
                i--;
            }
        }

        if(!handlers.length){
            delete handlerMap[key];
        }
        return true;
    }

    public stickyBroadcast(_key: K2V<T>,...args){
        const handlerMap = this._handlerMap;
        let key = _key as string;

        if(handlerMap[key]){
            this.broadcast(key as keyof T,... args);
        }else{
            
            let stickyMap = this._stickyHandlerMap;
            let stickyHandlers = stickyMap[key];
            const handler: IStickyHandler = {
                key: key as any,
                value: [...args],
            };
            if (!stickyHandlers) {
                stickyMap[key] = stickyHandlers = [handler]
            } else {
                stickyHandlers.push(handler)
            }
        }
    }
    
    public clear(){
        this._handlerMap = {};
        this._stickyHandlerMap = {};
    }

    public hasEventListener(key: K2V<T>,listener: _Callback,target: any){
        const handlerMap = this._handlerMap;
        const handlers = handlerMap[key as string];
        if(!handlers){
            return false;
        }
        let handler = handlers.find((handler)=>{
            return handler && handler.listener === listener && handler.target === target;
        });

        return !!handler;
    }

    public has(key: string) {
        return this._handlerMap && !!this._handlerMap[key]
    }

    /**
     * 取值
     * @param key 
     * @returns 
     */
    public value(key: K2V<T> ): any {
        return this._valueMap && this._valueMap[key];
    }

    protected _addHandler(handler: IHandler<T>){
        let hasListener = this.hasEventListener(handler.key,handler.listener,handler.target);
        if(hasListener){
            this._recoverHandler(handler);
            console.warn(`broadcast-> 已经存在相同目标事件回调`);
            return;
        }
        const handlerMap = this._handlerMap;
        let handlers = handlerMap[handler.key as string];
        if(!handlers){
            handlerMap[handler.key as string] = handlers = [handler];
        }else{
            handlers.push(handler);
        }

        // 排序
        handlers.sort((a,b)=>{
            return b.priority - a.priority;
        });

        const stickyMap = this._stickyHandlerMap;
        const stickyHandlers = stickyMap[handler.key as string];
        if(stickyHandlers){
            for (let i = 0; i < stickyHandlers.length; i++) {
                const stickyHandler = stickyHandlers[i];
                this.broadcast(stickyHandler.key as keyof T, ... stickyHandler.value);
            }
            stickyMap[handler.key as string] = undefined;
        }
    }
    private _recoverHandler(handler: IHandler<T>){
        if(this._unuseHandlers.length >= 128){
            return;
        }
        handler.args = undefined;
        handler.target = undefined;
        handler.listener = undefined;
        handler.key = undefined;
        handler.priority = undefined;
        handler.once = undefined;
        this._unuseHandlers.push(handler);
    }
    private _runHandlerWithData(handler: IHandler<T>, ...data){
        if(!handler.listener){
            return null;
        }
        let result = null;

        let args = [].concat(data);
      
        

        if (!handler.args){
            result = handler.listener.apply(handler.target, args);
        }
        else if (handler.args) {
            result = handler.listener.apply(handler.target, args.concat(handler.args));
        }
        return result;
    }

    protected _getHandler(key: K2V<T>, listener: any, target: any, once: boolean,priority: number, ...args) {
        const unuseHandlers = this._unuseHandlers;
        let handler: IHandler<T>;
        if (unuseHandlers.length) {
            handler = unuseHandlers.pop();
        } else {
            handler = {} as any;
        }
        handler.key = key;
        handler.listener = listener;
        handler.target = target;
        handler.once = once;
        handler.args = [...args];
        handler.priority = priority || 0;
        return handler;
    }

    private static _inst: EventMgr = null;
    public static getInstance(): EventMgr {
        if (!this._inst) {
            this._inst = new EventMgr();
        }
       return this._inst;
    }
}

export const eventMgr = EventMgr.getInstance();