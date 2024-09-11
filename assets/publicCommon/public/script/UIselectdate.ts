import { _decorator, color, Component, Label, Node } from 'cc';
import { BaseComp } from '../../../scripts/kernel/compat/view/BaseComp';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import { EUILayer } from '../../../scripts/kernel/compat/view/ViewDefine';
import { PublicConfig } from '../../customize/script/PublicConfig';
import RecordMgr from './RecordMgr';
import { UIOpacity } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIselectdate')
export class UIselectdate extends BaseComp {
    start() {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        CocosUtil.setModal(this.node, true);

        CocosUtil.changeCurNodeColor(this.m_ui.btn_close2, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.lb_title_top, PublicConfig.themeColor);

        CocosUtil.addClickEvent(this.m_ui.btn_close, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            opacity.opacity = 255
            UIManager.closeView(EViewNames.UIselectdate);
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btn_selfdef, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            opacity.opacity = 255
            UIManager.showView(EViewNames.UIDateSelect, EUILayer.Dialog);
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btn_today, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            opacity.opacity = 255
            RecordMgr.getInstance().setFilter(1, 1);
            UIManager.closeView(EViewNames.UIselectdate);
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btn_7day, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            RecordMgr.getInstance().setFilter(7, 7);
            UIManager.closeView(EViewNames.UIselectdate);
        }, this, null, 1);

        let cur = RecordMgr.getInstance().filterFrom;
        this.m_ui.btn_7day.getChildByName("lb_title").getComponent(Label).color = cur == 7 ? PublicConfig.themeColor.clone() : color(255, 255, 255, 160);
        this.m_ui.btn_today.getChildByName("lb_title").getComponent(Label).color = cur == 1 ? PublicConfig.themeColor.clone() : color(255, 255, 255, 160);
        this.m_ui.btn_selfdef.getChildByName("lb_title").getComponent(Label).color = (cur != 1 && cur != 7) ? PublicConfig.themeColor.clone() : color(255, 255, 255, 160);
    }


}

