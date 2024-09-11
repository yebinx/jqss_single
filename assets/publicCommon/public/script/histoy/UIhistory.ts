import { _decorator, Button, color, Color, Component, error, instantiate, Label, log, Node, Prefab, Tween, tween, UIOpacity, warn, Widget } from 'cc';
import { PopupView } from '../../../../scripts/kernel/compat/view/PopupView';
import { CpnList } from '../../../../scripts/kernel/compat/view/scroll/CpnList';
import GameCtrl from '../../../../scripts/ctrls/GameCtrl';
import CocosUtil from '../../../../scripts/kernel/compat/CocosUtil';
import { UIManager } from '../../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../../scripts/configs/UIConfig';
import { EUILayer } from '../../../../scripts/kernel/compat/view/ViewDefine';
import EventCenter from '../../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../../scripts/event/PublicEvents';
import RecordMgr from '../RecordMgr';
import { CpnListCell } from '../../../../scripts/kernel/compat/view/scroll/CpnListCell';
import { ItemHistory } from '../../../customize/script/ItemHistory';
import DateUtil from '../../../../scripts/kernel/core/utils/DateUtil';
import { ServerResult } from '../../../../scripts/interface/common';
import { RecordListRsp } from '../../../../scripts/interface/recordlist';
import MoneyUtil from '../../../../scripts/kernel/core/utils/MoneyUtil';
import { PublicConfig } from '../../../customize/script/PublicConfig';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
const { ccclass, property } = _decorator;

@ccclass('UIhistory')
export class UIhistory extends PopupView {
    @property(Prefab)
    itemPre: Prefab = null;
    @property(Node)
    fistTip: Node = null;
    private compList: CpnList = null;

    protected onLoad(): void {
        super.onLoad();

        this.setThemeColor();
    }

    async start() {
        await this.waitAnim(false);
        this.m_ui.label_time.getComponent(Label).string = l10n.t("shared_record_time") + "\n(GMT+8:00)";
        this.m_ui.label_bet.getComponent(Label).string = l10n.t("shared_record_bet") + `(${MoneyUtil.currencySymbol()})`;
        this.m_ui.label_profit.getComponent(Label).string = l10n.t("shared_record_win") + `(${MoneyUtil.currencySymbol()})`;

        this.fistTip.active = false;
        if (GameCtrl.isFristReqRecord == false) {
            GameCtrl.isFristReqRecord = true
            this.fistTip.active = true;
        }
        CocosUtil.traverseNodes(this.node, this.m_ui);

        CocosUtil.addClickEvent(this.m_ui.btn_close, async () => {
            let opacity = this.m_ui.btn_close.getComponent(UIOpacity);
            if (!opacity) {
                opacity = this.m_ui.btn_close.addComponent(UIOpacity);
                opacity.opacity = 150
            }
            await CocosUtil.wait(0.1)
            UIManager.closeView(EViewNames.UIhistory);
        }, this, null, 1)

        CocosUtil.addClickEvent(this.m_ui.btn_filter, function () {
            UIManager.showView(EViewNames.UIselectdate, EUILayer.Dialog);
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.retry, async () => {
            this.m_ui.load_err.active = false;
            await this.waitAnim(false);
            this.getData();
        }, this);

        CocosUtil.addClickEvent(this.m_ui.err_close, () => {
            UIManager.closeView(EViewNames.UIhistory);
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.REFESH_RECORD_FILTER, this.onSearchFilterChg, this);
        // EventCenter.getInstance().listen(Routes.req_history, this.onReqHistory, this);

        this.initList();
        this.refreshList([]);

        // GameUtil.showAni(this.node);

        RecordMgr.getInstance().setFilter(1, 1);
    }

    waitAnim(isOpacity: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.m_ui.loadtipBig.active = true;
            Tween.stopAllByTarget(this.m_ui.loadtipBig.getComponent(UIOpacity));
            this.m_ui.loadtipBig.getComponent(UIOpacity).opacity = 255;
            let tw = tween(this.m_ui.loadtipBig.getComponent(UIOpacity)).delay(0.5);
            if (isOpacity) {
                tw.to(0.2, { opacity: 0 }).call(() => {
                    resolve();
                }).start();
            } else {
                tw.call(() => {
                    resolve();
                }).start();
            }
        })
    }

