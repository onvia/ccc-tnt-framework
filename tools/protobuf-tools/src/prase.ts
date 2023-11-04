
import { pbjs } from 'protobufjs-cli';

/** 禁止序列化 */ 
export let nonserialization = function(){
    return (target: any,propertyKey: string)=>{
        if(!target.__unserialization){
            target.__unserialization = [];
        }
        target.__unserialization.push(propertyKey);

        if(!target.toJSON){
            // JSON.stringify 自动调用
            target.toJSON = function(){
                let data:Record<any,any> = {};
                for (const key in this) {
                    if (Object.prototype.hasOwnProperty.call(this, key)) {
                        // @ts-ignore
                        if(this.__unserialization.indexOf(key) !== -1){
                            continue;
                        }
                        const value = this[key];
                        data[key] = value;
                    }
                }
                return data;
            }
        }
    }
}

const ConvertTypes: Record<string,string> = {
    "double": "number",
    "float": "number",
    "int32": "number",
    "uint32": "number",
    "sint32": "number",
    "fixed32": "number",
    "sfixed32": "number",
    "int64": "number",
    "uint64": "number",
    "sint64": "number",
    "fixed64": "number",
    "sfixed64": "number",
    "bool": "boolean",
    "string": "string",
    "bytes": "ArrayBuffer"
};

export const DefJSTypes = ["number","bool","string","ArrayBuffer"];

export enum ObjectType{
    NameSpace,
    Message,
    Enum,
    Empty
}
export enum Rule{
    Repeated,
    Required,
    Optional
}


abstract class Format{
    @nonserialization()
    declare source: any;
    declare name: string;
    constructor(name: string,original: any){
        this.name = name;
        this.source = (original && (original.nested || original.fields || original.values)) || original;
        this._format();
    }

    protected abstract _format(): void;
}

export class Field extends Format{
    declare rule: Rule;
    declare type: string;
    declare id: number;
  
    protected _format() {
        if(!this.source){
            return;
        }
        this.type = utils.convertToJSTypes(this.source.type);
        this.id = this.source.id;
        this.rule = utils.getRule(this.source.rule);
    }
}
export class Enum extends Format{
    
    declare map: Map<string,number>;
    protected _format() {
        if(!this.source){
            return;
        }
        this.map = new Map();
        for (const key in this.source) {
            const element = this.source[key];
            this.map.set(key,element)
        }
    }
}
export class Message extends Format{

    declare fields: Field[];
    protected _format() {
        if(!this.source){
            return;
        }

        this.fields = [];
        for (const key in this.source) {
            const element = this.source[key];
            this.fields.push(new Field(key,element));
        }
    }
}
export class Namespace extends Format{
    
    declare messages: Message[];
    declare enums: Enum[];

    protected _format(){
        if(!this.source){
            return;
        }
        this.messages = [];
        this.enums = [];
        
        for (const key in this.source) {
            const element = this.source[key];
            let type = utils.getObjectType(element);
            switch (type) {
                
                case ObjectType.Message:
                    this.messages.push(new Message(key,element));
                    break;
                    
                case ObjectType.Enum:
                    this.enums.push(new Enum(key,element));
                    break;
            
                default:
                    break;
            }
        }
    }

}
export class Root extends Format{
    declare namespaces: Namespace[];

    constructor(name: string,source: any){
        super(name,source);
    }
    protected _format(){
        this.namespaces = [];
        if(!this.source){
            return;
        }
        for (const key in this.source) {
            const element = this.source[key];
            let ns = new Namespace(key,element);
            this.namespaces.push(ns);
        }
        console.log(`prase-> `);
        
    }
}

let utils = {

    getObjectType(data: any){
        if("nested" in data){
            return ObjectType.NameSpace;
        }
        if("fields" in data){
            return ObjectType.Message;
        }
        if("values" in data){
            return ObjectType.Enum;
        }
        return ObjectType.Empty;
    },

    getRule(rule: string){
        if(rule == "repeated"){
            return Rule.Repeated;
        }
        if(rule == "required"){
            return Rule.Required;
        }
        return Rule.Optional;
    },

    convertToJSTypes(type: string){
        return ConvertTypes[type] || type;
    }
}

export class Prase{
    async run(url: string){

        let res = await this.load(url);
        let json = JSON.parse(res);
        let root = new Root("root",json);

        return root;
    }

    load(url: string){
        return new Promise<string>((resolve, reject) => {
            pbjs.main(['-t', 'json', url], (err: Error|null, output?: string) => {
                if(err){
                    reject("load err")
                    return;
                }
                resolve(output!);
            });
        })
    }
}