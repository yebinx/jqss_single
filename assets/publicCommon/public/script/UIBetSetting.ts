import { _decorator, Label, instantiate, UITransform, tween, v3, NodeEventType, EventTouch, Node, Button, warn, log } from "cc";
import { CompBetScroll } from "./CompBetScroll";
import { PublicData } from "../../../publicCommon/public/script/PublicData";
import { PopupView } from "../../../scripts/kernel/compat/view/PopupView";
import { BaseGoldInfo } from "../../../scripts/models/GameModel";
import MoneyUtil from "../../../scripts/kernel/core/utils/MoneyUtil";
import { PUBLIC_EVENTS } from "../../../scripts/event/PublicEvents";
import CocosUtil from "../../../scripts/kernel/compat/CocosUtil";
import EventCenter from "../../../scripts/kernel/core/event/EventCenter";
import GameConst from "../../../scripts/define/GameConst";
import { UIManager } from "../../../scripts/kernel/compat/view/UImanager";
import { EViewNames } from "../../../scripts/configs/UIConfig";
import CHandler from "../../../scripts/kernel/core/datastruct/CHandler";
import { PublicAction } from "../../customize/script/PublicAction";
import { PublicConfig } from "../../customize/script/PublicConfig";


const { ccclass, property } = _decorator;
@ccclass('UIBetSetting')
export class UIBetSetting extends PopupView {
    @property(Label)
    txtMoney: Label;
    @property(Label)
    txtBet: Label;
    @property(Label)
    txtAward: Label;


    private curSelectBetId: number = 0;

