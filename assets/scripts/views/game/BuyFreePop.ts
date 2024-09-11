import { _decorator, Component, Node } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import { EventMouse } from 'cc';
import { tween } from 'cc';
import { EventTouch } from 'cc';
import { v3 } from 'cc';
import { UIOpacity } from 'cc';
import { Tween } from 'cc';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import GameCtrl from '../../ctrls/GameCtrl';
import { Layout } from 'cc';
import { Label } from 'cc';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import { PUBLIC_EVENTS } from '../../event/PublicEvents';
import BigNumber from 'bignumber.js';
import GameConst from '../../define/GameConst';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
const { ccclass, property } = _decorator;

@ccclass('BuyFreePop')
export class BuyFreePop extends BaseView {

    protected onLoad(): void {
        super.onLoad();
        this.node.getComponent(UIOpacity).opacity = 0;
        tween(this.node.getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start();
    }

    start() {
        this.m_ui.cancel.on(Node.EventType.MOUSE_ENTER, this.mouseEnter, this);
        this.m_ui.cancel.on(Node.EventType.MOUSE_LEAVE, this.mouseLeave, this);
        this.m_ui.confirm.on(Node.EventType.MOUSE_ENTER, this.mouseEnter, this);
        this.m_ui.confirm.on(Node.EventType.MOUSE_LEAVE, this.mouseLeave, this);

        // this.m_ui.cancel.on(Node.EventType.TOUCH_START, this.touchStart, this);
        // this.m_ui.cancel.on(Node.EventType.TOUCH_START, this.touchEnd, this);
        let amount = 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num: number) => {
            amount = num;
        })
        this.m_ui.buy_free_prize.getComponent(Label).string = MoneyUtil.rmbStr(new BigNumber(amount).multipliedBy(75).toNumber());
    }

    mouseEnter(ev: EventMouse) {
        let node = ev.target as Node;
        tween(node.getChildByName("fb_window_hover_add").getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start();

    }

    mouseLeave(ev: EventMouse) {
        let node = ev.target as Node;
        tween(node.getChildByName("fb_window_hover_add").getComponent(UIOpacity)).to(0.5, { opacity: 0 }).start();
        // Tween.stopAllByTarget(node);
        // tween(node).to(0.5, { scale: v3(1, 1, 1) }).start();
    }

    touchStart(ev: EventTouch) {
        // let node = ev.target as Node;
        // tween(node).to(0.5, { scale: v3(1.2, 1.2, 1.2) }).start();
    }

    // touchEnd(ev: EventTouch) {
    //     let node = ev.target as Node;
    //     tween(node).to(0.5, { scale: v3(1, 1, 1) }).start();
    //     if (node.name == "cancel") {
    //         this.cancel();
    //         console.error("cancel")
    //     } else {
    //         this.confirm();
    //     }
    // }

    cancel(ev?: EventTouch) {
        tween(this.node.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).call(() => {
            UIManager.closeView(EViewNames.UIBuyFree);
        }).start();
        ev && GameAudio.closeBuyFreePop();
    }

    confirm() {
        this.cancel();
        GameAudio.buyFreeStart();
        EventCenter.getInstance().fire(PUBLIC_EVENTS.ON_SPIN, true);
    }

    update(deltaTime: number) {
        this.m_ui.Layout.getComponent(Layout).affectedByScale = true;
    }
}


