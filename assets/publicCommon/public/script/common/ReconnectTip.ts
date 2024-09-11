import { _decorator, Component, Label, Node } from 'cc';
import { BaseView } from '../../../../scripts/kernel/compat/view/BaseView';
import CocosUtil from '../../../../scripts/kernel/compat/CocosUtil';
import EventCenter from '../../../../scripts/kernel/core/event/EventCenter';
import GameEvent from '../../../../scripts/event/GameEvent';
import { UIManager } from '../../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../../scripts/configs/UIConfig';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
const { ccclass, property } = _decorator;

@ccclass('ReconnectTip')
export class ReconnectTip extends BaseView {

    private _cnt: number = 1;

    onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui)
        this.onAutoCloseSelf();
    }


    start() {
        EventCenter.getInstance().listen(GameEvent.reconnect_tip, this.onUpdateTip, this)
        EventCenter.getInstance().listen(GameEvent.reconnect_tip_close, this.onCloseSelf, this)

        this.scheduleOnce(() => {
            this.onUpdateTip(this._cnt)
        });
    }

    onAutoCloseSelf() {
        this.scheduleOnce(() => {
            this.onCloseSelf()
        }, 5)
    }

    onCloseSelf() {
        UIManager.closeView(EViewNames.ReconnectTip)
    }

    initData(cnt: number): void {
        this._cnt = cnt;
    }

    onUpdateTip(cnt: number) {
        this.m_ui.tip.getComponent(Label).string = l10n.t("net_busy").replace("%{1}", l10n.t("the_" + cnt));
    }
}


