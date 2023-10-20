import { Service } from "./Service";
import { net } from '../framework/Net';
import { timeUtils } from '../framework/TimeUtils';
const { handler,apiRequest } = net;

@handler()
export class LoginService{

    @apiRequest("User")
    async _onRecvLogin(data: cs.C2S_User) {
        let recvData: cs.S2C_User = {
            time: timeUtils.now(),
			player: {
                id: 999,
                name: "测试",
                enterTime: timeUtils.now(),
            }
        };
        return recvData;
    }
}