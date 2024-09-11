import { _decorator, Component, Label, Node, UITransform, v3, warn } from 'cc';
import { BaseComp } from '../../../../scripts/kernel/compat/view/BaseComp';
import CocosUtil from '../../../../scripts/kernel/compat/CocosUtil';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
import EventCenter from '../../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../../scripts/event/PublicEvents';
import { EventTouch } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIDetailTip')
export class UIDetailTip extends BaseComp {
    info: any;
    initData(info: { dataArr: string[], item: Node }) {
        if (!info) {
            return;
        }
        CocosUtil.traverseNodes(this.node, this.m_ui);
        this.info = info
        let datas = info.dataArr;
        let str = "";
        for (let i = 0; i < datas.length; i++) {
            if (i == datas.length - 1) {
                str += datas[i];
            } else {
                str += datas[i] + " x ";
            }
        }
        this.m_ui.lab_gongshi.getComponent(Label).string = str;
        let lb = "";
        let tips = l10n.t("shared_record_win_line_info_tips").split("x");
        for (let i = 0; i < datas.length; i++) {
            lb += (i != 0 ? "x" : "") + tips[i];
        }
        this.m_ui.lb_tiptxt.getComponent(Label).string = lb;

        this.node.getChildByName("bg_corner4").active = false
        this.scheduleOnce(() => {
            this.node.getChildByName("bg_corner4").active = true
            let pos = CocosUtil.convertSpaceAR(info.item, this.node);
            pos.set(pos.x, pos.y - 116, pos.z);
            this.node.getChildByName("bg_corner4").setPosition(pos);
        }, 0.06);
    }

    start() {
        this.node.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            this.node.active = false;
        })
        this.node.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
        })
        this.node.on(Node.EventType.TOUCH_CANCEL, (ev: EventTouch) => {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            this.node.active = false;
        })
        // CocosUtil.addClickEvent(this.node, function () {
        //     this.node.active = false;
        // }, this);
    }

}


