import { _decorator, Component, Node, Animation } from 'cc';
import { BaseView } from '../../../scripts/kernel/compat/view/BaseView';
import { Button } from 'cc';
import { Tween } from 'cc';
import { tween } from 'cc';
import { v3 } from 'cc';
import { EventTouch } from 'cc';
import { UITransform } from 'cc';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { UIOpacity } from 'cc';
import { Label } from 'cc';
import { sp } from 'cc';
import LoadHelper from '../../../scripts/kernel/compat/load/LoadHelper';
import { PublicConfig } from '../../customize/script/PublicConfig';
import { createResInfo } from '../../../scripts/kernel/compat/load/ResInfo';
import { Sprite } from 'cc';
import { NodeEventType } from 'cc';
import { EventMouse } from 'cc';
import { CustomiszeSpins } from '../../customize/script/CustomiszeSpins';
const { ccclass, property } = _decorator;

@ccclass('PublicSpins')
export class PublicSpins extends BaseView {

    /**当前spin按钮是否hover */
    spinHover: boolean = false;
    /**当前auto按钮是否hover */
    autoHover: boolean = false;

    protected async onLoad() {
        super.onLoad();
        CustomiszeSpins.init(this.m_ui);

        this.initEvents();
    }

    start() {
        this.m_ui[PublicConfig.spinBtnConfig.pointerBoxNodeName].on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
            if (this.m_ui[PublicConfig.spinBtnConfig.spinNodeName].getComponent(Button).interactable) {
                let p = ev.getUILocation();
                let np = (ev.target as Node).getComponent(UITransform).convertToNodeSpaceAR(v3(p.x, p.y, 0));
                if (Math.pow(np.x, 2) + Math.pow(np.y, 2) <= Math.pow(ev.target.getComponent(UITransform).contentSize.width / 2, 2)) {
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.ON_SPIN);
                }
            }
        })

        this.m_ui[PublicConfig.spinBtnConfig.pointerBoxNodeName].on(NodeEventType.MOUSE_MOVE, (ev: EventMouse) => {
            let p = ev.getUILocation();
            let np = (ev.target as Node).getComponent(UITransform).convertToNodeSpaceAR(v3(p.x, p.y, 0));
            if (Math.pow(np.x, 2) + Math.pow(np.y, 2) <= Math.pow(ev.target.getComponent(UITransform).contentSize.width / 2, 2)) {
                this.spinHover = true;
                this.onMouseEnterSpin(ev)
            } else {
                this.spinHover = false;
                this.onMouseLeaveSpin(ev)
            }
        }, this)
        this.m_ui[PublicConfig.spinBtnConfig.pointerBoxNodeName].on(Node.EventType.MOUSE_LEAVE, (ev: EventMouse) => {
            this.spinHover = false;
            this.onMouseLeaveSpin(ev);
        }, this)
        this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].on(NodeEventType.MOUSE_ENTER, (ev: EventMouse) => {
            this.autoHover = true;
            this.spinHover = true;
            this.onMouseEnterSpin(ev);
        }, this)
        this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].on(NodeEventType.MOUSE_LEAVE, (ev: EventMouse) => {
            this.autoHover = false;
            this.spinHover = false;
            this.onMouseLeaveSpin(ev);
        }, this)
    }

    onMouseEnterSpin(event: EventMouse) {
        let flag = false;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SPIN_HOVER, (bool: boolean) => {
            flag = !bool;
        });
        if (flag && event.target.name != PublicConfig.autoSpinBtnConfig.autoNodeName) {
            CustomiszeSpins.spinHoverLeave();
            return;
        }
        if (event.target.name != PublicConfig.autoSpinBtnConfig.autoNodeName) {
            CustomiszeSpins.spinHover();
        } else {
            CustomiszeSpins.autoHover();
        }
    }

    onMouseLeaveSpin(event: EventMouse) {
        if (event.target.name != PublicConfig.autoSpinBtnConfig.autoNodeName) {
            CustomiszeSpins.spinHoverLeave();
        } else {
            CustomiszeSpins.autoHoverLeave();
        }
    }

    initEvents() {
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_SPIN_STATUS, this.changeSpinStatus, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.UPDATE_AUTO_ROLL, this.onUpdateOpenAutoRoll, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, this.changeSpinAnim, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SHOW_SPIN_HOVER, (bool: boolean) => {
            (bool && this.spinHover || this.autoHover && !this.m_ui.AutoBtn.active) && CustomiszeSpins.spinHover();
        }, this);
    }

    changeSpinAnim(animName: string, isLoop: boolean = false, lightActive?: boolean) {
        if (lightActive !== undefined || lightActive !== null) {
            if (lightActive && this.spinHover) {
                CustomiszeSpins.spinHover();
            } else {
                CustomiszeSpins.spinHoverLeave();
            }
        }
        CustomiszeSpins.changeSpinAnim(animName, isLoop, this.spinHover);
    }

    changeSpinStatus(active?: boolean, interactable?: boolean) {
        if (active !== undefined && active !== null) {
            this.m_ui[PublicConfig.spinBtnConfig.spinNodeName].active = active;
        }

        if (interactable !== undefined && interactable !== null) {
            this.m_ui[PublicConfig.spinBtnConfig.spinNodeName].getComponent(Button).interactable = interactable;
        }
    }

    onUpdateOpenAutoRoll(isOpen: boolean, cnt: number = 0, updateAutoAnim: boolean) {
        this.m_ui[PublicConfig.spinBtnConfig.spinNodeName].active = !isOpen
        if (!isOpen) {
            CustomiszeSpins.exitAuto();
        } else {
            CustomiszeSpins.autoNum(cnt, isOpen);
        }

        if (updateAutoAnim) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_AUTO_STATUS, isOpen);
        }
    }

    onCancelAutoRoll() {
        this.autoHover = false;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CANCEL_AUTO);
        // this.spinHover && CustomiszeSpins.spinHover();
    }

}


