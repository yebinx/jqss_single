import { _decorator, Component, Node, Animation } from 'cc';
import { BaseView } from '../../../scripts/kernel/compat/view/BaseView';
import { Label } from 'cc';
import { tween } from 'cc';
import BigNumber from 'bignumber.js';
import GameConst from '../../../scripts/define/GameConst';
import { v3 } from 'cc';
import { PublicConfig } from '../../customize/script/PublicConfig';
import { Color } from 'cc';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { Button } from 'cc';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import { UITransform } from 'cc';
import { EventTouch } from 'cc';
import { PublicAction } from '../../customize/script/PublicAction';
import { Tween } from 'cc';
import { UIOpacity } from 'cc';
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from '../../../scripts/kernel/compat/view/ViewDefine';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import { AudioManager } from '../../../scripts/kernel/compat/audio/AudioManager';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { sp } from 'cc';
import { PublicData } from './PublicData';
import MoneyUtil from '../../../scripts/kernel/core/utils/MoneyUtil';
import LoginCtrl from '../../../scripts/ctrls/LoginCtrl';
import { color } from 'cc';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { Sprite } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import DataManager from '../../../scripts/network/netData/DataManager';
const { ccclass, property } = _decorator;

@ccclass('PublicBtns')
export class PublicBtns extends BaseView {

    txtBalanceAmount: Label;
    txtBetAmount: Label;
    txtWinAmount: Label;

    winAmount: number = 0;
    balanceAmount: number = 0;

    protected onLoad(): void {
        super.onLoad();
        this.initNode();
        this.initEvent();
        this.initMsg();
    }

    initMsg(): void {
        this.setBalanceAmount(PublicData.balance);
        this.setBetAmount(PublicData.getCurBetAmount());
        this.setWinAmount(PublicData.lastWinAmount);
        this.onChangeBetAmount(PublicData.getCurBetAmount(), false);
    }

    initEvent() {
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SET_WIN_AMOUNT, this.setWinAmount, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SET_BET_AMOUNT, this.setBetAmount, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SET_BALANCE_AMOUNT, this.setBalanceAmount, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.ADD_BALANCE, this.playAddBlanceAnimation, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.ADD_WIN, this.playAddWinAnimation, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SET_LABEL_COLOR, this.setLabelColor, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_BET_AMONUT, this.onChangeBetAmount, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_BTNS_STATUS, this.updateChangeBetBtnState, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_BTNS_STYLE, this.changeBtnsStyle, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.UPDATE_AUTO_STATUS, this.updateStartAutoBtn, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.UPDATE_THREE_BTNS_STATUS, this.updateThreeBtnStatus, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.INIT_FAST_STATE, this.initFastState, this);
        // EventCenter.getInstance().listen(PUBLIC_EVENTS.SWITCH_FAST, this.onSwitchFast, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SWITCH_MENU, this.switchMenu, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.REFESH_VOICE_BTN, this.refeshVoiceBtn, this);

        this.m_ui.StartAutoBtn.on(Node.EventType.TOUCH_START, () => {
            if (!this.m_ui.StartAutoBtn.getComponent(Button).interactable) {
                return
            }
            this.m_ui.StartAutoBtn.getComponent(Button).enabled = false;
            Tween.stopAllByTarget(this.m_ui.StartAutoBtn);
            tween(this.m_ui.StartAutoBtn).to(0.1, { scale: v3(0.9, 0.9, 0.9) }).start();
        })
        this.m_ui.StartAutoBtn.on(Node.EventType.TOUCH_END, () => {
            if (!this.m_ui.StartAutoBtn.getComponent(Button).interactable) {
                return
            }
            this.m_ui.StartAutoBtn.getComponent(Button).enabled = true;
            Tween.stopAllByTarget(this.m_ui.StartAutoBtn);
            tween(this.m_ui.StartAutoBtn).to(0.1, { scale: v3(1, 1, 1) }).start();
            this.onOpenUIAuto();
        })
        this.m_ui.StartAutoBtn.on(Node.EventType.TOUCH_CANCEL, () => {
            if (!this.m_ui.StartAutoBtn.getComponent(Button).interactable) {
                return
            }
            this.m_ui.StartAutoBtn.getComponent(Button).enabled = true;
            Tween.stopAllByTarget(this.m_ui.StartAutoBtn);
            tween(this.m_ui.StartAutoBtn).to(0.1, { scale: v3(1, 1, 1) }).start();
        })

