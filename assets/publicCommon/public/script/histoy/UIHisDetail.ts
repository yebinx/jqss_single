import { _decorator, color, Component, easing, error, instantiate, Label, log, Node, Prefab, Tween, tween, UIOpacity, UITransform, v3, warn, Widget } from 'cc';
import { PopupView } from '../../../../scripts/kernel/compat/view/PopupView';
import { RecordDetailInfo, RoundDetailInfo } from '../../../../scripts/interface/recorddetail';
import { PublicConfig } from '../../../customize/script/PublicConfig';
import { UIManager } from '../../../../scripts/kernel/compat/view/UImanager';
import { EViewNames } from '../../../../scripts/configs/UIConfig';
import CocosUtil from '../../../../scripts/kernel/compat/CocosUtil';
import EventCenter from '../../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../../scripts/event/PublicEvents';
import { UIActionEx } from '../../../../scripts/views/common/UIActionEx';
import RecordMgr from '../RecordMgr';
import { UIDetailTip } from './UIDetailTip';
import MoneyUtil from '../../../../scripts/kernel/core/utils/MoneyUtil';
import { l10n } from '../../../../../extensions/localization-editor/static/assets/l10n';
import { CompHisPage } from '../../../customize/script/CompHisPage';
import { Vec3 } from 'cc';
import { EventTouch } from 'cc';


const { ccclass, property } = _decorator;
@ccclass('UIHisDetail')
export class UIHisDetail extends PopupView {
    private _ddIndex: number = 0;
    @property(Prefab)
    prfPage: Prefab;
    private _param;

    private _curIdx: number = 0;
    private _detailData: RoundDetailInfo[] = null;
    private _data: RecordDetailInfo[] = null;
    private _expanded: boolean = false;

    private curcloneTip: Node;

    private _beforeData: any = null;

    pages: Node[] = [];

    _initedFL: boolean = false;

    private _pageLimit: number = 10;

    private _moveLock: boolean = false;
    private _canMove: boolean = false;

    private _moveTargetPosX: number = null;
    private _moveStartTime: number = 0;
    private _moveEndTime: number = 0;

    // private _moveTime: (() => void)[] = [];
    private _touchStartPos: Vec3 = v3(0, 0, 0);

    private setExpanded(bExp: boolean) {
        this._expanded = bExp;
        this.m_ui.expand_arrow.scale = v3(1, bExp && -1 || 1, 1)
        if (bExp) {
            this.m_ui.pan_frees.active = bExp;
            tween(this.m_ui.pan_frees)
                .to(0.4, { position: v3(0, -64, 0) })
                .start()
            this.initFreeList()
            this.highSelect();
        } else {
            tween(this.m_ui.pan_frees)
                .to(0.4, { position: v3(0, 1574, 0) })
                .call(() => {
                    this.m_ui.pan_frees.active = bExp;
                })
                .start()
        }
    }

