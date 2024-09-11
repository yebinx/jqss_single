import { _decorator, Button, Color, color, Component, Label, Node, Sprite, tween, UIOpacity, UITransform, v3 } from 'cc';
import { PublicConfig } from '../../../publicCommon/customize/script/PublicConfig';
import { PopupView } from '../../../scripts/kernel/compat/view/PopupView';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import GameCtrl from '../../../scripts/ctrls/GameCtrl';
import { InitUIAutoInfo } from '../../../scripts/models/GameModel';
import MoneyUtil from '../../../scripts/kernel/core/utils/MoneyUtil';
import { PublicAction } from '../../customize/script/PublicAction';
const { ccclass, property } = _decorator;

@ccclass('UIAuto')
export class UIAuto extends PopupView {

    @property(Label)
    txtMoney: Label;
    @property(Label)
    txtBet: Label;
    @property(Label)
    txtAward: Label;

    private sel_color = PublicConfig.autoSelectColor;
    private unsel_color = PublicConfig.autoUnSelectColor;
    private hover_color = PublicConfig.autoHoverColor;

    private _selectIdx: number = -1;

    protected onLoad(): void {
        super.onLoad();
        this.setThemeColor();
    }

    start() {
        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            UIManager.closeView(EViewNames.UIAuto);
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.autoClose);
        }, this, null, 1);
        CocosUtil.addClickEvent(this.node, function () {
            UIManager.closeView(EViewNames.UIAuto);
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.autoClose);
        }, this, null, 1);
        CocosUtil.addClickEvent(this.m_ui.btn_start_auto, function () {
            if (this._selectIdx < 0) {
                return;
            }
            UIManager.closeView(EViewNames.UIAuto);
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.autoStart);
            GameCtrl.getIns().openAutoRoll(this._selectIdx)
        }, this, null, 1);
        this.m_ui.btn_start_auto.getComponent(Button).interactable = false;
        // this.animAct()
    }

    setThemeColor() {
        CocosUtil.changeCurNodeColor(this.m_ui.btn_start_auto, new Color("#AAF8B5FB"));
        CocosUtil.changeCurNodeColor(this.m_ui.ic_wallet_open, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_money_open, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_win_open, PublicConfig.themeColor);
    }

    initData(data: InitUIAutoInfo) {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.txtMoney.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.balance);
        this.txtBet.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.curBetAmount);
        this.txtAward.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data.lastWinAmount);
        this.selectTab(-1);
        this.initSelectNumTab(data.selectNums);

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

    initSelectNumTab(nums: number[]) {
        for (let index = 0; index < nums.length; index++) {
            const element = nums[index];
            let lab = this.m_ui.tabs.children[index].getChildByName("Label").getComponent(Label);
            lab.string = element + "";
            CocosUtil.addClickEvent(this.m_ui.tabs.children[index], () => {
                this.selectTab(index)
                PublicAction.btnAudio(PublicConfig.btnAudioConfig.autoSelect);
            }, this, index, 1);
            this.initMouseEvent(this.m_ui.tabs.children[index], index)
        }
    }

    initMouseEvent(btn: Node, idx: number) {
        btn.on(Node.EventType.MOUSE_ENTER, () => {
            let lab = this.m_ui.tabs.children[idx].getChildByName("Label").getComponent(Label);
            if (this._selectIdx == idx) {
                lab.color = this.sel_color;
                return;
            }
            lab.color = this.hover_color;
        }, this);
        btn.on(Node.EventType.MOUSE_LEAVE, () => {
            let lab = this.m_ui.tabs.children[idx].getChildByName("Label").getComponent(Label);
            if (this._selectIdx == idx) {
                lab.color = this.sel_color;
                return;
            }
            lab.color = this.unsel_color;
        }, this);
    }

    selectTab(idx: number) {
        this._selectIdx = idx;
        for (let i = 0; i < 5; i++) {
            let lab = this.m_ui.tabs.children[i].getChildByName("Label").getComponent(Label);
            lab.color = i == idx && this.sel_color || this.unsel_color;
        }
        if (idx >= 0) {
            this.m_ui.btn_start_auto.getComponent(Button).interactable = true
        }
        let op1 = idx >= 0 ? 255 : 64
        // let op2 = idx >= 0 ? 255 : 120
        let c = this.m_ui.btn_start_auto.getComponent(Sprite).color;
        this.m_ui.btn_start_auto.getComponent(Sprite).color = new Color(c.r, c.g, c.b, op1)
        // this.m_ui.btn_start_auto.getComponent(UIOpacity).opacity = 64;

        // CocosUtil.setNodeOpacity(this.m_ui.btn_start_auto, idx>=0 && 255 || 80);
    }

}


