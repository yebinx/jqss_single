import { GameInfo, PlayerInfo } from "../interface/userinfo";
import BaseModel from "./BaseModel";

export default class LoginModel extends BaseModel {

    private token: string = "7955978BA6DC421C9473000B1E77C0F9"

    /**游戏相关信息 */
    gameInfo: GameInfo;

    /**玩家相关信息 */
    playerInfo: PlayerInfo;

    setToken(token) {
        this.token = token
    }

    getToken() {
        return this.token;
    }

    setPlayerInfo(info: PlayerInfo) {
        this.playerInfo = info
    }

    getPlayerInfo() {
        return this.playerInfo
    }
}