    private highSelect() {
        for (let i = 0; i < this.m_ui.cont_frees.children.length; i++) {
            let ddd = this.m_ui.cont_frees.children[i];
            if (i == this._curIdx) {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).color = PublicConfig.themeColor.clone();
                ddd.getChildByName("lb_free_gld").getComponent(Label).color = PublicConfig.themeColor.clone();
            } else {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).color = color(255, 255, 255, 255);
                ddd.getChildByName("lb_free_gld").getComponent(Label).color = color(255, 255, 255, 255);
            }
        }
    }

    initData(data) {
        log("详情数据", data);
        this._data = data;
    }

    protected onLoad(): void {
        super.onLoad();
        this.m_ui.btn_pre.active = false;
        this.m_ui.btn_next.active = false;
        this.setExpanded(false);
        this.m_ui.aniRoot.getComponent(UIOpacity).opacity = 1;

        tween(this.node).delay(0.5).call(() => {
            UIManager.getView(EViewNames.UIhistory).active = false;
        }).start();

        this.setThemeColor();
    }

    waitAnim(isTransparent: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.m_ui.loadtip.active = true;
            let op = this.m_ui.loadtip.getComponent(UIOpacity);
            Tween.stopAllByTarget(op);
            op.opacity = 255;
            if (!isTransparent) {
                tween(op).delay(0.5).call(() => {
                    resolve();
                }).start();
            } else {
                tween(op).to(0.2, { opacity: 0 }).call(() => {
                    resolve();
                }).start();
            }
        })
    }

    start() {
        this.m_ui.pages.on(Node.EventType.TOUCH_END, () => {
            this.m_ui.detailBG.active = false;
            this.closeCurcloneTip();
        })

        this.m_ui.top.on(Node.EventType.TOUCH_END, () => {
            this.m_ui.detailBG.active = false;
            this.closeCurcloneTip();
        })

        CocosUtil.addClickEvent(this.m_ui.btn_close, this.closeThisView, this);

        CocosUtil.addClickEvent(this.m_ui.btn_pre, () => {
            if (this._moveLock == false) {
                let idx = this._ddIndex
                idx--;
                if (idx < 0) {
                    idx = 0
                }
                this.turnPage(idx)
            }

        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btn_next, () => {
            if (this._moveLock == false) {
                let idx = this._ddIndex
                idx++;
                let len = this.getTotalNum();
                if (idx > len - 1) {
                    idx = len - 1;
                }
                this.turnPage(idx)
            }
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btn_expand, () => {
            this.closeCurcloneTip();
            if (this._data.length <= 1) {
                return;
            }
            this.setExpanded(!this._expanded);
        }, this, null, 1);

        CocosUtil.addClickEvent(this.m_ui.btnClosePanFree, () => {
            this.setExpanded(false);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.retry, async () => {
            this.m_ui.load_err.active = false;
            this.isAnim = false;
            await this.waitAnim(false);
            this.before(this._beforeData);
        }, this);

        CocosUtil.addClickEvent(this.m_ui.err_close, () => {
            Tween.stopAllByTarget(this.node);
            UIManager.getView(EViewNames.UIhistory).active = true;
            UIManager.closeView(EViewNames.UIHisDetail);
        }, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.UI_SHOW_HISTORICAL_DETAILS, this.onShowDetailTip, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.HISTORY_LIST_MOVE, this.pagesMove, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, this.pagesMoveEnd, this);
        this.scheduleOnce(() => {
            this.m_ui.aniRoot.getComponent(UIOpacity).opacity = 255;
        });
    }

    closeThisView() {
        Tween.stopAllByTarget(this.node);
        UIManager.getView(EViewNames.UIhistory).active = true;
        UIManager.closeView(EViewNames.UIHisDetail);
    }
    protected update(dt: number): void {
        if (this._moveTargetPosX !== null && this.isInitPage) {
            let curX = this.pages[this._ddIndex].position.x;
            let dir = (this._moveTargetPosX - curX) / Math.abs(this._moveTargetPosX - curX);
            if (Number.isNaN(dir)) {
                dir = 0;
            }
            let d = 2800 * dt * dir;
            let t = this.pages[this._ddIndex].position.x + d;
            if (this._moveTargetPosX < curX) {
                if (t < this._moveTargetPosX) {
                    d -= t - this._moveTargetPosX;
                    this._moveTargetPosX = null;
                }
            } else if (this._moveTargetPosX > curX) {
                if (t > this._moveTargetPosX) {
                    d -= t - this._moveTargetPosX;
                    this._moveTargetPosX = null;
                }
            }
            this.pages.forEach((page, idx) => {
                page && page.setPosition(page.position.x + d, page.position.y, page.position.z);
            })
            if (this._ddIndex == 0 && this.pages[this._ddIndex].position.x > this.pages[this._ddIndex].getComponent(UITransform).contentSize.width / 2) {
                this.closeThisView();
            }
        }
    }
    pagesMove(ev: EventTouch) {
        let start = ev.getUIStartLocation();
        let end = ev.getUILocation();
        let c = end.subtract(start);
        if (Math.abs(c.x) >= 50) {
            if (!this._canMove) {
                this._canMove = true;
                this._touchStartPos = this.pages[this._ddIndex].position.clone();
                this._moveStartTime = new Date().getTime();
            }
        }
        if (!this._canMove || this._moveLock) {
            return;
        }
        if (this._canMove) {
            let d = c.x * 2 - this.pages[this._ddIndex].position.x + this._touchStartPos.x;
            let target = this.pages[this._ddIndex].position.x + d;
            if (target > this.pages[this._ddIndex].getComponent(UITransform).contentSize.width) {
                d = this.pages[this._ddIndex].getComponent(UITransform).contentSize.width - this.pages[this._ddIndex].position.x;
                target = this.pages[this._ddIndex].getComponent(UITransform).contentSize.width;
                this._moveLock = true;
                this._canMove = false;
            } else if (target < -this.pages[this._ddIndex].getComponent(UITransform).contentSize.width) {
                d = -this.pages[this._ddIndex].getComponent(UITransform).contentSize.width - this.pages[this._ddIndex].position.x;
                target = -this.pages[this._ddIndex].getComponent(UITransform).contentSize.width;
                this._moveLock = true;
                this._canMove = false;
            }
            this._moveTargetPosX = target;
        }
    }

    private isInitPage: boolean = true;

    pagesMoveEnd(ev: EventTouch) {
        this.pagesMove(ev);
        if (this.isInitPage == false) return;
        this._moveTargetPosX = null;
        this._canMove = false;
        this.isInitPage = false;
        let targetNum = this._ddIndex;
        this._moveEndTime = new Date().getTime();
        let dir = 0;
        if (this._moveEndTime - this._moveStartTime < 100) {
            let c = ev.getUILocation().x - ev.getUIStartLocation().x;
            if (Math.abs(c) > 50) {
                dir = c;
            }
        }
        if (this.pages[this._ddIndex].position.x > this.pages[this._ddIndex].getComponent(UITransform).contentSize.width / 2 || dir > 0) {
            targetNum--;
            if (targetNum < 0) {
                targetNum = 0;
                this.closeThisView();
            } else {
            }
        } else if (this.pages[this._ddIndex].position.x < -this.pages[this._ddIndex].getComponent(UITransform).contentSize.width / 2 || dir < 0) {
            targetNum++;
            if (targetNum >= this.pages.length) {
                targetNum = this.pages.length - 1;
            } else {
            }
        } else {
        }
        let offsetX = this.pages[this._ddIndex].getComponent(UITransform).width * -targetNum;
        let total = 0, count = 0;
        this.pages.forEach(async (page, idx) => {
            if (page) {
                Tween.stopAllByTarget(page);
                total++;
                if (this.pages[this._ddIndex].getComponent(UITransform).width * idx + offsetX == page.position.x) {
                    count++;
                    if (total == count) {
                        this._ddIndex = targetNum;
                        await this.deleteRedundant();
                        this.m_ui.btn_pre.active = this._ddIndex != 0;
                        this.m_ui.btn_next.active = this._ddIndex != this.getTotalNum() - 1;
                        this._moveLock = false;
                        this._curIdx = this.findCurIdx(this._ddIndex);
                        this.setTitleName();
                        this.isInitPage = true;
                    }
                } else {
                    tween(page).to(0.2, { position: v3(this.pages[this._ddIndex].getComponent(UITransform).width * idx + offsetX, 0, 0) }).call(async () => {
                        count++;
                        if (total == count) {
                            this._ddIndex = targetNum;
                            await this.deleteRedundant();
                            this.m_ui.btn_pre.active = this._ddIndex != 0;
                            this.m_ui.btn_next.active = this._ddIndex != this.getTotalNum() - 1;
                            this._moveLock = false;
                            this._curIdx = this.findCurIdx(this._ddIndex);
                            this.setTitleName()
                            this.isInitPage = true;
                        }
                    }).start();
                }
            }
        })
    }

    setThemeColor() {
        CocosUtil.changeNodeColor(this.m_ui.loadtipBigs, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.loadtip.getChildByName("loading"), PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.loadtip.getChildByName("Label"), PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.retry.getChildByName("Label"), PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.btn_pre.getChildByName("arrow"), PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.btn_next.getChildByName("arrow"), PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.btn_close1, PublicConfig.themeColor);
        CocosUtil.changeCurNodeColor(this.m_ui.lb_title, PublicConfig.themeColor);
        CocosUtil.changeNodeColor(this.m_ui.expand_arrow, PublicConfig.themeColor);
    }

    async before(data) {
        warn("before", data)
        this._beforeData = data;
        this.waitAnim(false);
        let datas = await Promise.all([
            new Promise(async res => {
                if (this.isAnim) {
                    // CocosUtil.traverseNodes(this.node, this.m_ui)
                    let aniRoot = this.m_ui.aniRoot
                    if (aniRoot) {
                        await UIActionEx.runAction(aniRoot, this.uiOpenAction)
                        res(null)
                    }
                } else {
                    res(null)
                }
            }),
            RecordMgr.getInstance().pullDetail(data.order_id)
        ])
        if (!datas[1]) {
            this.m_ui.load_err.active = true;
            return;
        }
        this.onDetailData(datas[1] as any);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.UI_LOADING_REQ_COMPLETE, this.node)
    }

    private tipitem: Node = null;
    private onShowDetailTip(uiNode: Node, info: { dataArr: string[], item: Node }) {
        let isDel: boolean = false;
        if (this.tipitem == null) {
            this.tipitem = info.item;
            isDel = false;
        } else {
            if (this.tipitem == info.item) {
                isDel = true;
            } else {
                isDel = false;
                this.tipitem = info.item;
            }
        }

        if (isDel) {
            if (this.curcloneTip && this.curcloneTip.isValid || !info) {
                this.closeCurcloneTip();
            }
            return;
        }
        if (info == undefined || info == null) return
        if (this.curcloneTip == null) {
            console.log("onShowDetailTip");
            this.m_ui.detailBG.active = true;
            let cloneTip = instantiate(this.m_ui.UIDetailTip)
            cloneTip.active = true;
            this.curcloneTip = cloneTip;
            CocosUtil.addClickEvent(this.curcloneTip.getChildByName("bg_corner4"), () => {
                this.closeCurcloneTip();
            }, this);
        }
        this.curcloneTip.getComponent(UIDetailTip).initData(info)
        uiNode.addChild(this.curcloneTip);
    }
    private closeCurcloneTip(): void {
        this.tipitem = null;
        if (this.curcloneTip && this.curcloneTip.isValid) {
            console.log("closeCurcloneTip");
            this.curcloneTip.destroy()
            this.curcloneTip = null;
        }
    }
    private onDetailData(detailInfo?: RecordDetailInfo[]) {
        this._curIdx = 0;
        this._data = detailInfo
        this._detailData = this._data[this._curIdx].round_list;
        if (!this._detailData) {
            return;
        }
        log("-----detail", this._data[this._curIdx].create_time);
        let curData = this._detailData[this._ddIndex];
        if (!curData) {
            return
        }
        this.m_ui.expand_arrow.active = this._data.length > 1;
        let tstr = this._data[this._curIdx].create_time.substring(0, this._data[this._curIdx].create_time.length - 3) + " (GMT+8:00)";
        this.m_ui.lb_title_filter.getComponent(Label).string = tstr.replace(/-/g, "/");
        this.initPages();
        this.selectPage(this._curIdx);
    }

    private initPages() {
        return new Promise<void>(async (resolve, reject) => {
            this.pages.forEach((page, idx) => {
                if (!page) {
                    return;
                }
                page.destroy();
                this.pages[idx] = null;
            })
            this.pages.length = 0;
            let len = this.getTotalNum();
            this.pages.length = len;
            let num = len < Math.floor(this._pageLimit / 2) + 1 ? len : Math.floor(this._pageLimit / 2) + 1;
            for (let i = 0; i < num; i++) {
                await this.addPage(i);
            }
            this.waitAnim(true);
        })
    }

    addPage(idx: number) {
        return new Promise<Node>(async (resolve, reject) => {
            let isact = idx == this._ddIndex || idx == this._ddIndex + 1 || idx == this._ddIndex - 1
            let one = null;
            // if (isact) {
            one = instantiate(this.prfPage)
            one.active = isact;
            this.m_ui.pages.addChild(one);
            one.setPosition(756 * (idx - this._ddIndex), 0, 0);
            console.log("==============", one.active);
            this.pages[idx] = one;
            await this.refreshPageData(idx);
            // }
            await CocosUtil.nextFrame();
            resolve(one);
        })
    }
    private deleteRedundant() {
        return new Promise<void>(async (resolve, reject) => {
            for (let i = 0; i < this.pages.length; i++) {
                let page = this.pages[i];
                if (page) {
                    let half = Math.floor(this._pageLimit / 2);
                    if (i < this._ddIndex - half || i > this._ddIndex + half) {
                        page.destroy();
                        this.pages[i] = null;
                    }
                    if (this._ddIndex != i && this._ddIndex != i + 1 && this._ddIndex != i - 1) {
                        if (this.pages[i] && this.pages[i].active) {
                            this.pages[i].active = false;
                            await CocosUtil.nextFrame();
                        }
                    } else {
                        if (this.pages[i] && !this.pages[i].active) {
                            this.pages[i].active = true;
                            await CocosUtil.nextFrame();
                        }
                    }
                } else {
                    if ((i == this._ddIndex + 1 || i == this._ddIndex - 1)) {
                        await this.addPage(i);
                    }
                }
            }
            resolve()
        })
    }
    private getTotalNum() {
        let len = 0;
        this._data.forEach((detail) => {
            len += detail.round_list.length;
        });
        return len;
    }

    private findCurIdx(pageIdx: number) {
        let len = 0;
        for (let i = 0; i < this._data.length; i++) {
            let ele = this._data[i];
            let nextLen = len + ele.round_list.length;
            if (pageIdx < nextLen) {
                return i;
            }
            len = nextLen;
        }
        return this._data.length - 1;
    }

    private initFreeList() {
        if (this._initedFL) { return; }
        this._initedFL = true;
        let total = this._data.length - 1;
        for (let i = 0; i < this._data.length; i++) {
            let ddd = this.m_ui.cont_frees.children[i];
            let gold = 0;
            if (!ddd) {
                ddd = instantiate(this.m_ui.cont_frees.children[0]);
                ddd.parent = this.m_ui.cont_frees;
                ddd.getChildByName("lb_free_rmn").getComponent(Label).string = l10n.t("shared_record_free_play").replace("%{1}", i + "/" + total);
                gold = MoneyUtil.rmbYuan(this._data[i].prize);
            } else {
                ddd.getChildByName("lb_free_rmn").getComponent(Label).string = l10n.t("shared_record_normal_play");
                gold = MoneyUtil.rmbYuan(this._data[i].player_win_lose);
            }
            let fuhao = gold < 0 ? "-" : "";
            ddd.getChildByName("lb_free_gld").getComponent(Label).string = fuhao + MoneyUtil.currencySymbol() + MoneyUtil.formatGold(Math.abs(gold));

            CocosUtil.addClickEvent(ddd, async () => {
                await this.selectPage(i);
                this.setExpanded(false);
                this.highSelect();
            }, this, i, 0.96);
        }
    }

    setTitleName() {
        warn("setTitleName", this._curIdx);
        let curDetailData = this._data[this._curIdx];
        if (curDetailData) {
            let len = this._data.length - 1;
            let curIdx = this._curIdx
            if (this._curIdx == 0) {
                this.m_ui.lb_title.getComponent(Label).string = l10n.t("shared_record_normal_play");
            } else {
                this.m_ui.lb_title.getComponent(Label).string = l10n.t("shared_record_free_play").replace("%{1}", curIdx + "/" + len);
            }
        }
    }

    async refreshPageData(pageIdx: number) {
        let msg = this.getDetailData(pageIdx);
        warn("refreshPageData", msg.data, this._curIdx);
        await this.pages[pageIdx].getComponent(CompHisPage).setData(msg.data, msg.listData);
    }

    private getDetailData(pageIdx: number) {
        let len = 0;
        for (let i = 0; i < this._data.length; i++) {
            let ele = this._data[i];
            let nextLen = len + ele.round_list.length;
            if (pageIdx < nextLen) {
                return { data: ele.round_list[pageIdx - len], listData: ele };
            }
            len = nextLen;
        }
    }


    private async turnPage(nextIdx: number) {
        this._moveLock = true;
        let curIdx = this._ddIndex;
        warn("turnPage", this.pages.length, curIdx, nextIdx)
        let curPage = this.pages[curIdx];
        let nextPage = this.pages[nextIdx];
        if (!curPage) {
            curPage = await this.addPage(curIdx);
        }
        if (!nextPage) {
            nextPage = await this.addPage(nextIdx);
        }
        this.closeCurcloneTip();
        curPage.active = true;
        nextPage.active = true;
        Tween.stopAllByTarget(curPage);
        Tween.stopAllByTarget(nextPage);
        let width = curPage.getComponent(UITransform).contentSize.width;
        if (nextIdx > curIdx) {
            curPage.setPosition(0, curPage.position.y, curPage.position.z);
            nextPage.setPosition(width, nextPage.position.y, nextPage.position.z);
            tween(curPage).by(0.4, { position: v3(-width, 0, 0) }, { easing: easing.cubicOut }).call(
                async () => {
                    let createTime = new Date().getTime();
                    await this.deleteRedundant();
                    this.resetPos();
                    this._moveLock = false;
                    console.log(new Date().getTime() - createTime);
                }
            ).start();
            tween(nextPage).by(0.4, { position: v3(-width, 0, 0) }, { easing: easing.cubicOut }).start();
        } else {
            curPage.setPosition(0, curPage.position.y, curPage.position.z);
            nextPage.setPosition(-width, nextPage.position.y, nextPage.position.z);
            tween(curPage).by(0.4, { position: v3(width, 0, 0) }, { easing: easing.cubicOut }).call(
                async () => {
                    let createTime = new Date().getTime();
                    await this.deleteRedundant();
                    this.resetPos();
                    this._moveLock = false;
                    console.log(new Date().getTime() - createTime);

                }
            ).start();
            tween(nextPage).by(0.4, { position: v3(width, 0, 0) }, { easing: easing.cubicOut }).start();
        }
        this._ddIndex = nextIdx;
        this.m_ui.btn_pre.active = this._ddIndex != 0;
        this.m_ui.btn_next.active = this._ddIndex != this.getTotalNum() - 1;
        this._curIdx = this.findCurIdx(this._ddIndex);
        this.setTitleName();
    }

    resetPos() {
        this.pages.forEach((p, idx) => {
            p && p.setPosition(0 + p.getComponent(UITransform).contentSize.width * (idx - this._ddIndex), p.position.y, p.position.z);
        })
    }

    findIndexZore(curIdx: number) {
        let len = 0;
        for (let i = 0; i < this._data.length; i++) {
            let ele = this._data[i];
            if (i == curIdx) {
                break;
            }
            len += ele.round_list.length;
        }
        return len;
    }

    private selectPage(curIdx: number) {
        return new Promise<void>(async (resolve, reject) => {
            this._ddIndex = this.findIndexZore(curIdx);
            warn("selectPage", this._ddIndex, curIdx);
            if (this._ddIndex < this.pages.length && this._ddIndex >= 0) {
                await this.deleteRedundant();
                let page = this.pages[this._ddIndex];
                if (!page) {
                    page = await this.addPage(this._ddIndex);
                }
                page.active = true;
                this._curIdx = curIdx;
                this.m_ui.btn_pre.active = this._ddIndex != 0;
                this.m_ui.btn_next.active = this._ddIndex != this.getTotalNum() - 1;
                this.resetPos();
                warn("总页数", this.getTotalNum() - 1, this._ddIndex)
                // page.setPosition(0, page.position.y, page.position.z);
                this.setTitleName()
            }
            resolve();
        })
    }

}


