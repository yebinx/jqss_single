import { Game, Vec2, log, v2, warn } from "cc";
import GameConst, { TItemtype } from "../define/GameConst";
import { BetRsp } from "../interface/bet";
import { TPrize, TRound } from "../interface/result";
import { GameInfo } from "../interface/userinfo";
import EventCenter from "../kernel/core/event/EventCenter";
import BaseModel from "./BaseModel";
import { PUBLIC_EVENTS } from "../event/PublicEvents";
import { BetInfoRsp } from "../interface/betinfo";
import DataManager from "../network/netData/DataManager";

export interface BaseGoldInfo {
    balance?: number//玩家余额
    curBetAmount?: number//当前下注的钱
    lastWinAmount?: number//赢得的前
}

export interface InitUIInfo extends BaseGoldInfo {
    elementList: Array<Array<number>> //初始化元素列表
    lastResultAwardUIInfo: TRound//上局展示结果
    remainFreeTimes: number // 是否是免费中
    isEndFree: boolean //是否是免费最后一把
}
export interface InitUIAutoInfo extends BaseGoldInfo {
    selectNums: number[]
}


const rates: number[] = [15, 30, 50]

/**自动旋转的次数 */
export const AutoRounds = [10, 30, 50, 80, 1000];

export interface EPoint {
    col: number,
    row: number,
    isAward?: boolean,
}

const LineToElementPosList: Array<Array<EPoint>> = [
    [
        { col: 0, row: 1 },
        { col: 1, row: 1 },
        { col: 2, row: 1 },
    ],
    [
        { col: 0, row: 2 },
        { col: 1, row: 2 },
        { col: 2, row: 2 },
    ],
    [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
        { col: 2, row: 0 },
    ],
    [
        { col: 0, row: 2 },
        { col: 1, row: 1 },
        { col: 2, row: 0 },
    ],
    [
        { col: 0, row: 0 },
        { col: 1, row: 1 },
        { col: 2, row: 2 },
    ],
]

export class ClientElement {
    id: number = 0;
    count: number = 0;
    rowIdx: number = -1;

    constructor(id: number, count: number, rowIdx: number) {
        this.id = id;
        this.count = count;
        if (rowIdx < GameConst.MaxRow - 1) {
            this.rowIdx = rowIdx;
        }
    }
}

export interface ResultLineInfo {
    idx: number,//编号
    win: number,//单条线赢多少钱
    ePoint: Array<EPoint>//对应二维数组位置
}

/** 一列符号 */
export interface TColSymbol {
    list: number[];
}

export interface TResult {
    /**  */
    round_list: TRound[];
    /** 本轮中奖的基本倍率 */
    rate: number;
    /** 夺宝数量 */
    scatter_count: number;
    /** 获得几次免费次数 */
    free_play: number;
    /** 开奖位置, 列*100 + 开奖idx */
    scatter_symbol_point: number[];
}

/**中奖结果展示信息 */
export interface ResultAwardUIInfo {
    balance: number;
    /** 本次所有卡牌, 0-22, */
    item_type_list: number[];
    /** 本次中奖的 */
    round_rate: number;
    /** 轮号 */
    round: number;
    /** 翻倍倍数表 */
    multi_time: number;
    /** 奖励列表 */
    prize_list: TPrize[];
    /** 下一次要出的列表 */
    next_list: number[];
    /** 数组形态, 这个形态下会出更多的内容 */
    list: TItemtypeList[];
    /** 胜利位置, 所有一起的胜利的位置 */
    win_pos_list: number[];
    /** 二维数组 */
    dyadic_list: TDyadic[];
    /** 用来垫底的列表 */
    previous_list: number[];
    /** 用来垫底的列表, 左右2个 */
    two_bottom_list: number[];
    /** 从左边往右， 从下往上 */
    col_symbol_list: TColSymbol[];
    /** 开奖位置, 列*100 + 开奖idx */
    win_symbol_point: number[];
    /**
     * int32                  win_balance       = 23; // 赢多少
     * int32                  round             = 24; // 轮号
     * int32                  rate              = 25; // 本轮总赢倍率 总额 / 线数 / 押分
     */
    free_play: number;
    /**当前赢分 */
    win: number;
}

export interface TItemtypeList {
    /** 列表 */
    item_type_list: number[];
}

/** 展示用的二维数组 */
export interface TDyadic {
    list: number[];
}

