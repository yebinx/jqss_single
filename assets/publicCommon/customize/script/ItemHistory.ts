import { Color, _decorator } from "cc";
import { IListCell } from "../../../scripts/kernel/compat/view/scroll/ICell";
import { CpnListCell } from "../../../scripts/kernel/compat/view/scroll/CpnListCell";
import { CpnList } from "../../../scripts/kernel/compat/view/scroll/CpnList";
import CocosUtil from "../../../scripts/kernel/compat/CocosUtil";
import { UIManager } from "../../../scripts/kernel/compat/view/UImanager";
import { EViewNames } from "../../../scripts/configs/UIConfig";
import { EUILayer } from "../../../scripts/kernel/compat/view/ViewDefine";
import { log, Node } from "cc";
import { Label } from "cc";
import DateUtil from "../../../scripts/kernel/core/utils/DateUtil";
import MoneyUtil from "../../../scripts/kernel/core/utils/MoneyUtil";
import { Button } from "cc";
import { color } from "cc";
import { BaseView } from "../../../scripts/kernel/compat/view/BaseView";
import { PublicConfig } from "./PublicConfig";
import { Sprite } from "cc";

const COLOR_G = new Color("#BEBEBE");
const COLOR_W = new Color("#FFFFFF");

const { ccclass, property } = _decorator;
@ccclass('ItemHistory')
export class ItemHistory extends BaseView implements IListCell {

    start() {
        this.m_ui.free_ra.getComponent(Sprite).color = PublicConfig.themeColor.clone();
        this.m_ui.lucky_neko_flag.getComponent(Sprite).color = PublicConfig.themeColor.clone();
        this.m_ui.icon.getComponent(Sprite).color = PublicConfig.themeColor.clone();
    }

    doInit(cellCpn: CpnListCell, listCpn: CpnList): void {
        CocosUtil.addClickEvent(cellCpn.node, function () {
            let info = this.getData();
            UIManager.showView(EViewNames.UIHisDetail, EUILayer.Popup, info);
        }, cellCpn, null, 1.01);


    }

    doUpdate(cellCpn: CpnListCell, listCpn: CpnList, data: any, idx: number): void {
        log("data", data)
        let item = cellCpn.node;
        let info = cellCpn.getData();
        let conts: Node = CocosUtil.findNode(item, "conts");
        let layout = conts.getChildByName("layout");
        let otherInfo = layout.getChildByName("other");
        let freeTimes = data.free_round_times ? data.free_round_times : 0;
        let normalTimes = data.normal_round_times ? data.normal_round_times : 0;
        otherInfo.active = !!data.free_times || !!normalTimes;
        otherInfo.getChildByName("free_ra").active = data.free_times > 0;
        otherInfo.getChildByName("continuous").active = !!normalTimes || !!data.free_times;
        if (data.free_times) {
            otherInfo.getChildByName("continuous").getChildByName("num").getComponent(Label).string = normalTimes + " + " + freeTimes;
        } else {
            otherInfo.getChildByName("continuous").getChildByName("num").getComponent(Label).string = normalTimes;
        }
        conts.getChildByName("lb_time").getComponent(Label).string = DateUtil.formatTime1(info.create_timestamp / 1000, 2);
        layout.getChildByName("lb_order").getComponent(Label).string = info.order_id;
        conts.getChildByName("lb_bet").getComponent(Label).string = MoneyUtil.rmbStr(info.bet);
        let profit = parseFloat(info.win_s);
        let lb_profit = conts.getChildByName("lb_profit").getComponent(Label);
        // if (profit > 0) {
        //     lb_profit.color = new Color(255, 255, 255)
        // }
        lb_profit.string = MoneyUtil.rmbStr(info.win);
        lb_profit.color = profit > 0 && COLOR_W || COLOR_G;
        let btn = item.getComponent(Button);
        btn.normalColor = idx % 2 == 0 && color(52, 52, 63, 255) || color(48, 48, 60, 255);
        if (idx == listCpn.dataLen() - 1) {
            // this.reqGet(listCpn)
        }
    }

    onSelect(cellCpn: CpnListCell, listCpn: CpnList, bSelected: boolean): void {

    }

}
