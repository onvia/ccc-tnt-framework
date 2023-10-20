
import { net } from '../framework/Net';
import { timeUtils } from '../framework/TimeUtils';
const { handler,apiRequest } = net;
@handler()
export class HeartbeatService {

    @apiRequest("HeartBeat")
    _onRecvBeat(data) {
        console.log(`HeartbeatService-> 心跳: `,timeUtils.now());
        return {};
    }
}
