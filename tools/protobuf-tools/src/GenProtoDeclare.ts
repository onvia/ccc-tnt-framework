import { DefJSTypes, Enum, Message, Namespace, Prase, Rule } from "./prase"

enum MessageType {
    C2S,
    S2C,
}

type ProtoType = { req: string, res: string, ns: string };
type MessageItem = { ns: Namespace, message: Message, type: MessageType ,fnName: string};
type ModuleItem = { messages: MessageItem[] };
type NSItem = {ns: Namespace, moduleItems: Map<string, ModuleItem>};

interface GenProtoDeclareOptions{
    // 生成模块接口
    genModuleInterface?: boolean;

    // 通用 信息结构体 命名空间
    commonNSName?: string;

}

export class GenProtoDeclare {

    declare msgIDProtoType: Map<string, ProtoType>;
    // declare moduleMap: Map<string, MessageItem[]>;
    declare nsItemMap: Map<string,NSItem>;
    declare IDContent: string;
    declare RETContent: string;
    declare messageContent: string;
    declare protoTypeContent: string;
    declare moduleInterfaceContent: string;
    declare options: GenProtoDeclareOptions;
    async parse(url: any,options?: GenProtoDeclareOptions) {
        let root = await new Prase().run(url)
        this.options = options;
        this.msgIDProtoType = new Map();
        // this.moduleMap = new Map();
        this.nsItemMap = new Map();
        this.IDContent = "\nexport enum MsgID{\n"
        this.RETContent = "\nexport enum NetMsgErrorID{\n";
        this.messageContent = "declare global{\n";
        this.moduleInterfaceContent = "declare global{\n";

        for (let i = 0; i < root.namespaces.length; i++) {
            let ns = root.namespaces[i];
            this.printIDEnum(ns);
            this.printRETEnum(ns);
        }

        for (let i = 0; i < root.namespaces.length; i++) {
            let ns = root.namespaces[i];
            this.printMessage(ns);
        }

        this.printProtoType();
        this.printInterface();

        this.IDContent += "}";
        this.RETContent += "}";

        this.messageContent += "\ttype Keyof_ProtoType = keyof ProtoType;\n";
        this.messageContent += `\t// 客户端请求\n`;
        this.messageContent += `\ttype ProtoTypeReq <T extends Keyof_ProtoType> = ProtoType[T]["req"];\n`
        this.messageContent += `\t// 服务端响应\n`;
        this.messageContent += `\ttype ProtoTypeRes <T extends Keyof_ProtoType> = ProtoType[T]["res"];\n`
        this.messageContent += "}\n";
        this.messageContent += "export {};";

        this.moduleInterfaceContent += "}\n";
        this.moduleInterfaceContent += "export {};";
    }


    printMessage(ns: Namespace) {

        this.messageContent += `\tnamespace ${ns.name}{\n`

        for (let i = 0; i < ns.messages.length; i++) {
            const message = ns.messages[i];
            this.messageContent += `\t\tinterface ${message.name}{\n`;
            for (let j = 0; j < message.fields.length; j++) {
                const field = message.fields[j];
                this.messageContent += `\t\t\t${field.name}`
                
                this.messageContent += (field.rule == Rule.Optional ? "?: " : ": ");
                
                let _checkType =  DefJSTypes.indexOf(field.type) != -1;
                if(_checkType){
                    this.messageContent += field.type;
                }else{

                    // 查找当前命名空间内是否有相同名字的 结构体
                    let finedItem = ns.messages.find((msg)=>{
                        return msg.name == field.type;
                    });
                    if(finedItem){
                        this.messageContent += field.type;
                    }else{
                        // 判断是否使用了 包名
                        if(field.type.includes(".")){
                            this.messageContent += field.type;
                        }else{

                            // 如果没有则强制使用 通用内的结构体 
                            let common = this.options?.commonNSName || "common";
                            this.messageContent += `${common}.${field.type}`;
                        }
                    }
                }

                this.messageContent += (field.rule == Rule.Repeated ? "[];" : ";");
                this.messageContent += "\n";
            }

            this.messageContent += `\t\t}\n`;

            this.collectProtoType(ns, message);
            this.collectModule(ns, message);
        }

        this.messageContent += "\t}\n";
    }
    //  收集模块
    collectModule(ns: Namespace, message: Message) {
        if(this.options?.genModuleInterface !== undefined && this.options?.genModuleInterface === false){
            return;
        }
        let infos = message.name.split("_");
        if(!infos.length){
            return;
        }

        let msgType = infos[0];
        let moduleName = infos[1];
        let funcName = infos[2];
        if(!moduleName){
            return;
        }

        let _nsItem = this.nsItemMap.get(ns.name);
        if(!_nsItem){
            _nsItem = {ns, moduleItems: new Map()};
            this.nsItemMap.set(ns.name,_nsItem);
        }
        
        let _moduleItem = _nsItem.moduleItems.get(moduleName);
        if(!_moduleItem){
            _moduleItem = {messages: []};
            _nsItem.moduleItems.set(moduleName,_moduleItem);
        }
        let moduleItem: MessageItem = {
            message,ns,type: MessageType[msgType],fnName: funcName || "",
        };
        _moduleItem.messages.push(moduleItem);
    }
    //  输出模块接口
    printInterface() {
        
        if(this.options?.genModuleInterface !== undefined && this.options?.genModuleInterface === false){
            return;
        }

        this.nsItemMap.forEach((nsItem,nsKey)=>{
            this.moduleInterfaceContent += `\tnamespace ${nsKey}{\n`
            nsItem.moduleItems.forEach((moduleItem,mKey)=>{
                this.moduleInterfaceContent += `\t\tinterface ${mKey}Handler{\n`;
                // this.moduleInterfaceContent += `\t\t\tonInit();\n`;
                
                moduleItem.messages.forEach((msgItem)=>{
                    let _Interface = `${nsKey}.${msgItem.message.name}`;
                    let isC2S = msgItem.type == MessageType.C2S;
                    // this.moduleInterfaceContent += `\t\t\t//@${msgItem.type == MessageType.C2S ? "send" :"recv"}("${nsKey}.${msgItem.message.name.replace("C2S_","").replace("S2C_","")}")\n`;
                    this.moduleInterfaceContent += `\t\t\t//@${isC2S ? "send" :"recv"}("${msgItem.message.name.replace("C2S_","").replace("S2C_","")}")\n`;
                    this.moduleInterfaceContent += `\t\t\t${isC2S ? "send" :"recv"}${mKey}${msgItem.fnName}(data: ${_Interface}): ${isC2S ? _Interface : "void"};\n`;
                });
                this.moduleInterfaceContent += `\t\t}\n`;
            });
            this.moduleInterfaceContent += "\t}\n"
        });
    }