    setThemeColor() {
        CocosUtil.changeCurNodeColor(this.m_ui.lb_title, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.lb_filter, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.loadtip, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.loadtipBig.getChildByName("loading"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.loadtipBig.getChildByName("Label"), PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.loadtipBigs, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.retry.getChildByName("Label"), PublicConfig.themeColor);
    }

    private initList() {
        this.compList = this.m_ui.content.addComponent(CpnList);
        let cpn = this.compList;
        cpn.config(0, this.m_ui.content.parent.parent);
        this.compList.getComScrollView().setReqCallback(this.getData, this)
        this.compList.getComScrollView().setCheckFullCallback(this.checkFullCallback, this)
        cpn.setCreateFunc(() => {
            let item = instantiate(this.itemPre);
            CocosUtil.initComponent(item, CpnListCell).setDelegate(item.getComponent(ItemHistory));
            return item;
        }, CocosUtil.getTemplateSize(this.itemPre));
    }

    private refreshList(arr: any[]) {
        arr = arr || RecordMgr.getInstance().getDataList();
        this.compList.setData(arr);
    }

    private async onSearchFilterChg() {
        if (RecordMgr.getInstance().filterFrom == 1) {
            this.m_ui.lb_title_filter.getComponent(Label).string = l10n.t("shared_record_date_today");
            this.m_ui.lb_filter.getComponent(Label).string = l10n.t("shared_record_date_today");
        } else if (RecordMgr.getInstance().filterFrom == 7) {
            this.m_ui.lb_title_filter.getComponent(Label).string = l10n.t("shared_record_date_last_week");
            this.m_ui.lb_filter.getComponent(Label).string = l10n.t("shared_record_date_last_week");
        } else {
            let from = DateUtil.formatDay(RecordMgr.getInstance().filterFrom, "/");
            let to = DateUtil.formatDay(RecordMgr.getInstance().filterTo, "/");
            this.m_ui.lb_title_filter.getComponent(Label).string = from + " - " + to;
            this.m_ui.lb_filter.getComponent(Label).string = from + " - " + to;;
        }
        this.refreshList([]);
        await this.waitAnim(false);
        this.getData()
    }

    async refGetData(): Promise<ServerResult<RecordListRsp>> {
        let param: any = await RecordMgr.getInstance().pullData();
        warn("refGetData", param);
        if (!param) {
            this.m_ui.load_err.active = true;
            return null
        }
        let cnt = param && param.data && param.data.count || 0;
        RecordMgr.getInstance()._dataCount = cnt;
        if (RecordMgr.getInstance().getDataList().length >= cnt) {
            return param;
        }
        if (!param || !param.data || !param.data.list) {
            return param;
        }
        RecordMgr.getInstance()._offset += 20;
        RecordMgr.getInstance().appendDatas(param);
        return param
    }

    async getData() {
        let param: any = await this.refGetData()
        tween(this.m_ui.loadtipBig.getComponent(UIOpacity)).to(0.2, { opacity: 0 }).start();
        if (param) {
            this.onReqHistory(param);
        }
        return param
    }

    checkFullCallback() {
        return RecordMgr.getInstance().checkReqFull()
    }

    private onReqHistory(param) {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.UI_LOADING_REQ_COMPLETE, this.node)
        this.scheduleOnce(() => {
            this.fistTip.active = false;
        }, 4);
        let data: RecordListRsp = param.data;
        this.m_ui.lb_record_cnt.getComponent(Label).string = l10n.t("shared_record_total_record_n").replace("%{1}", (data && data.count || 0).toString());
        this.m_ui.lb_total_bet.getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data && data.bet || 0);
        this.m_ui.lb_total_profit.getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(data && data.win || 0);
        this.refreshList(null);
        warn("onReqHistory", data)
        let cnt = data && data.count || 0;
        this.m_ui.lb_tip_none.active = cnt <= 0;
        if (this.m_ui.lb_tip_none.active) {
            this.m_ui.label_bet.getComponent(Label).string = l10n.t("shared_record_bet") + `(${MoneyUtil.currencySymbol()})`;
            this.m_ui.label_profit.getComponent(Label).string = l10n.t("shared_record_win") + `(${MoneyUtil.currencySymbol()})`;
        }
    }

}