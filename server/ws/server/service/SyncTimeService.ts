
import { net } from '../framework/Net';
import { timeUtils } from '../framework/TimeUtils';
const { handler,apiRequest } = net;
@handler()
export class SyncTimeService{


    @apiRequest('SyncTime')
    async _onRecvSyncTime(data: cs.C2S_SyncTime) {
        let recvData: cs.S2C_SyncTime = {
            ret: 1,
			serverTime: timeUtils.timestamp(),
        };
        return recvData;
    }
}
