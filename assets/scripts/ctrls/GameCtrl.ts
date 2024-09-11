import { game, log, tween, warn } from "cc";
import { EViewNames } from "../configs/UIConfig";
import { GameState } from "../define/GameConst";
import Routes from "../define/Routes";
import GameEvent from "../event/GameEvent";
import { BetReq, BetRsp } from "../interface/bet";
import { ServerResult } from "../interface/common";
import { UserInfoRsp } from "../interface/userinfo";
import CocosUtil from "../kernel/compat/CocosUtil";
import { UIManager } from "../kernel/compat/view/UImanager";
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from "../kernel/compat/view/ViewDefine";
import EventCenter from "../kernel/core/event/EventCenter";
import { EHttpResult } from "../kernel/core/net/NetDefine";
import HttpMgr from "../mgrs/HttpMgr";
import GameModel, { GameMode } from "../models/GameModel";
import BaseCtrl from "./BaseCtrl";
import LoginCtrl from "./LoginCtrl";
import { PUBLIC_EVENTS } from "../event/PublicEvents";
import { l10n } from "../../../extensions/localization-editor/static/assets/l10n";
import BigNumber from "bignumber.js";
import { NetworkSend } from "../network/NetworkSend";
import DataManager from "../network/netData/DataManager";

export default class GameCtrl extends BaseCtrl<GameModel>{

    delayHandlerId: NodeJS.Timeout = null;

    delayTime: number = 0;

    /**极速模式 */
    isFast: boolean = false;

    /**是否有数据 */
    hasData: boolean = false;
    /**是否开始停止 */
    isStop: boolean = false;

    /**快停 */
    curQuickFast: boolean = false;
    /**当前急速 */
    curFast: boolean = false;

    static isFristReqRecord: boolean = false;

    /**自动旋转次数 */
    autoRollCnt: number = 0;

    /**开启自动定时器 */
    autoTimer: NodeJS.Timeout = null;

    /**暂存数据 */
    temporaryData: BetRsp = null;
    /**是否需要暂存数据 */
    isNeedTemporaryData: boolean = true;

    init() {
        this.setModel(new GameModel())
    }

    async enterGame() {
        this.register()
        let viewInfo = this.getModel().getInitViewInfo();
        this.getModel().gameInfo.free_remain_times = DataManager.CMD_S_StatusFree.nTotalFreeCount.value;
        this.getModel().getBetData().free_remain_times=DataManager.CMD_S_StatusFree.nTotalFreeCount.value;
        viewInfo.remainFreeTimes = this.getModel().gameInfo.free_remain_times;
        viewInfo.isEndFree = DataManager.CMD_S_StatusFree.nTotalFreeCount.value==1;
        if(viewInfo.remainFreeTimes>0)DataManager.preTotalFree=viewInfo.remainFreeTimes;
        await UIManager.showView(EViewNames.GameView, EUILayer.Panel, viewInfo);
        UIManager.closeView(EViewNames.LoadinView);
    }