        this.setButtonAction();
    }

    initNode() {
        this.txtBalanceAmount = this.m_ui.BanlanceNum.getComponent(Label);
        this.txtBetAmount = this.m_ui.BetNum.getComponent(Label);
        this.txtWinAmount = this.m_ui.WinNum.getComponent(Label);

        this.setBtnColor(this.m_ui.BanlanceBtn);
        this.setBtnColor(this.m_ui.SettingBetBtn);
        this.setBtnColor(this.m_ui.HistoryBtn2);

        CocosUtil.changeNodeColor(this.m_ui.FastBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.MinusBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.AddBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.StartAutoBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.ExitBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.AudioBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.PayTableBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.RuleTableBtn, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.HistoryBtn, PublicConfig.themeColor);
    }

    setThemeColor() {
        CocosUtil.changeCurNodeColor(this.m_ui.BanlanceBtn.getChildByName("icon"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.SettingBetBtn.getChildByName("icon"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.HistoryBtn2.getChildByName("icon"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.faston, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.fastoff, PublicConfig.themeColor);
    }

    setBtnColor(node: Node) {
        node.getComponent(Button).normalColor = PublicConfig.themeColor.clone();
        node.getComponent(Button).pressedColor = PublicConfig.btnChangeColor.clone();
        node.getComponent(Button).hoverColor = PublicConfig.themeColor.clone();
        node.getComponent(Button).disabledColor = PublicConfig.btnChangeColor.clone();
    }

    setButtonAction() {
        this.setUniversalButton(this.m_ui.MinusBtn, this.onReduceBetAmount.bind(this));
        this.setUniversalButton(this.m_ui.AddBtn, this.onAddBetAmount.bind(this));
        this.setUniversalButton(this.m_ui.MoreBtn, this.onBtnMenu.bind(this), true);

        this.setUniversalButton(this.m_ui.ExitBtn, this.onBtnQuit.bind(this), true);
        this.setUniversalButton(this.m_ui.AudioBtn, this.onBtnVoice.bind(this), true);
        this.setUniversalButton(this.m_ui.PayTableBtn, this.openPayTable.bind(this), true);
        this.setUniversalButton(this.m_ui.RuleTableBtn, this.openRule.bind(this), true);
        this.setUniversalButton(this.m_ui.HistoryBtn, this.onOpenHistory.bind(this), true);
        this.setUniversalButton(this.m_ui.CloseBtn, this.onCloseBtnMenu.bind(this), true);
    }

    setUniversalButton(node: Node, cb: () => void, isCD?: boolean) {
        let isLeave = false, canCb = true;
        node.on(Node.EventType.TOUCH_START, () => {
            isLeave = false;
            if (node.getComponent(Button).interactable && node.getComponent(Button).enabled) {
                this.changeBtnStyle(node, false);
            }
        })
        node.on(Node.EventType.TOUCH_END, () => {
            if (node.getComponent(Button).enabled) {
                if (node.getComponent(Button).interactable) {
                    this.changeBtnStyle(node, true);
                }
                canCb && !isLeave && cb();

                if (isCD) {
                    canCb = false;
                    this.scheduleOnce(() => {
                        canCb = true;
                    }, 0.5);
                }
            }
        })
        node.on(Node.EventType.TOUCH_CANCEL, () => {
            if (node.getComponent(Button).interactable && node.getComponent(Button).enabled) {
                this.changeBtnStyle(node, true);
            }
        })
        node.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            if (!node.getComponent(Button).enabled) {
                return;
            }
            let p = node.getComponent(UITransform).convertToNodeSpaceAR(v3(ev.getUILocation().x, ev.getUILocation().y, 0));
            let cs = node.getComponent(UITransform).contentSize;
            if (p.x < -cs.width / 2 || p.x > cs.width / 2 || p.y < -cs.height / 2 || p.y > cs.height / 2) {
                isLeave = true;
                node.getComponent(Button).interactable && this.changeBtnStyle(node, true);
            }
        })
    }

    changeBtnsStyle(isOpen: boolean, enabled?: boolean) {
        if (typeof (enabled) == "boolean") {
            this.m_ui.MinusBtn.getComponent(Button).enabled = enabled
            this.m_ui.AddBtn.getComponent(Button).enabled = enabled
            this.m_ui.MoreBtn.getComponent(Button).enabled = enabled
        }
        
        this.changeBtnStyle(this.m_ui.MinusBtn, isOpen, !isOpen);
        this.changeBtnStyle(this.m_ui.AddBtn, isOpen, !isOpen);
        this.changeBtnStyle(this.m_ui.MoreBtn, isOpen);
        if(isOpen){
            let data = PublicData.getBetAmountState(PublicData.getCurBetAmount())
            this.updateChangeBetBtnState(data)
        }
    }

    changeBtnStyle(node: Node, can: boolean, disable?: boolean) {
        let name = node.name;
        if (disable) {
            name += "Disable";
        }
        let opNum = PublicConfig.btnOpacity[name] ? PublicConfig.btnOpacity[name] : PublicConfig.btnOpacity.Other;
        // let op = node.getComponent(UIOpacity);
        // if (!op) {
        //     op = node.addComponent(UIOpacity);
        // }
        // op.opacity = can ? 255 : Math.round(255 * opNum)
        this.changeChildOpacityNoLabel(node, can ? 255 : Math.round(255 * opNum))
    }

    changeChildOpacityNoLabel(node: Node, opacity: number) {
        node.children.forEach((child) => {
            if (child.getComponent(Label)) {
                return;
            }
            let op = child.getComponent(UIOpacity);
            if (!op) {
                op = child.addComponent(UIOpacity);
            }
            op.opacity = opacity;
        })
    }

    onChangeBetAmount(amount: number, isShowTip: boolean = true) {
        this.setBetAmount(amount, isShowTip);
        let data = PublicData.getBetAmountState(amount)
        if (data.isMax) {
            isShowTip && UIManager.toast(l10n.t("shared_setting_bet_max_bet"))
        }
        if (data.isMin) {
            isShowTip && UIManager.toast(l10n.t("shared_setting_bet_min_bet"))
        }
        this.updateChangeBetBtnState(data)
        localStorage.setItem(DataManager.userId+"_bet_id",PublicData.getCurBetId()+"");
    }

    /**更新2个按钮状态 */
    updateChangeBetBtnState(data?: { isMax: boolean, isMin: boolean }) {
        if (!data) {
            let amount = PublicData.getCurBetAmount();
            data = PublicData.getBetAmountState(amount);
        }
        if (data.isMin) {
            this.changeBtnStyle(this.m_ui.MinusBtn, false, true);
            this.m_ui.MinusBtn.getComponent(Button).interactable = false;
        } else {
            this.changeBtnStyle(this.m_ui.MinusBtn, true);
            this.m_ui.MinusBtn.getComponent(Button).interactable = true;
        }
        if (data.isMax) {
            this.changeBtnStyle(this.m_ui.AddBtn, false, true);
            this.m_ui.AddBtn.getComponent(Button).interactable = false;
        } else {
            this.changeBtnStyle(this.m_ui.AddBtn, true);
            this.m_ui.AddBtn.getComponent(Button).interactable = true;
        }
    }

    setBalanceAmount(amount: number) {
        this.balanceAmount = amount;
        this.txtBalanceAmount.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(amount);
    }

    setBetAmount(amount: number, isAnim: boolean = false) {
        this.txtBetAmount.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(amount);
        if (isAnim) {
            tween(this.txtBetAmount.node)
                .to(window["betAmount"][0].time, { scale: v3(window["betAmount"][0].scale[0], window["betAmount"][0].scale[1]) })
                .to(window["betAmount"][1].time, { scale: v3(window["betAmount"][1].scale[0], window["betAmount"][1].scale[1]) })
                .to(window["betAmount"][2].time, { scale: v3(window["betAmount"][2].scale[0], window["betAmount"][2].scale[1]) })
                .to(window["betAmount"][3].time, { scale: v3(window["betAmount"][3].scale[0], window["betAmount"][3].scale[1]) })
                .start()
        }
    }

    setWinAmount(amount?: number | Function) {
        if (typeof (amount) == "number") {
            this.winAmount = amount;
            this.txtWinAmount.string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(amount);
            EventCenter.getInstance().fire(PUBLIC_EVENTS.LAST_WIN_INFO, this.winAmount);
        } else {
            amount && amount(this.winAmount);
        }
    }

    playAddWinAnimation(amount: number) {
        let win = new BigNumber(this.winAmount).plus(amount);
        PublicAction.runScore(this.txtWinAmount.getComponent(Label), 0.5, new BigNumber(win).div(GameConst.BeseGold).toNumber(), new BigNumber(this.winAmount).div(GameConst.BeseGold).toNumber(), true, true);
        this.winAmount = win.toNumber();
        EventCenter.getInstance().fire(PUBLIC_EVENTS.LAST_WIN_INFO, this.winAmount);
    }

    playAddBlanceAnimation(amount: number) {
        PublicAction.runScore(this.txtBalanceAmount.getComponent(Label), 0.5, new BigNumber(amount).div(GameConst.BeseGold).toNumber(), new BigNumber(this.balanceAmount).div(GameConst.BeseGold).toNumber(), true, true);
        this.balanceAmount = amount;
    }

    setLabelColor(isGreen: boolean) {
        this.txtBalanceAmount.color = isGreen ? PublicConfig.labelColor.clone() : Color.WHITE
        this.txtBetAmount.color = isGreen ? PublicConfig.labelColor.clone() : Color.WHITE
        this.txtWinAmount.color = isGreen ? PublicConfig.labelColor.clone() : Color.WHITE
    }

    updateStartAutoBtn(isClose: boolean, onlyInteractable?: boolean) {
        if (!onlyInteractable) {
            if (!isClose) {
                if (!this.m_ui.StartAutoBtn.getChildByName("Can").active) {
                    this.m_ui.StartAutoBtn.getChildByName("Can").active = true;
                    this.m_ui.StartAutoBtn.getChildByName("Not").active = false;
                    this.m_ui.center_autoplay.active = false;
                }
            } else {
                if (this.m_ui.StartAutoBtn.getChildByName("Can").active) {
                    this.m_ui.StartAutoBtn.getChildByName("Can").active = false;
                    this.m_ui.StartAutoBtn.getChildByName("Not").active = true;
                    this.m_ui.center_autoplay.active = true;
                    this.m_ui.center_autoplay.getComponent(Animation).play();
                }
            }
        }

        this.m_ui.StartAutoBtn.getComponent(Button).interactable = !isClose;
        this.changeBtnStyle(this.m_ui.StartAutoBtn, !isClose, isClose);
    }

    updateThreeBtnStatus(state: boolean) {
        this.m_ui.SettingBetBtn.getComponent(Button).enabled = state
        this.m_ui.BanlanceBtn.getComponent(Button).enabled = state
        this.m_ui.HistoryBtn2.getComponent(Button).enabled = state
    }

    initFastState() {
        this.m_ui.IsFast.active = true;
        this.m_ui.OpenFast.active = false;
        this.m_ui.CloseFast.active = false;
    }

    onSwitchFast(isOpen: boolean) {
        this.m_ui.IsFast.active = false;
        this.m_ui.OpenFast.active = isOpen;
        Tween.stopAllByTarget(this.m_ui.turbo_sp);
        this.m_ui.turbo_sp.getComponent(UIOpacity).opacity = 255;
        if (isOpen) {
            let spS = this.m_ui.turbo_sp.getComponent(sp.Skeleton);
            spS.setToSetupPose();
            spS.setAnimation(0, "animation", true);
            tween(this.m_ui.turbo_sp.getComponent(UIOpacity)).delay(0.1).to(0.001, { opacity: 100 }).delay(0.1).to(0.001, { opacity: 255 }).union().repeat(2).start();
        }
        this.m_ui.CloseFast.active = !isOpen;
        // EventCenter.getInstance().fire(PUBLIC_EVENTS.FAST_TIPS, isOpen);
        this.setFastOnOff(isOpen);
    }

    setFastOnOff(isFast: boolean) {
        let fast_tip = this.m_ui.FastTip;
        fast_tip.active = true;
        let sp: Node
        if (isFast) {
            sp = fast_tip.getChildByName("faston")
            sp.active = true;
            fast_tip.getChildByName("fastoff").active = false;
            fast_tip.getChildByName("Label").getComponent(Label).string = l10n.t("shared_quick_on_tips");
        } else {
            sp = fast_tip.getChildByName("fastoff")
            fast_tip.getChildByName("faston").active = false;
            sp.active = true;
            fast_tip.getChildByName("Label").getComponent(Label).string = l10n.t("shared_quick_off_tips");
        }

        sp.getComponent(Sprite).enabled = false;
        Tween.stopAllByTarget(fast_tip);
        fast_tip.scale = v3(1.1, 1.1, 1);
        tween(fast_tip)
            .to(0.1, { scale: v3(1.3, 1.3, 1) })
            .to(0.1, { scale: v3(1.1, 1.1, 1) })
            .call(() => {
                sp.getComponent(Sprite).enabled = true;
            })
            .delay(3)
            .call(() => {
                fast_tip.active = false;
            })
            .start();
    }

    /**--------------------------------------------------------------------------------btnEvents------------------------------------------------------------------------------- */

    onClickFast() {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_FAST, (isFast: boolean) => {
            this.onSwitchFast(isFast);
        })
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.fast)
    }

    onReduceBetAmount() {
        let amount = PublicData.reduceBetAmount();
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BET_AMONUT, amount);
        // this.onChangeBetAmount(amount);
    }

    onAddBetAmount() {
        let amount = PublicData.addBetAmount();
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BET_AMONUT, amount);
        // this.onChangeBetAmount(amount);
    }

    onBtnMenu() {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_MENU, false, true);
        // this.switchMenu(false, true);
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.moreBtn)
    }

    private switchMenu(bOp: boolean, bAni: boolean = true) {
        this.m_ui.Menu1.active = bOp;
        let initY = PublicAction.menuConfig.initY;
        let moveY = PublicAction.menuConfig.moveY;
        Tween.stopAllByTarget(this.m_ui.Menu1);
        Tween.stopAllByTarget(this.m_ui.Menu2);

        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_STATUS, bOp)
        if (!bAni) {
            this.m_ui.Menu2.getComponent(UIOpacity).opacity = 255
            this.m_ui.Menu1.getComponent(UIOpacity).opacity = 255
            this.m_ui.Menu1.active = bOp;
            this.m_ui.Menu2.active = !bOp
            this.m_ui.Menu1.position = v3(0, initY, 0)
            this.m_ui.Menu2.position = v3(0, bOp ? initY - moveY : initY, 0)
            return
        }

        this.m_ui.Menu1.active = true
        this.m_ui.Menu2.active = true
        this.m_ui.Menu2.getComponent(UIOpacity).opacity = bOp ? 255 : 0
        this.m_ui.Menu1.getComponent(UIOpacity).opacity = bOp ? 0 : 255
        tween(this.m_ui.Menu1)
            .by(0.2, { position: v3(0, bOp ? moveY : -moveY, 0) })
            .start()
        tween(this.m_ui.Menu1.getComponent(UIOpacity))
            .to(0.2, { opacity: bOp ? 255 : 0 })
            .call(() => {
                this.m_ui.Menu1.active = bOp;
            })
            .start()
        tween(this.m_ui.Menu2)
            .by(0.2, { position: v3(0, bOp ? - moveY : moveY, 0) })
            .call(() => {
                this.m_ui.Menu2.active = !bOp
            })
            .start()

        tween(this.m_ui.Menu2.getComponent(UIOpacity))
            .to(0.2, { opacity: bOp ? 0 : 255 })
            .start()
    }

    onBtnQuit() {
        this.m_ui.ExitBtn.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            let info = new ParamConfirmDlg("quit_game", l10n.t("shared_exit_game_tips_content"), EDialogType.ok_cancel, (menuId: EDialogMenuId) => {
                if (menuId == EDialogMenuId.ok) {
                    location.reload();
                }
            });
            UIManager.showView(EViewNames.UIConfirmDialog, EUILayer.Dialog, info);
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.exitBtn)
            this.m_ui.ExitBtn.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    private onBtnVoice() {
        this.m_ui.AudioBtn.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.audioBtn)
            LoginCtrl.getIns().getModel().getPlayerInfo().mute = !AudioManager.inst.musicEnable ? 0 : 1;
            LoginCtrl.getIns().reqSetMusicState();

            EventCenter.getInstance().fire(PUBLIC_EVENTS.BGM_CTRL);

            this.m_ui.AudioBtn.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    refeshVoiceBtn(bEnable: boolean) {
        this.m_ui.Mute.active = !bEnable;
        this.m_ui.AudioBtn.getChildByName("Can").active = bEnable;
        this.m_ui.AudioBtn.getChildByName("Not").active = !bEnable;
    }

    openPayTable() {
        this.m_ui.PayTableBtn.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            UIManager.showView(EViewNames.UIpeifubiao, EUILayer.Popup)
            this.m_ui.PayTableBtn.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    openRule() {
        this.m_ui.RuleTableBtn.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            UIManager.showView(EViewNames.UIRule, EUILayer.Popup)
            this.m_ui.RuleTableBtn.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    onOpenHistory(ev?: EventTouch) {
        if (ev) {
            if (ev.target["disableClick"]) {
                return;
            } else {
                ev.target["disableClick"] = true;
                this.scheduleOnce(() => {
                    ev.target["disableClick"] = false;
                }, 0.5);
            }
        }
        this.m_ui.HistoryBtn.getComponent(Button).enabled = false;
        this.m_ui.HistoryBtn2.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            let uiData = PublicData.getInitUIBetSettingData()
            UIManager.showView(EViewNames.UIhistory, EUILayer.Popup, uiData)
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.history)

            this.m_ui.HistoryBtn.getComponent(Button).enabled = true;
            this.m_ui.HistoryBtn2.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    onCloseBtnMenu() {
        this.m_ui.CloseBtn.getComponent(Button).enabled = false;
        this.scheduleOnce(() => {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_MENU, true, true);
            // this.switchMenu(true, true);
            PublicAction.btnAudio(PublicConfig.btnAudioConfig.close)
            this.m_ui.CloseBtn.getComponent(Button).enabled = true;
        }, window["secondaryMenu"].responseTime);
    }

    onOpenUIAuto() {
        let uiData = PublicData.getInitUIAutoData()
        UIManager.showView(EViewNames.UIAuto, EUILayer.Popup, uiData)
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.auto)
    }

    onOpenSettingBet(ev: EventTouch) {
        if (ev.target["disableClick"]) {
            return;
        } else {
            ev.target["disableClick"] = true;
            this.scheduleOnce(() => {
                ev.target["disableClick"] = false;
            }, 0.5);
        }
        let uiData = PublicData.getInitUIBetSettingData()
        UIManager.showView(EViewNames.UIBetSetting, EUILayer.Popup, uiData)
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_MENU, true, false);
        // this.switchMenu(true, false);
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.settingBet)
    }

    onOpenBanlance(ev: EventTouch) {
        if (ev.target["disableClick"]) {
            return;
        } else {
            ev.target["disableClick"] = true;
            this.scheduleOnce(() => {
                ev.target["disableClick"] = false;
            }, 0.5);
        }
        let uiData = PublicData.getInitUIBetSettingData()
        UIManager.showView(EViewNames.UImoney, EUILayer.Popup, uiData)
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_MENU, true, false);
        // this.switchMenu(true, false);
        PublicAction.btnAudio(PublicConfig.btnAudioConfig.balance)
    }

}


