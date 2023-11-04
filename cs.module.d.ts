declare global{
	namespace cs{
		interface HeartBeatHandler{
			//@send("HeartBeat")
			sendHeartBeat(data: cs.C2S_HeartBeat): cs.C2S_HeartBeat;
			//@recv("HeartBeat")
			recvHeartBeat(data: cs.S2C_HeartBeat): void;
		}
		interface SyncTimeHandler{
			//@send("SyncTime")
			sendSyncTime(data: cs.C2S_SyncTime): cs.C2S_SyncTime;
			//@recv("SyncTime")
			recvSyncTime(data: cs.S2C_SyncTime): void;
		}
		interface BagHandler{
			//@send("Bag_GetInfo")
			sendBagGetInfo(data: cs.C2S_Bag_GetInfo): cs.C2S_Bag_GetInfo;
			//@recv("Bag_GetInfo")
			recvBagGetInfo(data: cs.S2C_Bag_GetInfo): void;
		}
		interface UserHandler{
			//@send("User")
			sendUser(data: cs.C2S_User): cs.C2S_User;
			//@recv("User")
			recvUser(data: cs.S2C_User): void;
		}
	}
}
export {};