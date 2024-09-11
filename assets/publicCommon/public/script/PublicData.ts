import GameConst from "../../../scripts/define/GameConst";
import { PUBLIC_EVENTS } from "../../../scripts/event/PublicEvents";
import EventCenter from "../../../scripts/kernel/core/event/EventCenter";
import { AutoRounds, BaseGoldInfo, InitUIAutoInfo } from "../../../scripts/models/GameModel";

interface BetInfo {
    // 基本下注单位 @int64
    bet_size?: number;
    // 倍率 @int32
    bet_multiple?: number;
    // 20,  固定20 @int32
    basic_bet?: number;
    // 实际下注 @int64
    total_bet?: number;
    // 下注ID @int32
    id?: number;
    // 字符串形态
    bet_size_s?: string;
    // 字符串形态
    total_bet_s?: string;
}

interface BetInfoRsp {
    // 下注的信息, 这里获取
    bet_list?: BetInfo[];
    // 默认的ID @int32
    default_id?: number;
    // 加减组合id @int32
    addSubCombination?: number[];
}

class _PublicData {

    betInfo: BetInfoRsp = null;

    private _curBetId: number = 0;
    
    balance: number = 0;
    /**最后一次赢得的钱 */
    lastWinAmount: number = 0;

    /**可选项倍数列表 */
    optionalMultipleLists: number[] = [];
    /**可选项下注列表 */
    optionalBetAmountLists: number[] = [];
    /**可选项总下注列表 */
    optionalTotalAmountLists: number[] = [];

    constructor() {
        EventCenter.getInstance().listen(PUBLIC_EVENTS.BALANCE_INFO, (data: number | Function) => {
            if (typeof(data) == "number") {
                this.balance = data;
            } else {
                data && data(this.balance);
            }
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.LAST_WIN_INFO, (data: number | Function) => {
            if (typeof(data) == "number") {
                this.lastWinAmount = data;
            } else {
                data && data(this.lastWinAmount);
            }
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.SET_BET_INFO, (info, betId) => {
            this.setBetInfo(info, betId);
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.GET_BET_ID, (cb: Function) => {
            cb(this._curBetId)
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.GET_BET_AMOUNT, (cb: Function) => {
            cb(this.getCurBetAmount())
        }, this);

    }

    setBetInfo(betInfo: BetInfoRsp, curBetId: number) {
        this.betInfo = betInfo;
        this._curBetId = curBetId;
        this.setOptionalLists(betInfo.bet_list);
    }

    /**获取下注是否达到边界 */
    getBetAmountState(amount: number) {
        let ixMax = this.isMaxBet(amount)
        let isMin = this.isMinBet(amount)
        return { isMax: ixMax, isMin: isMin }
    }

    isMaxBet(amount: number) {
        let id = this.betInfo.addSubCombination[this.betInfo.addSubCombination.length - 1];
        let info = this.betInfo.bet_list[id - 1]
        if (amount >= info.total_bet) {
            return true
        }
        return false
    }

    isMinBet(amount: number) {
        let id = this.betInfo.addSubCombination[0];
        let info = this.betInfo.bet_list[id - 1]
        if (amount <= info.total_bet) {
            return true
        }
        return false
    }

    getCurBetAmount() {
        let betId = this._curBetId
        if (betId) {
            for (let index = 0; index < this.betInfo.bet_list.length; index++) {
                const element = this.betInfo.bet_list[index];
                if (element.id == betId) {
                    return element.total_bet;
                }
            }
        }
        return 0
    }

    getBetIdInfo(betId: number) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            const element = this.betInfo.bet_list[index];
            if (element.id == betId) {
                return element;
            }
        }
    }

    getCurBetId() {
        return this._curBetId;
    }

    reduceBetAmount() {
        let curBetAmountInfo = this.betInfo.bet_list[this._curBetId - 1];
        let isSelect: boolean = false;
        for (let index = this.betInfo.addSubCombination.length - 1; index >= 0; index--) {
            const element = this.betInfo.addSubCombination[index];
            let betInfo = this.getBetIdInfo(element)
            if (betInfo.total_bet < curBetAmountInfo.total_bet) {
                this._curBetId = betInfo.id;
                isSelect = true;
                break;
            }
        }
        return this.betInfo.bet_list[this._curBetId - 1].total_bet
    }

    addBetAmount() {
        let curBetAmountInfo = this.betInfo.bet_list[this._curBetId - 1];
        for (let index = 0; index < this.betInfo.addSubCombination.length; index++) {
            const element = this.betInfo.addSubCombination[index];
            let betInfo = this.getBetIdInfo(element)
            if (betInfo.total_bet > curBetAmountInfo.total_bet) {
                this._curBetId = betInfo.id;
                break;
            }
        }
        return this.betInfo.bet_list[this._curBetId - 1].total_bet
    }

    getInitUIAutoData() {
        let uiData: InitUIAutoInfo = {
            balance: this.balance,
            curBetAmount: this.getCurBetAmount(),
            lastWinAmount: this.lastWinAmount,
            selectNums: AutoRounds,
        }
        return uiData
    }

    getInitUIBetSettingData() {
        let uiData: BaseGoldInfo = {
            balance: this.balance,
            curBetAmount: this.getCurBetAmount(),
            lastWinAmount: this.lastWinAmount,
        }
        return uiData
    }
    
    private setOptionalLists(betList: BetInfo[]) {
        for (let index = 0; index < betList.length; index++) {
            const element = betList[index];
            let bet_multiple = element.bet_multiple
            let bet_size = element.bet_size / GameConst.BeseGold
            let total_bet = element.total_bet / GameConst.BeseGold
            if (this.optionalMultipleLists.indexOf(bet_multiple) == -1) {
                this.optionalMultipleLists.push(bet_multiple)
            }
            if (this.optionalBetAmountLists.indexOf(bet_size) == -1) {
                this.optionalBetAmountLists.push(bet_size)
            }
            if (this.optionalTotalAmountLists.indexOf(total_bet) == -1) {
                this.optionalTotalAmountLists.push(total_bet)
            }
        }
        this.optionalMultipleLists.sort((a1, a2) => {
            return a1 - a2
        })
        this.optionalBetAmountLists.sort((a1, a2) => {
            return a1 - a2
        })
        this.optionalTotalAmountLists.sort((a1, a2) => {
            return a1 - a2
        })
    }

    getBetInfoByTotal(total: number) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            let info = this.betInfo.bet_list[index];
            if (info.total_bet == total) {
                return info;
            }
        }
    }

    getBetInfoByAmount(betAmount: number, multiple: number, line: number = 0) {
        for (let index = 0; index < this.betInfo.bet_list.length; index++) {
            let betInfo = this.betInfo.bet_list[index];
            if (betInfo.bet_size == betAmount && betInfo.bet_multiple == multiple && (line == 0 || betInfo.basic_bet == line)) {
                return betInfo
            }
        }
    }

    getBetAmountIdx(amount: number) {
        for (let index = 0; index < this.optionalBetAmountLists.length; index++) {
            const element = this.optionalBetAmountLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    getBetMultipleIdx(amount: number) {
        for (let index = 0; index < this.optionalMultipleLists.length; index++) {
            const element = this.optionalMultipleLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    getBetTotalIdx(amount: number) {
        for (let index = 0; index < this.optionalTotalAmountLists.length; index++) {
            const element = this.optionalTotalAmountLists[index];
            if (amount == element) {
                return index
            }
        }
    }

    switchBetId(id: number) {
        this._curBetId = id;
        let amount = this.getCurBetAmount()
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BET_AMONUT, amount, false);
    }

}

export const PublicData = new _PublicData();