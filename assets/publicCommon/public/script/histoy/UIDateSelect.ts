import { _decorator, ScrollView, UITransform, v3, size, instantiate, Label, Node, Prefab } from "cc";
import { BaseView } from "../../../../scripts/kernel/compat/view/BaseView";
import { PUBLIC_EVENTS } from "../../../../scripts/event/PublicEvents";
import { UIManager } from "../../../../scripts/kernel/compat/view/UImanager";
import { EViewNames } from "../../../../scripts/configs/UIConfig";
import RecordMgr from "../RecordMgr";


const { ccclass, property } = _decorator;

const MAX_DAYS = 7;

@ccclass('UIDateSelect')
export class UIDateSelect extends BaseView {


    start() {
        this.node.on(PUBLIC_EVENTS.REQUEST_CUSTOM_DATE_RECORD[PUBLIC_EVENTS.REQUEST_CUSTOM_DATE_RECORD], this.onSelectData, this)
        let com = this.getComponent("RecordCustomDate")
        if (com) {
            com["setDate"](this.node)
        }
    }

    onSelectData(startTimestamp, endTimestamp) {
        UIManager.closeView(EViewNames.UIselectdate)
        RecordMgr.getInstance().setFilter(startTimestamp, endTimestamp);
    }

    protected onDestroy(): void {
        UIManager.closeView(EViewNames.UIDateSelect)
    }

}


