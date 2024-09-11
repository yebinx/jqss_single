import { error, warn } from "cc";
import ModelBase from "../../../scripts/kernel/core/model/ModelBase";
import EventCenter from "../../../scripts/kernel/core/event/EventCenter";
import Routes from "../../../scripts/define/Routes";
import { ServerResult } from "../../../scripts/interface/common";
import { RecordListRsp } from "../../../scripts/interface/recordlist";
import LoginCtrl from "../../../scripts/ctrls/LoginCtrl";
import DateUtil from "../../../scripts/kernel/core/utils/DateUtil";
import HttpMgr from "../../../scripts/mgrs/HttpMgr";
import { RecordDetailInfo, RecordDetailRsp } from "../../../scripts/interface/recorddetail";
import { PUBLIC_EVENTS } from "../../../scripts/event/PublicEvents";



export default class RecordMgr extends ModelBase {
    private static _instance: RecordMgr = null;
    public static getInstance(): RecordMgr {
        if (!RecordMgr._instance) { RecordMgr._instance = new RecordMgr; }
        return RecordMgr._instance;
    }
    public static delInstance(): void {
        if (RecordMgr._instance) {
            RecordMgr._instance.do_dtor();
            RecordMgr._instance = null;
        }
    }
    protected on_dtor(): void {

    }
    private constructor() {
        super();
        EventCenter.getInstance().hook(Routes.req_hisdetail, this.onDetailData, this);
    }

    private _filterFrom: number = 1;
    private _filterTo: number = 1;

    get filterFrom() {
        return this._filterFrom;
    }

    get filterTo() {
        return this._filterTo;
    }


    _offset = 0;
    _dataCount = 1;
    private _dataArr = [];

    getDataList() {
        return this._dataArr;
    }

    appendDatas(param) {
        let data = param.data;
        let arr = data && data.list || [];
        this._dataArr.push(...arr);
    }

    setFilter(from: number, to: number) {
        this._filterFrom = from;
        this._filterTo = to;
        this._offset = 0;
        this._dataCount = 1;
        this._dataArr = [];
        EventCenter.getInstance().fire(PUBLIC_EVENTS.REFESH_RECORD_FILTER);
    }

    checkReqFull() {
        return this._dataArr.length >= this._dataCount
    }

    pullData(): Promise<ServerResult<RecordListRsp>> {
        return new Promise(res => {
            if (this.checkReqFull()) { return res(null); }
            let info = {
                token: LoginCtrl.getIns().getModel().getToken(),
                start_timestamp: DateUtil.getSysTime() - 1 * 24 * 60 * 60 * 1000,
                end_timestamp: DateUtil.getSysTime(),
                limit: 20,
                offset: this._offset,
            }

            if (this.filterFrom == 1) {
                let now = new Date(DateUtil.getSysTime());
                let now_year = now.getFullYear();
                let now_month = now.getMonth() + 1;
                let now_day = now.getDate();
                let startTime = DateUtil.getTimestamp(now_year, now_month, now_day, 0, 0, 1);
                info.start_timestamp = startTime;
                info.end_timestamp = DateUtil.getSysTime();
            }
            else if (this.filterFrom == 7) {
                info.start_timestamp = DateUtil.getSysTime() - 6 * 24 * 60 * 60 * 1000;
                info.end_timestamp = DateUtil.getSysTime();
            }
            else {
                info.start_timestamp = this.filterFrom;
                info.end_timestamp = this.filterTo;
            }
            HttpMgr.getIns().post(Routes.req_history, info, (bSucc: boolean, param: ServerResult<RecordListRsp>) => {
                if (bSucc) {
                    res(param)
                } else {
                    res(null);
                }
            })
        })
    }


    private _allDetails: { [key: string]: RecordDetailInfo[] } = {};

    pullDetail(orderId: string) {
        return new Promise(res => {
            if (this._allDetails[orderId]) {
                res(this._allDetails[orderId])
                return
            }
            HttpMgr.getIns().post(Routes.req_hisdetail, { token: LoginCtrl.getIns().getModel().getToken(), order_id: orderId }, (bSucc: boolean, param: ServerResult<RecordDetailRsp>) => {
                res(param?.data?.list)
            });
        })
    }

    private onDetailData(param: ServerResult<RecordDetailRsp>) {
        let req = param && param.req;
        let orderId = req && req.order_id;
        if (!orderId) { return; }
        this._allDetails[orderId] = param.data.list;
    }

}