    initData(data: BaseGoldInfo) {
        this.txtMoney.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.balance);
        this.txtBet.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.curBetAmount);
        this.txtAward.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.lastWinAmount);
    }

    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.BALANCE_INFO, function (amount: number) {
            this.txtMoney.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(amount);
        }, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.BET_SCROLL_START, () => {
            this.onOpt(true)
        }, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.BET_SCROLL_END, () => {
            this.onOpt(false)
        }, this);

        CocosUtil.changeCurNodeColor(this.m_ui.total_bet, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.cont_bettotal.getChildByName("Node").getChildByName("Label"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.btn_maxbet, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.btn_maxbet.getChildByName("Label"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.btn_sure, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_wallet_open, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_bet_open, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_win_open, PublicConfig.themeColor);

        this.initLists();
    }

    start() {
        // let betValue = GameMgr.getInstance()._betGold;
        let idx = PublicData.getCurBetId();
        let info = PublicData.getBetIdInfo(idx);
        let amountIdx = PublicData.getBetAmountIdx(info.bet_size / GameConst.BeseGold)
        let rateIdx = PublicData.getBetMultipleIdx(info.bet_multiple)
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(amountIdx + 1, false);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(rateIdx + 1, false);
        this.curSelectBetId = idx;

        this.initUIEvent();

        this.refreshBettotal(false);

        this.enabledButton(this.m_ui.btn_maxbet, !PublicData.isMaxBet(info.total_bet));
    }

    private initUIEvent() {
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.betClose);
            UIManager.closeView(EViewNames.UIBetSetting);
        }, this, null, 1);
        CocosUtil.addClickEvent(this.node, function () {
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.betClose);
            UIManager.closeView(EViewNames.UIBetSetting);
        }, this, null, 1);
        CocosUtil.addClickEvent(this.m_ui.btn_maxbet, this.onBtnMaxbet, this, null, 1);
        CocosUtil.addClickEvent(this.m_ui.btn_sure, this.onBtnSure, this, null, 1);
    }

    private onBtnMaxbet() {
        let lenBetAmount = PublicData.optionalBetAmountLists.length
        let lenTotalAmount = PublicData.optionalTotalAmountLists.length
        let lenMultiple = PublicData.optionalMultipleLists.length
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(lenBetAmount);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(lenMultiple);
        this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIndex(lenTotalAmount);
        let info = PublicData.getBetInfoByTotal(PublicData.optionalTotalAmountLists[lenTotalAmount - 1] * GameConst.BeseGold)
        this.curSelectBetId = info.id
        // PublicData.isMaxBet(info.total_bet);
        this.enabledButton(this.m_ui.btn_maxbet, false);
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.betMax);
        // this.refreshBettotal(true)
    }


    onOpt(isOpt: boolean) {
        let info = PublicData.getBetIdInfo(this.curSelectBetId);
        this.enabledButton(this.m_ui.btn_maxbet, !PublicData.isMaxBet(info.total_bet) && !isOpt)

        this.enabledButton(this.m_ui.btn_sure, !isOpt)
        this.enabledButton(this.m_ui.btn_close, !isOpt)
    }

    enabledButton(node: Node, enabled: boolean) {
        node.getComponent(Button).interactable = enabled;
        CocosUtil.setNodeOpacity(node, enabled ? 255 : 110)
    }

    private onBtnSure() {
        let nd = this.m_ui.list_bettotal.getComponent(CompBetScroll).getMidNode();
        let v = nd["_logic_value"];
        PublicData.switchBetId(this.curSelectBetId)
        UIManager.closeView(EViewNames.UIBetSetting);
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.betConfirm);
    }

    initLists() {
        let optionalBetAmountLists = PublicData.optionalBetAmountLists
        let optionalTotalAmountLists = PublicData.optionalTotalAmountLists
        let optionalMultipleLists = PublicData.optionalMultipleLists
        let contNode = this.m_ui.cont_daxiao;
        for (let v of optionalBetAmountLists) {
            let item = instantiate(contNode.children[0]);
            item.children[0].getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.formatGold(v);
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_daxiao.getComponent(CompBetScroll).setTouchCb(new CHandler(this, function (curMidIndex, curMidNode) {
            this.refreshBettotal();
        }));
        this.m_ui.list_daxiao.getComponent(CompBetScroll).wheelMove = () => {
            this.onOpt(true)
        }
        this.m_ui.list_daxiao.getComponent(CompBetScroll).wheelEnd = () => {
            this.onOpt(false)
        }

        contNode = this.m_ui.cont_beishu;
        for (let v of optionalMultipleLists) {
            let item = instantiate(contNode.children[0]);
            item.children[0].getComponent(Label).string = "" + v;
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_beishu.getComponent(CompBetScroll).setTouchCb(new CHandler(this, function (curMidIndex, curMidNode) {
            this.refreshBettotal();
        }));
        this.m_ui.list_beishu.getComponent(CompBetScroll).wheelMove = () => {
            this.onOpt(true)
        }
        this.m_ui.list_beishu.getComponent(CompBetScroll).wheelEnd = () => {
            this.onOpt(false)
        }

        contNode = this.m_ui.cont_bettotal;
        for (let index = 0; index < optionalTotalAmountLists.length; index++) {
            const v = optionalTotalAmountLists[index];
            let item = instantiate(contNode.children[0]);
            item.children[0].getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.formatGold(v);
            contNode.addChild(item);
            item["_logic_value"] = v;
        }
        contNode.addChild(instantiate(contNode.children[0]));
        this.m_ui.list_bettotal.getComponent(CompBetScroll).setTouchCb(new CHandler(this, this.onEndBetTotal));
        this.m_ui.list_bettotal.getComponent(CompBetScroll).wheelMove = () => {
            this.onOpt(true)
        }
        this.m_ui.list_bettotal.getComponent(CompBetScroll).wheelEnd = () => {
            this.onOpt(false)
        }
    }

    private onEndBetTotal(curMidIndex, curMidNode) {
        let value = curMidNode["_logic_value"] * GameConst.BeseGold
        let info = PublicData.getBetInfoByTotal(value)
        let amountIdx = PublicData.getBetAmountIdx(info.bet_size / GameConst.BeseGold)
        let rateIdx = PublicData.getBetMultipleIdx(info.bet_multiple)
        this.m_ui.list_daxiao.getComponent(CompBetScroll).scrollToIndex(amountIdx + 1, true);
        this.m_ui.list_beishu.getComponent(CompBetScroll).scrollToIndex(rateIdx + 1, true);
        this.curSelectBetId = info.id;
        this.enabledButton(this.m_ui.btn_maxbet, !PublicData.isMaxBet(info.total_bet));
    }

    animAct() {
        let size = this.m_ui.bg.getComponent(UITransform).contentSize
        this.m_ui.bg.position = v3(0, -size.height, 0)
        this.m_ui.content.active = false;
        tween(this.m_ui.bg)
            .by(0.2, { position: v3(0, size.height, 0) })
            .call(() => {
                this.m_ui.content.active = true;
            })
            .start()
    }

    private refreshBettotal(bAni: boolean = true) {
        let idx1 = this.m_ui.list_daxiao.getComponent(CompBetScroll).getMidIndex();
        let idx2 = this.m_ui.list_beishu.getComponent(CompBetScroll).getMidIndex();
        let betAmount = PublicData.optionalBetAmountLists[idx1 - 1]
        let betRate = PublicData.optionalMultipleLists[idx2 - 1]
        let betInfo = PublicData.getBetInfoByAmount(betAmount * GameConst.BeseGold, betRate)
        // if (!betInfo) {
        //     return
        // }
        let totalIdx = PublicData.getBetTotalIdx(betInfo.total_bet / GameConst.BeseGold)
        this.m_ui.list_bettotal.getComponent(CompBetScroll).scrollToIndex(totalIdx + 1, bAni);
        this.curSelectBetId = betInfo.id
        this.enabledButton(this.m_ui.btn_maxbet, !PublicData.isMaxBet(betInfo.total_bet));
    }

}