    collectProtoType(ns: Namespace, message: Message) {
        let key: string = null;
        let code = 0;
        if (message.name.startsWith("C2S_")) {
            key = message.name.replace("C2S_", "");
            code = 1;
        }

        if (message.name.startsWith("S2C_")) {
            key = message.name.replace("S2C_", "");
            code = 2;
        }
        if (code != 0) {
            let value = this.msgIDProtoType.get(key);
            if (!value) {
                console.warn(`gen-declare-> ${key} 消息 ID 不存在 ${message.name}`);
                return;
            }
            value.ns = ns.name;
            if (code == 1) {
                value.req = `${ns.name}.${message.name}`;
            } else if (code == 2) {
                value.res = `${ns.name}.${message.name}`;
            }
        }
    }
    printProtoType() {
        this.messageContent += "\n\n\tinterface ProtoType {\n";
        this.msgIDProtoType.forEach((val, key) => {
            if (!val.req || !val.res) {
                console.warn(`gen-declare-> ${key}, 接口不存在`);
                return;
            }
            
            // this.messageContent += `\t\t"${val.ns}.${key}": {\n`;
            this.messageContent += `\t\t"${key}": {\n`;
            this.messageContent += `\t\t\treq: ${val.req},\n`;
            this.messageContent += `\t\t\tres: ${val.res}\n`;
            this.messageContent += "\t\t},\n"
        });
        this.messageContent += "\t}\n";
    }

    printIDEnum(ns: Namespace) {
        let idEnum = ns.enums.find((val) => {
            return val.name === 'ID';
        });
        // MsgID
        if (idEnum) {
            // this.IDContent += `\n\t// ${ns.name} \n`
            this.IDContent = this.printEnum(ns,idEnum, this.IDContent, this.msgIDProtoType);
        }
    }
    printRETEnum(ns: Namespace) {
        let retEnum = ns.enums.find((val) => {
            return val.name === 'RET';
        });

        // NetMsgErrorID
        if (retEnum) {
            // this.RETContent += `\n\t// ${ns.name} \n`
            this.RETContent = this.printEnum(ns,retEnum, this.RETContent);
        }
    }

    printEnum(ns: Namespace,idEnum: Enum, content: string, map?: Map<string, ProtoType>) {
        idEnum.map.forEach((val, key) => {
            content += `\t${key} = ${val},\n`;

            // 收集对应的协议
            if (map) {
                let code = 0;
                let _key = "";
                if (key.startsWith("ID_C2S_")) {
                    _key = key.replace("ID_C2S_", "");
                    code = 1;
                }

                if (key.startsWith("ID_S2C_")) {
                    _key = key.replace("ID_S2C_", "");
                    code = 2;
                }
                if (!code) {
                    return;
                }
                if (map.has(_key)) {
                    return;
                }
                map.set(_key, { req: null, res: null,ns:null });
            }
        });

        return content;
    }


}