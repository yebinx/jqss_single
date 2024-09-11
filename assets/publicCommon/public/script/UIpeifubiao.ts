import { _decorator, Component, Node, tween, UIOpacity } from 'cc';
import { Label } from 'cc';
import { PublicConfig } from '../../../publicCommon/customize/script/PublicConfig';
import { instantiate } from 'cc';
import { PublicAction } from '../../../publicCommon/customize/script/PublicAction';
import { PopupView } from '../../../scripts/kernel/compat/view/PopupView';
import LoadHelper from '../../../scripts/kernel/compat/load/LoadHelper';
import { createResInfo } from '../../../scripts/kernel/compat/load/ResInfo';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
const { ccclass, property } = _decorator;

@ccclass('UIpeifubiao')
export class UIpeifubiao extends PopupView {

    // protected onLoad(): void {
    //     super.onLoad();
    // }

    start() {
        this.m_ui.pfb.getComponent(Label).color = PublicConfig.themeColor.clone();
        CocosUtil.changeNodeColor(this.m_ui.loadtip, PublicConfig.themeColor, true);
        LoadHelper.loadPrefab(createResInfo("customize/prefabs/PfbContent", PublicConfig.bundleName), (err, data) => {
            if (err) {
                return console.error(err);
            }
            this.m_ui.content.addChild(instantiate(data));
        })
        CocosUtil.addClickEvent(this.m_ui.btn_close, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            UIManager.closeView(EViewNames.UIpeifubiao)
        }, this, null, 1)

        this.m_ui.btn_close.active = false;
        this.m_ui.loadtip.active = true;
        this.m_ui.ScrollView.active = false;
        this.m_ui.scrollBar.active = false;

        tween(this.m_ui.loadtip.getComponent(UIOpacity)).delay(0.5).to(0.2, { opacity: 0 }).call(() => {
            this.m_ui.btn_close.active = true;
            this.m_ui.loadtip.active = false;
            this.m_ui.ScrollView.active = true;
            this.m_ui.scrollBar.active = true;
        }).start();
    }
}


