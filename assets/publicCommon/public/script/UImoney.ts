import { _decorator, Component, Label, Node } from 'cc';
import { PopupView } from '../../../scripts/kernel/compat/view/PopupView';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import GameCtrl from '../../../scripts/ctrls/GameCtrl';
import MoneyUtil from '../../../scripts/kernel/core/utils/MoneyUtil';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { PublicConfig } from '../../customize/script/PublicConfig';

const { ccclass, property } = _decorator;

@ccclass('UImoney')
export class UImoney extends PopupView {

    start() {
        CocosUtil.changeNodeColor(this.m_ui.loadtip, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.ic_wallet_open, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.label_money, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.lb_money, PublicConfig.themeColor);

        CocosUtil.addClickEvent(this.m_ui.btn_close, function () {
            UIManager.closeView(EViewNames.UImoney);
        }, this);
        CocosUtil.addClickEvent(this.node, function () {
            UIManager.closeView(EViewNames.UImoney);
        }, this, null, 1);
        GameCtrl.getIns().reqGetBanlance((b) => {
            if (this?.node?.isValid) {
                this.m_ui.lb_money.getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(b)
                EventCenter.getInstance().fire(PUBLIC_EVENTS.UI_LOADING_REQ_COMPLETE, this.node)
            }
        })
    }

}