    private register() {
        EventCenter.getInstance().listen(GameEvent.reconnect_tip, this.onShowReconnect, this)
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SWITCH_FAST, (cb: Function) => {
            this.isFast = !this.isFast;
            cb && cb(this.isFast);
        }, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CANCEL_AUTO, this.cancelAutoRoll, this);
        EventCenter.getInstance().listen("betReqErr",this.betReqErr,this);
        EventCenter.getInstance().listen("just_stop_roll",this.stopRoll,this);
        EventCenter.getInstance().listen("betResp",this.onBetResult,this);
    }

    onShowReconnect(cnt: number) {
        if (!UIManager.getView(EViewNames.ReconnectTip)) {
            UIManager.showView(EViewNames.ReconnectTip, EUILayer.Tip, cnt)
        }
    }

    getIdempotent() {
        return LoginCtrl.getIns().getModel().getPlayerInfo().id + Date.now() + ""
    }

    _reqBet(params: BetReq, req_cnt: number = 0) {
        HttpMgr.getIns().post(Routes.req_bet, params, (bSucc: boolean, info: ServerResult<BetRsp>) => {
            if (bSucc) {
                this.onBetResult(info.data)
            } else if (typeof (info) == "number") {
                if (info == EHttpResult.Error) {
                    this.onShowReqError(params)
                } else {
                    req_cnt++;
                    if (req_cnt <= 5) {
                        EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                        setTimeout(() => {
                            this._reqBet(params, req_cnt)
                        }, 5000);
                    } else {
                        this.onShowReqError(params);
                    }
                }
            } else {
                params.idempotent = this.getIdempotent();
                if (info.error_code == 136) {
                    let params: ParamConfirmDlg = {
                        callback: () => {
                        },
                        title: l10n.t("unable_transaction"),
                        content: l10n.t("incorrect_bet_amount").replace("%{1}", info.error_code.toString()),
                    }
                    UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
                } else if (info.error_code == 48 || info.error_code == 93) {//金额不足
                    let params: ParamConfirmDlg = {
                        callback: () => {
                            let datas = this.getModel().getTestElementList();
                            this.getModel().curBetResultRoundList = [];
                            this.getModel().betData.prize = 0;
                            this.getModel().betData.free = false;
                            EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
                            GameCtrl.getIns().cancelAutoRoll()
                        },
                        title: l10n.t("unable_transaction"),
                        content: l10n.t("insufficient_points").replace("%{1}", info.error_code.toString()),
                        okTxt: l10n.t("shared_btn_success")
                    }
                    UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
                } else {
                    req_cnt++;
                    if (req_cnt <= 5) {
                        EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                        setTimeout(() => {
                            this._reqBet(params, req_cnt)
                        }, 5000);
                    } else {
                        this.onShowReqError(params, false);
                    }
                }
            }
        })
    }

    onShowReqError(params: any, isFree?: boolean) {
        let info = new ParamConfirmDlg("net_error", l10n.t("shared_NetworkErrorMessage"), EDialogType.ok_cancel, (menuId: EDialogMenuId) => {
            if (menuId == EDialogMenuId.ok) {
                if (document.referrer.length > 0) { // 后退
                    window.history.back();
                    return;
                }
                game.end();
            } else if (menuId == EDialogMenuId.cancel) {
                setTimeout(() => {
                    if (isFree) {
                        this._reqFree(params)
                    } else {
                        this._reqBet(params)
                    }
                }, 100);
            }
        });
        info.thisObj = this;
        info.title = l10n.t("shared_note_title_transaction_fail")
        info.okTxt = l10n.t("shared_btn_exit")
        info.cancelTxt = l10n.t("shared_btn_retry")
        UIManager.showView(EViewNames.UIConfirmDialog, EUILayer.Dialog, info)
    }

    /**下注 */
    reqBet(isBuyFree: boolean = false) {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT,(betAmount)=>{
            let tTotalAmount = betAmount;
            NetworkSend.Instance.sendStartSpin({mTotalAmount:tTotalAmount});
        },this)
        // let id = 0;
        // EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_ID, (betId) => {
        //     id = betId;
        // })
        // let params: BetReq = {
        //     token: LoginCtrl.getIns().getModel().getToken(),
        //     id: id,
        //     buy_free: isBuyFree,
        //     idempotent: this.getIdempotent(),
        // }
        // warn("下注", params);
        // this._reqBet(params)
    }

    /**请求免费 */
    reqFree() {
        let tTotalAmount = 0;
        NetworkSend.Instance.sendStartSpin({mTotalAmount:tTotalAmount});
        let params: BetReq = {
            token: LoginCtrl.getIns().getModel().getToken(),
            idempotent: this.getIdempotent(),
        }
        // warn("请求免费", params);
        // this._reqFree(params)
    }

    /**免费请求 */
    _reqFree(params: BetReq, req_cnt: number = 0) {
        HttpMgr.getIns().post(Routes.req_free, params, (bSucc: boolean, info: ServerResult<BetRsp>) => {
            if (bSucc) {
                this.onBetResult(info.data)
            } else if (typeof (info) == "number") {
                if (info == EHttpResult.Error) {
                    this.onShowReqError(params, true)
                } else {
                    req_cnt++;
                    if (req_cnt <= 5) {
                        EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                        setTimeout(() => {
                            this._reqFree(params, req_cnt)
                        }, 5000);
                    } else {
                        this.onShowReqError(params, true);
                    }
                }
            } else {
                params.idempotent = this.getIdempotent();
                if (info.error_code == 136) {
                    let params: ParamConfirmDlg = {
                        callback: () => {
                        },
                        title: l10n.t("unable_transaction"),
                        content: l10n.t("incorrect_bet_amount").replace("%{1}", info.error_code.toString()),
                    }
                    UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
                } else if (info.error_code == 154) {//金额不足
                    let params: ParamConfirmDlg = {
                        callback: () => {
                            let datas = this.getModel().getTestElementList();
                            this.getModel().curBetResultRoundList = [];
                            EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
                        },
                        title: l10n.t("unable_transaction"),
                        content: l10n.t("insufficient_points").replace("%{1}", info.error_code.toString()),
                        okTxt: l10n.t("shared_btn_success")
                    }
                    UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
                } else {
                    warn("免费重试", req_cnt)
                    req_cnt++;
                    if (req_cnt <= 5) {
                        EventCenter.getInstance().fire(GameEvent.reconnect_tip, req_cnt)
                        setTimeout(() => {
                            this._reqFree(params, req_cnt)
                        }, 5000);
                    } else {
                        this.onShowReqError(params, true);
                    }
                }
            }
        })
    }

    /**请求转动 */
    reqRoll(isBuyFree: boolean = false) {
        log("请求滚动", this.getModel().isFree(), this.getModel().isIntoFree());
        this.hasData = false;
        this.isStop = false;
        this.getModel().roundNum = 0;
        let betAmount = 0
        let balance = 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (amount) => {
            betAmount = amount;
        })
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BALANCE_INFO, (num) => {
            balance = num;
        })
        if (this.getModel().isFree() || this.getModel().isIntoFree()) {
            this.reqFree()
        } else {
            this.reqBet(isBuyFree)

            if (isBuyFree) {
                betAmount = new BigNumber(betAmount).multipliedBy(75).toNumber();
            }
            if (balance >= betAmount) {
                // if (isBuyFree) {
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_BALANCE_AMOUNT, balance - betAmount);
                // } else {
                //     EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_BALANCE_AMOUNT, balance - betAmount);
                // }
            }
        }
        if (this.isFast && this.getModel().isFree()) {
            this.delayTime = 0
        } else {
            this.delayTime = 500
        }
        this.curFast = this.getModel().isFree() ? false : this.isFast;
        this.curQuickFast = false;
        EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.roll)
        EventCenter.getInstance().fire(GameEvent.game_start_roll, this.curFast);
        EventCenter.getInstance().fire(GameEvent.game_clear_award_result);
    }

    /**下注返回 */
    private onBetResult(data: BetRsp) {
        if (this.isNeedTemporaryData) {
            this.temporaryData = data;
            this.isNeedTemporaryData = false;
        } else {
            // debugger
            this.hasData = true;
            this.getModel().setBetResult(data);
            if (data.free && DataManager.preTotalFree==0) {
                this.getModel().mode = GameMode.into_free
            } else if (data.trigger_free) {
                this.getModel().mode = GameMode.free_again
            } else if (data.free_remain_times == 0 && DataManager.preTotalFree > 0) {
                this.getModel().mode = GameMode.last_free
            } else if (data.free_remain_times > 0) {
                this.getModel().mode = GameMode.free
            } else {
                this.getModel().mode = GameMode.normal
            }
            warn("当前游戏模式", GameModel[this.getModel().mode])
            this.delayHandlerId = setTimeout(() => {
                this.startRoll()
            }, this.delayTime);
            this.temporaryData = null;
            this.isNeedTemporaryData = true;
        }
    }

    updateBetResult() {
        this.isNeedTemporaryData = false;
        if (this.temporaryData) {
            this.onBetResult(this.temporaryData);
            this.temporaryData = null;
        }
    }

    /**普通模式下开始滚动 */
    private startRoll() {
        warn("普通模式下开始滚动", this.hasData, this.isStop);
        if (this.hasData) {
            clearTimeout(this.delayHandlerId)
            this.delayHandlerId = null;
            let datas = this.getModel().getResultElementDatas(0);
            EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
        }
    }

    openAutoRoll(idx: number) {
        let cnt: number = this.getModel().getAutoRollCntByIdx(idx);
        if (cnt) {
            this.autoRollCnt = cnt;
            EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
            this.autoTimer = setTimeout(() => {
                this.autoRollCnt--
                EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
                this.reqRoll()
            }, 500);
        }
    }

    cancelAutoRoll() {
        clearTimeout(this.autoTimer);
        this.autoRollCnt = 0;
        EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, false, 0)
    }

    private isFrist:boolean=true;
    /**检测是否需要自动旋转 */
    checkAutoRoll() {
        if (this.getModel().isFree() || this.getModel().isIntoFree()) {
            let tnum = (this.isFrist && DataManager.preTotalFree>0)?DataManager.preTotalFree:this.getModel().getBetData().free_remain_times;
            EventCenter.getInstance().fire(GameEvent.game_update_free_num, tnum - 1)
            this.isFrist=false;
            this.reqRoll();
        } else {
            if (this.autoRollCnt > 0) {
                this.autoRollCnt--
                EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, true, this.autoRollCnt)
                this.reqRoll();
            } else {
                clearTimeout(this.autoTimer);
                EventCenter.getInstance().fire(GameEvent.game_update_open_auto_roll, false, 0)
            }
        }
    }

    /**展示大奖动画 */
    async showBigWin(win: number) {
        return new Promise<number>(async (resolve, reject) => {
            let bet = 0;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num) => {
                bet = num;
            })
            let rate = win / bet;
            let level = this.getModel().getResultBigAwardAnimationLevel(rate);
            if (level != 0) {
                await CocosUtil.wait(0.5);
                await UIManager.showView(EViewNames.ResultBigAward, EUILayer.Panel, { amounts: this.getModel().getResultBigAwardAnimationNums(bet, win) });
            }
            resolve(level);
        })
    }

    /**展示中奖结果 */
    showResultAward() {
        this.showNormalModeResultAward();
    }

    /**正常模式结算 */
    showNormalModeResultAward() {
        let uiData = this.getModel().getResultAwardUIDatas(this.getModel().roundNum);
        if(!uiData)console.log("正常模式结算", this.getModel().roundNum);
        EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.show_result)
        EventCenter.getInstance().fire(GameEvent.game_show_award_result, uiData)
        this.getModel().roundNum++;
    }

    reqGetBanlance(callback) {
        let param = {
            "token": LoginCtrl.getIns().getModel().getToken(),
        };
        HttpMgr.getIns().post(Routes.req_login, param, (bSucc: boolean, info: ServerResult<UserInfoRsp>) => {
            if (bSucc) {
                callback(info.data.player_info.balance)
            } else {
                callback(null)
            }
        })
    }

    /**取消延时停止移动 */
    cancelDelayShowResult() {
        EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.cancel_roll)
        this.curQuickFast = true;
        this.startRoll()
    }

    stopRoll(){
        let datas = this.getModel().getTestElementList();
        this.getModel().curBetResultRoundList = [];
        EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
    }

    private betReqErr(code){
        let params: ParamConfirmDlg = {
            callback: () => {
                let datas = this.getModel().getTestElementList();
                this.getModel().curBetResultRoundList = [];
                EventCenter.getInstance().fire(GameEvent.game_start_stop_roll, { data: datas })
            },
            title: l10n.t("unable_transaction"),
            content: l10n.t("insufficient_points").replace("%{1}", code.toString()),
            okTxt: l10n.t("shared_btn_success")
        }
        UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
    }

}