/**不中奖结果展示信息 */
export interface ResultNoAwardUIInfo {
    /**百搭元素的位置 */
    wdElementPosList: Array<EPoint>,
}

export enum GameMode {
    normal,
    into_free,
    free,
    free_again,
    last_free
}

export default class GameModel extends BaseModel {
    /**加减下注列表 */
    addSubCombination: number[] = []

    gameInfo: GameInfo;

    betInfo: BetInfoRsp;

    mode: GameMode = GameMode.normal;

    elementList: Array<Array<number>> = [];

    betData: BetRsp;
    /**当前下注结果集合 */
    curBetResultRoundList: TRound[] = [];

    /**收集百搭个数 */
    collectWdCnt: number = 0;

    /**当前第几轮消除 */
    roundNum: number = 0;

    /**总赢奖倍数 */
    rate: number = 0;

    /**倍数列表 */
    multipleList: number[] = [1, 2, 3, 5];

    /**是否出现龙卷特效 */
    isShowLongJuan: boolean = false;

    /**大奖配置 */
    winConfig = [15, 30, 50];

    isEndFree: boolean = false;

    initGameData(data: { balance: number, list: { item_type_list: number[] }[], lastWin: number, lastRound: TRound[], isEndFree: boolean }) {
        warn("initGameData", data)
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BALANCE_INFO, data.balance);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.LAST_WIN_INFO, data.lastWin);
        this.setElementList(data.list);
        this.curBetResultRoundList = data.lastRound;
        this.isEndFree = data.isEndFree;
    }

    setGameInfo(info: GameInfo) {
        this.gameInfo = info;
    }

    setBetInfo(info: BetInfoRsp) {
        this.betInfo = info;
        this.betInfo.addSubCombination = info.add_sub_combination;
        let tbetid = this.gameInfo.last_time_bet_id || info.default_id;
        let tlocalBetId = parseInt(localStorage.getItem(DataManager.userId+"_bet_id"));
        if(tlocalBetId && tlocalBetId>0){
            tbetid = tlocalBetId;
        }
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_BET_INFO, info, tbetid)
    }

    getBetData() {
        return this.betData;
    }

    public getBetAmount(){
        
    }

    /**设置初始化元素信息 牌面 */
    setElementList(list: { item_type_list: number[] }[]) {
        log("设置初始化元素信息 牌面", JSON.stringify(list))
        this.elementList = this.svrElementArrayConvertTo2Array(list)
    }

    getTestElementList() {
        return this.svrElementArrayConvertTo2Array([
            { item_type_list: [13, 13, 2, 12, 12, 5, 9].reverse() },
            { item_type_list: [13, 48, 48, 4, 48, 48, 3].reverse() },
            { item_type_list: [13, 9, 12, 48, 48, 5, 6].reverse() },
            { item_type_list: [13, 8, 8, 13, 10, 48, 3].reverse() },
            { item_type_list: [13, 48, 48, 6, 11, 48, 5].reverse() },
            { item_type_list: [13, 2, 10, 10, 12, 6, 13].reverse() }
        ])
    }

    /**拼接服务器元素数据 */
    splicingServerEleData(symbolList: { list: number[] }[]) {
        symbolList = JSON.parse(JSON.stringify(symbolList));

        let elementList: Array<Array<number>> = [];
        let arr = GameConst.ElementList.slice(0);
        for (let i = 0; i < symbolList.length; i++) {
            let list = symbolList[i].list;
            if (list.length < GameConst.MaxRow) {
                arr.sort((a, b) => {
                    return Math.random() - 0.5;
                });
                let n = GameConst.MaxRow - list.length;
                list.push(...arr.slice(0, n));
            }

            list = list.reverse();
            elementList.push(list);
        }

        log("拼接服务器元素数据", elementList);
        return elementList
    }

    /**服务器一维元素数组装换客户端二维数组 */
    svrElementArrayConvertTo2Array(serverElementArray: { item_type_list: number[] }[]) {
        serverElementArray = JSON.parse(JSON.stringify(serverElementArray));

        let elementList: Array<Array<number>> = [];
        let arr = GameConst.ElementList.slice(0);
        for (let i = 0; i < serverElementArray.length; i++) {
            let list = serverElementArray[i].item_type_list;
            if (list.length < GameConst.MaxRow) {
                arr.sort((a, b) => {
                    return Math.random() - 0.5;
                });
                let n = GameConst.MaxRow - list.length;
                list.push(...arr.slice(0, n));
            }

            list = list.reverse();
            elementList.push(list);
        }

        log("初始客户端数据", elementList)
        return elementList
    }

    /**服务器的pos装换为客户端二维数组行列 */
    svrPosArrayConvertToRowAndCol(serverPosArray: number[]) {
        let points: Array<EPoint> = [];
        for (let index = 0; index < serverPosArray.length; index++) {
            let pos = serverPosArray[index]
            let col = Math.floor(pos / GameConst.MaxRow)
            let row = GameConst.MaxRow - (pos % GameConst.MaxRow);
            points.push({ col: col, row: row - 1 })
        }
        return points
    }


    /**下注结果 */
    setBetResult(data: BetRsp) {
        this.betData = data;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BALANCE_INFO, data.balance);
        this.curBetResultRoundList = data.result.round_list;
        this.rate = data.result.rate;
        log("下注结果", data.result.round_list);
    }

    /**是否是免费中 */
    isFree() {
        return this.mode == GameMode.free || this.mode == GameMode.free_again || this.mode == GameMode.last_free;
    }

    /**是否是免费中免费 */
    isFreeAgain() {
        return this.mode == GameMode.free_again;
    }

    /**第一次进免费 */
    isIntoFree() {
        return this.mode == GameMode.into_free;
    }

    /**最后一把免费 */
    isLastFree() {
        return this.mode == GameMode.last_free;
    }

    /**获取指定回合的结果元素数据列表 */
    getResultElementDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        log("获取指定回合的结果元素数据列表", roundData);
        if (roundData) {
            return this.splicingServerEleData(roundData.col_symbol_list);
        }
    }

    getRoundData(roundIdx: number) {
        return this.curBetResultRoundList[roundIdx];
    }

    /**获取指定回合的结果奖励数据列表 */
    getResultAwardUIDatas(roundIdx: number) {
        let roundData = this.curBetResultRoundList[roundIdx];
        log("获取指定回合的结果奖励数据列表", roundIdx, roundData, this.curBetResultRoundList)
        if (roundData) {
            return roundData;
        }
    }

    /**不中奖数据 */
    getResulNoAwardUIDatas() {
        let roundData = this.curBetResultRoundList[0];
        if (roundData) {
            let wdElementPosList = this.getWdElementPosList(roundData.item_type_list)
            let noArawdInfo: ResultNoAwardUIInfo = {
                wdElementPosList: wdElementPosList,
            }
            return noArawdInfo
        }
    }

    getElementList() {
        return this.elementList;
    }

    /**界面初始化信息 */
    getInitViewInfo() {
        let last = null;
        if (this.curBetResultRoundList) {
            last = this.getResultAwardUIDatas(this.curBetResultRoundList.length - 1);
        }
        let list = null;
        if (last) {
            list = this.splicingServerEleData(last.col_symbol_list)
        }
        let balance = 0, lastWin = 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BALANCE_INFO, (data) => {
            balance = data;
        })
        EventCenter.getInstance().fire(PUBLIC_EVENTS.LAST_WIN_INFO, (data) => {
            lastWin = data;
        })
        let viewInfo: InitUIInfo = {
            balance: balance,
            lastWinAmount: lastWin,
            elementList: list ? list : this.elementList,
            lastResultAwardUIInfo: last,
            remainFreeTimes: this.gameInfo.free_remain_times,
            isEndFree: this.isEndFree
        }
        return viewInfo
    }

    getAwardAnimationLevel(roundRate: number) {
        if (roundRate > 5) {
            return 3
        } else if (roundRate > 3) {
            return 2
        } else {
            return 1
        }
    }

    getWdElementCnt(elementList: number[]) {
        let cnt = 0;
        for (let index = 0; index < elementList.length; index++) {
            const element = elementList[index];
            if (element == GameConst.WDElementId) {
                cnt++;
            }
        }
        return cnt
    }

    getWdElementPosList(nums: number[]) {
        let wdElementPosList: Array<EPoint> = [];
        for (let index = 0; index < nums.length; index++) {
            const element = nums[index];
            if (element == GameConst.WDElementId) {
                let col = Math.floor(index / GameConst.MaxRow)
                let row = GameConst.MaxRow - index % GameConst.MaxRow - 1;
                wdElementPosList.push({ col: col, row: row })
            }
        }
        return wdElementPosList
    }

    getResultBigAwardAnimationNums(bet: number, win: number) {
        let nums: number[] = []
        let rate = win / bet;

        if (rate < rates[0]) {
            return nums
        }
        if (rate < rates[1]) {
            nums.push(win)
            return nums
        }
        if (rate < rates[2]) {
            return [rates[1] * bet, win]
        }
        return [rates[1] * bet, rates[2] * bet, win]
    }

    /**获取 大奖 巨奖 超级巨奖等级 */
    getResultBigAwardAnimationLevel(roundRate: number) {
        if (roundRate >= this.winConfig[2]) {//超级巨奖
            return 3
        } else if (roundRate >= this.winConfig[1]) {//巨奖
            return 2
        } else if (roundRate >= this.winConfig[0]) { //大奖
            return 1
        }
        return 0
    }

    getAutoRollCntByIdx(idx: number) {
        return AutoRounds[idx]
    }

    elementChangeClient(list: number[]) {
        let clientArr: ClientElement[] = [];
        let duplicate = [], idx = 0;
        for (let i = list.length - 1; i >= 0; i--) {
            let ele = list[i];
            if (ele == TItemtype.ITEM_TYPE_DUPLICATE) {
                duplicate.push(ele);
            } else {
                if (duplicate.length > 0) {
                    clientArr.push(new ClientElement(duplicate[0], duplicate.length, idx));
                }
                duplicate = [];
                idx = list.length - 1 - i;
                duplicate.push(ele);
            }
        }
        if (duplicate.length > 0) {
            clientArr.push(new ClientElement(duplicate[0], duplicate.length, idx));
        }
        return clientArr.reverse();
    }

    setMultiTime(mul: number) {
        if (this.betData.result?.round_list && this.betData.result.round_list[0]?.multi_time) {
            // this.betData.result.round_list[0].multi_time = mul;
        } else {
            if (!this.betData) {
                this.betData = {} as any;
            }
            if (!this.betData.result) {
                this.betData.result = {};
            }
            if (!this.betData.result.round_list) {
                this.betData.result.round_list = [{ multi_list: this.multipleList.slice(0) }];
            }
        }
        this.betData.result.round_list.forEach((item) => {
            if(!item.multi_list){
                console.log("aaa");
            }
            item.multi_list.forEach((ele, index) => {
                item.multi_list[index] = this.multipleList[index] * mul;
            })
        })
       
    }

    getCurMinMul() {
        let mul = 1;
        if (this.betData.result?.round_list && this.betData.result.round_list[0]?.multi_list) {
            mul = this.betData.result.round_list[0].multi_list[0];
        }
        return mul;
    }

    /**获取当前这局倍数列表 */
    getCurMultipleList() {
        let round = this.roundNum ? this.roundNum - 1 : 0;
        if (this.betData.result.round_list && this.betData.result.round_list.length > 0) {
            return this.betData.result.round_list[round].multi_list;
        } else {
            return this.multipleList.slice(0);
        }
    }

    getSelectMultipleList(mul: number) {
        let arr = [];
        for (let i = 0; i < this.multipleList.length; i++) {
            arr.push(this.multipleList[i] * mul);
        }
        return arr;
    }

    /**获取当前倍数下标 */
    getCurMulIdx(mul: number) {
        let list = this.getCurMultipleList();
        return list.indexOf(mul);
    }

    /**获取下次消除倍数下标 */
    getNextMulIdx(mul: number) {
        let list = this.getCurMultipleList();
        if(!list){
            console.log("sss");
        }
        let idx = list.indexOf(mul);
        let nextIdx = idx + 1;
        if (nextIdx >= list.length) {
            nextIdx = list.length - 1;
        }
        return nextIdx;
    }

    /**获取要变的元素 */
    getChangeElement(serverIdx: number) {
        return this.betData.result.round_list[this.roundNum].item_type_list[serverIdx];
    }

    /**当局中奖 */
    getAuthoritiesWin() {
        if (!this.betData || !this.betData.result || !this.betData.result.round_list || !this.betData.result.round_list.length) {
            return 0;
        }
        let total = 0;
        this.betData.result.round_list.forEach((item) => {
            total += item.win;
        })
        if (total == 0 && this.betData.result.round_list.length > 1) {
            total = 1;
        }
        return total;
    }
}