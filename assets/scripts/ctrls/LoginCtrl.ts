import { error, game, warn } from "cc";
import BaseCtrl from "./BaseCtrl";
import LoginModel from "../models/LoginModel";
import { UserInfoRsp } from "../interface/userinfo";
import DateUtil from "../kernel/core/utils/DateUtil";
import HttpMgr from "../mgrs/HttpMgr";
import Routes from "../define/Routes";
import logger from "../kernel/core/logger";
import { ServerResult } from "../interface/common";
import GameConst from "../define/GameConst";
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from "../kernel/compat/view/ViewDefine";
import { UIManager } from "../kernel/compat/view/UImanager";
import { EViewNames } from "../configs/UIConfig";
import { BetInfoRsp } from "../interface/betinfo";
import GameCtrl from "./GameCtrl";
import { BetRsp } from "../interface/bet";
import EventCenter from "../kernel/core/event/EventCenter";
import { PUBLIC_EVENTS } from "../event/PublicEvents";
import { l10n } from "../../../extensions/localization-editor/static/assets/l10n";
import { GameMode } from "../models/GameModel";
import MoneyUtil from "../kernel/core/utils/MoneyUtil";
import DataManager from "../network/netData/DataManager";

export default class LoginCtrl extends BaseCtrl<LoginModel> {

    heartTimer: number = 0;
    /**登录失败重试此时 */
    reLoginTimes: number = 0;

    betInfoTimes: number = 0;

    loginInfo: UserInfoRsp = null;

    isTest: boolean = true
    // isTest: boolean = false

    init() {
        this.setModel(new LoginModel())
    }

    private stopHeartBeat() {
        if (this.heartTimer < 0) { return; }
        clearInterval(this.heartTimer);
        this.heartTimer = -1;
    }

    private startHeartBeat() {
        this.stopHeartBeat();
        //@ts-ignore
        this.heartTimer = setInterval(() => {
            let info = {
                timestamp: DateUtil.getSysTime(),
                token: this.getModel().getToken(),
            }
            HttpMgr.getIns().post(Routes.req_heartbeat, info);
        }, 8000);
        logger.log("开始心跳");
    }


    private _reqLogin(callback) {
        let param = {
            "token": this.getModel().getToken(),
        };
        HttpMgr.getIns().post(Routes.req_login, param, (bSucc: boolean, info: ServerResult<UserInfoRsp>) => {
            if (!bSucc) {
                if (info.error_code) {
                    this.onShowReqError(() => {
                        this.reLoginTimes = 0;
                        this._reqLogin(callback);
                    }, 1)
                } else {
                    this.reLoginTimes++;
                    if (this.reLoginTimes >= GameConst.MaxReLoginCnt) {
                        this.onShowReqError(() => {
                            this.reLoginTimes = 0;
                            this._reqLogin(callback);
                        }, 0)
                        return
                    }
                    logger.log("重新连接中...")
                    setTimeout(() => {
                        this._reqLogin(callback)
                    }, 5000);
                }
            } else {
                callback(info.data)
            }
        })
    }

    onShowReqError(cb: Function, type: number) {
        let info = new ParamConfirmDlg(type == 0 ? l10n.t("network_error") : l10n.t("account_irregularity"), type == 0 ? l10n.t("launch_failed") : l10n.t("fail_retrieve_account"), EDialogType.ok_cancel, (menuId: EDialogMenuId) => {
            if (menuId == EDialogMenuId.ok) {
                // if (document.referrer.length > 0) { // 后退
                //     window.history.back();
                //     return;
                // }
                game.end();
                window.close();
                window.location.href = "about:blank";
            } else if (menuId == EDialogMenuId.cancel) {
                // setTimeout(() => {
                //     cb()
                // }, 100);
                location.reload();
            }
        });
        info.thisObj = this;
        info.title = type == 0 ? l10n.t("network_error") : l10n.t("account_irregularity")
        info.okTxt = l10n.t("shared_btn_exit")
        info.cancelTxt = l10n.t("shared_title_reload")
        UIManager.showView(EViewNames.UIConfirmDialog, EUILayer.Dialog, info)
    }

    reqLogin(): Promise<UserInfoRsp> {
        return new Promise((res) => {
            this._reqLogin(res)
        })
    }

    reqSetMusicState() {
        HttpMgr.getIns().post(Routes.req_music, {
            "token": this.getModel().getToken(),
            "mute": this.getModel().getPlayerInfo().mute
        })
    }

    reqGetBetInfo(): Promise<BetInfoRsp> {
        return new Promise((res) => {
            this._reqBetInfo(res);
        })
    }

    _reqBetInfo(cb: Function) {
        HttpMgr.getIns().post(Routes.req_bet_info, { "token": this.getModel().getToken() }, (bSucc: boolean, info: ServerResult<BetInfoRsp>) => {
            if (!bSucc) {
                if (info.error_code) {
                    this.onShowReqError(() => {
                        this.betInfoTimes = 0;
                        this.reqGetBetInfo();
                    }, 1)
                } else {
                    this.betInfoTimes++;
                    if (this.betInfoTimes >= GameConst.MaxReLoginCnt) {
                        this.onShowReqError(() => {
                            this.betInfoTimes = 0;
                            this.reqGetBetInfo();
                        }, 0)
                        return
                    }
                    logger.red("获取下注信息失败")
                    setTimeout(() => {
                        this.reqGetBetInfo()
                    }, 5000);
                }
            } else {
                cb(info.data)
            }
        })
    }

    async getBetInfo() {
        let loginInfo = this.loginInfo;
        // let betInfo: BetInfoRsp = await this.reqGetBetInfo();
        let betInfo: BetInfoRsp = DataManager.initBetInfo()//await this.reqGetBetInfo();
        if (betInfo) {
            let lastWin = loginInfo.game_info.last_win;
            GameCtrl.getIns().getModel().setGameInfo(loginInfo.game_info);
            GameCtrl.getIns().getModel().setBetInfo(betInfo);
            let betResult = new BetRsp();
            betResult.free_remain_times = loginInfo.game_info.free_remain_times;
            betResult.free_game_total_win = lastWin;
            betResult.prize = lastWin;
            betResult.result = {
                round_list: loginInfo.last_round?.round_list
            }
            if (loginInfo.game_info.free_remain_times > 0) {
                GameCtrl.getIns().getModel().mode = GameMode.free
            }
            GameCtrl.getIns().getModel().setBetResult(betResult)
            GameCtrl.getIns().getModel().initGameData({
                balance: loginInfo.player_info.balance,
                list: loginInfo.list,
                lastWin: lastWin,
                lastRound: loginInfo.last_round?.round_list,
                isEndFree: loginInfo.last_round?.is_end_free
            })
            EventCenter.getInstance().fire(PUBLIC_EVENTS.USER_LOGIN_SUCCESS);
        }
    }

    async login(loginCb: () => void) {
        this.loginInfo = DataManager.initLoginData()
        // this.loginInfo = await this.reqLogin();
        warn("登录信息", this.loginInfo);
        this.startHeartBeat();
        MoneyUtil.UNIT = this.loginInfo.player_info?.currency_symbol || MoneyUtil.UNIT;
        MoneyUtil.currency_suggest_unit = this.loginInfo.player_info?.currency_suggest_unit || MoneyUtil.currency_suggest_unit;
        GameConst.BeseGold = GameConst.BeseGold * MoneyUtil.currency_suggest_unit
        this.getModel().setPlayerInfo(this.loginInfo.player_info);
        loginCb();
    }

    enterGame() {
        GameCtrl.getIns().enterGame()
    }
}