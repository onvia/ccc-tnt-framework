
class UserData {

    nickName: string = '玩家';
    level: number = 0;
    gold: number = 0;
    gem: number = 0;
    atk: number = 0;
    maxHP: number = 999;
    maxMP: number = 999;


    private static _instance: UserData = null
    public static getInstance(): UserData {
        if (!this._instance) {
            this._instance = new UserData();
        }
        return this._instance;
    }
}

export let userData = UserData.getInstance();