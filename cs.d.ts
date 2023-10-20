declare global{
	namespace cs{
		interface Pack{
			id?: number;
			data?: ArrayBuffer;
		}
		interface C2S_HeartBeat{
		}
		interface S2C_HeartBeat{
		}
		interface C2S_SyncTime{
		}
		interface S2C_SyncTime{
			ret?: number;
			serverTime?: number;
		}
		interface C2S_Bag_GetInfo{
		}
		interface S2C_Bag_GetInfo{
			ret?: number;
			items: Item[];
			ob?: UserObject;
		}
		interface UserObject{
		}
		interface Item{
			type?: number;
			value?: number;
			count?: number;
		}
		interface Player{
			id?: number;
			name?: string;
			enterTime?: number;
		}
		interface C2S_User{
			username?: number;
			password?: string;
		}
		interface S2C_User{
			time?: number;
			player?: Player;
		}
	}


	interface ProtoType {
		"HeartBeat": {
			req: cs.C2S_HeartBeat,
			res: cs.S2C_HeartBeat
		},
		"SyncTime": {
			req: cs.C2S_SyncTime,
			res: cs.S2C_SyncTime
		},
		"User": {
			req: cs.C2S_User,
			res: cs.S2C_User
		},
		"Bag_GetInfo": {
			req: cs.C2S_Bag_GetInfo,
			res: cs.S2C_Bag_GetInfo
		},
	}
	type Keyof_ProtoType = keyof ProtoType;
	// 客户端请求
	type ProtoTypeReq <T extends Keyof_ProtoType> = ProtoType[T]["req"];
	// 服务端响应
	type ProtoTypeRes <T extends Keyof_ProtoType> = ProtoType[T]["res"];
}
export {};