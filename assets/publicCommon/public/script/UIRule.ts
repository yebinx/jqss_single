import { _decorator, tween, UIOpacity } from 'cc';
import { PublicConfig } from '../../../publicCommon/customize/script/PublicConfig';
import { PublicAction } from '../../../publicCommon/customize/script/PublicAction';
import { instantiate } from 'cc';
import { Label } from 'cc';
import LoadHelper from '../../../scripts/kernel/compat/load/LoadHelper';
import { createResInfo } from '../../../scripts/kernel/compat/load/ResInfo';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../scripts/configs/UIConfig';
import { PopupView } from '../../../scripts/kernel/compat/view/PopupView';
const { ccclass, property } = _decorator;

@ccclass('UIRule')
export class UIRule extends PopupView {

    start() {
        this.m_ui.rule.getComponent(Label).color = PublicConfig.themeColor.clone();
        CocosUtil.changeNodeColor(this.m_ui.loadtip, PublicConfig.themeColor, true);

        LoadHelper.loadPrefab(createResInfo("customize/prefabs/RuleContent", PublicConfig.bundleName), (err, data) => {
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
            UIManager.closeView(EViewNames.UIRule)
        }, this)

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


