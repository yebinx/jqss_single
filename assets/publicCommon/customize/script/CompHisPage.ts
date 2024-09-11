import { _decorator, Component, error, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, UIOpacity, warn } from 'cc';
import BigNumber from 'bignumber.js';
import { RecordDetailInfo, RoundDetailInfo } from '../../../scripts/interface/recorddetail';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import { BaseComp } from '../../../scripts/kernel/compat/view/BaseComp';
import StringUtil from '../../../scripts/kernel/core/utils/StringUtil';
import MoneyUtil from '../../../scripts/kernel/core/utils/MoneyUtil';
import GameConst, { TItemtype } from '../../../scripts/define/GameConst';
import { PublicConfig } from '../../customize/script/PublicConfig';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import { CompDissItem } from '../../public/script/CompDissItem';
import { assetManager } from 'cc';
import GameCtrl from '../../../scripts/ctrls/GameCtrl';
import { RollAxisCom } from '../../../scripts/views/game/RollAxisCom';
import { ElementCom } from '../../../scripts/views/game/ElementCom';
import { Color } from 'cc';
import { Font } from 'cc';
import { ScrollBar } from 'cc';
import { ScrollView } from 'cc';
import { UITransform } from 'cc';
import { EventTouch } from 'cc';
import { v3 } from 'cc';
import { v2 } from 'cc';
import { input } from 'cc';
import { Input } from 'cc';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { ElementCtrl } from '../../../scripts/views/game/ElementCtrl';
import { log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CompHisPage')
export class CompHisPage extends BaseComp {
    @property(Node)
    ndElementParent: Node;
    @property(Node)
    ndIsAward: Node;
    @property(Prefab)
    prfAwardLine: Prefab
    @property(Node)
    ndAwardLineParent: Node;

    @property(Node)
    multipleNode: Node = null;

    @property(ScrollBar)
    scrollBar: ScrollBar = null;
    @property(ScrollView)
    svContent: ScrollView = null;

    itemPre: Prefab = null;

    detailInfo: RoundDetailInfo = null;
    recordInfo: RecordDetailInfo = null;


    @property(SpriteFrame)
    scatterFrame: SpriteFrame[] = [];

    @property(SpriteFrame)
    winSpriteFrame: SpriteFrame[] = []

    protected onLoad(): void {
        // CocosUtil.traverseNodes(this.node, this.m_ui)

        // this.scrollBar.node.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
        //     let dY = -ev.getDelta().y;
        //     let bar = this.scrollBar.node.getChildByName("bar");
        //     let size = bar.getComponent(UITransform).contentSize;
        //     let sSize = this.svContent.content.getComponent(UITransform).contentSize;
        //     let bl = dY / size.height * 2;
        //     let target = this.svContent.getScrollOffset().y + sSize.height * bl;
        //     if (target < 0) {
        //         target = 0;
        //     } else if (target > sSize.height) {
        //         target = sSize.height;
        //     }
        //     this.svContent.scrollToOffset(v2(0, target))
        // })
    }

    protected start(): void {
        // this.initData();
        // this.leftRightMoveEvent();
    }

    /**左右滑动事件 */
    leftRightMoveEvent() {
        let about = false, upAndDown = false;
        this.m_ui.content.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
            this.m_ui.ScrollView.getComponent(ScrollView).vertical = true;
        })
        this.m_ui.content.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            if (upAndDown) {
                return;
            } else if (about) {
                this.m_ui.ScrollView.getComponent(ScrollView).vertical = false;
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
            } else {
                let d = ev.getUILocation().subtract(ev.getUIStartLocation());
                if (Math.abs(d.x) >= 50) {
                    about = true;
                    this.m_ui.ScrollView.getComponent(ScrollView).vertical = false;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                } else if (Math.abs(d.y) >= 50) {
                    upAndDown = true;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                }
            }
        })
        this.m_ui.content.on(Node.EventType.TOUCH_CANCEL, (ev: EventTouch) => {
            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
            this.m_ui.ScrollView.getComponent(ScrollView).vertical = true;
        })
        this.m_ui.tobarT.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
            this.m_ui.ScrollView.getComponent(ScrollView).vertical = true;
        })
        this.m_ui.tobarT.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            if (upAndDown) {
                return;
            } else if (about) {
                this.m_ui.ScrollView.getComponent(ScrollView).vertical = false;
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
            } else {
                let d = ev.getUILocation().subtract(ev.getUIStartLocation());
                if (Math.abs(d.x) >= 50) {
                    about = true;
                    this.m_ui.ScrollView.getComponent(ScrollView).vertical = false;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                } else if (Math.abs(d.y) >= 50) {
                    upAndDown = true;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                }
            }
        })
        this.m_ui.tobarT.on(Node.EventType.TOUCH_CANCEL, (ev: EventTouch) => {
            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
            this.m_ui.ScrollView.getComponent(ScrollView).vertical = true;
        })
    }

    changeNodesColor() {
        this.m_ui.label_order.getComponent(Label).color = PublicConfig.themeColor.clone();
        this.m_ui.label_bet.getComponent(Label).color = PublicConfig.themeColor.clone();
        this.m_ui.label_profit.getComponent(Label).color = PublicConfig.themeColor.clone();
        this.m_ui.label_balance.getComponent(Label).color = PublicConfig.themeColor.clone();
        this.m_ui.lb_round.getComponent(Label).color = PublicConfig.themeColor.clone();
    }

    async setData(datas: RoundDetailInfo, listDatas: RecordDetailInfo) {
        this.detailInfo = datas;
        this.recordInfo = listDatas;
        let data = this.detailInfo, listData = this.recordInfo;
        // await this.loadAsset();
        let labs: { [key: string]: Label } = {};
        CocosUtil.traverseNodes(this.node, this.m_ui)
        this.changeNodesColor();
        CocosUtil.traverseLabels(this.node, labs)

        this.m_ui.label_bet.getComponent(Label).string = l10n.t("shared_record_bet") + `(${MoneyUtil.currencySymbol()})`;
        this.m_ui.label_profit.getComponent(Label).string = l10n.t("shared_record_win") + `(${MoneyUtil.currencySymbol()})`;
        this.m_ui.label_balance.getComponent(Label).string = l10n.t("shared_record_balance") + `(${MoneyUtil.currencySymbol()})`;

        labs.lb_order_no.string = StringUtil.lineStr(data.round_no) || ""; // 交易单号
        labs.lb_bet_num.string = (data.bet && MoneyUtil.rmbStr(data.bet)) || "0.00"; //投注
        labs.lb_profit_num.string = MoneyUtil.rmbStr(data.player_win_lose);
        labs.lb_balance_num.string = (data.balance && MoneyUtil.rmbStr(data.balance)) || "0.00"; //余额
        labs.lb_betvalue.string = l10n.t("shared_setting_bet_base") + " " + ((data.bet_size && MoneyUtil.rmbStr(data.bet_size)) || "0.00"); //投注大小
        labs.lb_betrate.string = l10n.t("shared_setting_bet_multiple") + " " + (data.bet_multiple || "0.00"); //投注倍数
        if (data.round == 1 && !(data.prize_list?.length)) {
            labs.lb_round.string = ``;
            this.m_ui.db_3.active = false;
        } else {
            if (l10n.currentLanguage == "zh-Hans-CN") {
                labs.lb_round.string = l10n.t("shared_round_count").replace("%{1}", data.round.toString());
            } else {
                labs.lb_round.string = l10n.t("shared_round_count").replace("%{1}", data.round.toString()) + "/" + listData.round_list.length;
            }

            this.m_ui.db_3.active = true;
        }
        this.ndIsAward.active = !data.prize_list || data.prize_list.length == 0;
        this.m_ui.mulLabel.getComponent(Label).string = l10n.t("shared_record_reward_multiple") + " x" + data.multi_time.toString();

        let isFree = listData.free_total_times != listData.free_remain_times;

        let list = [[], [], [], [], [], []];
        data.item_type_list.forEach((num, idx) => {
            list[Math.floor(idx / (GameConst.MaxRow - 1))][idx % (GameConst.MaxRow - 1)] = num;
        })
        let newList = [];
        list.forEach((item, idx) => {
            item.push(13);
            item.reverse();
            newList[idx] = GameCtrl.getIns().getModel().elementChangeClient(item);
        })
        let axis: RollAxisCom[] = [];
        let eles: ElementCom[] = [];
        for (let col = 0; col < newList.length; col++) {
            axis[col] = new RollAxisCom(this.m_ui.elements.getComponent(ElementCtrl), this.m_ui.elements);
            let elementDatas = newList[col];
            axis[col].init(col, this.node)
            for (let row = 0; row < elementDatas.length; row++) {
                const data = elementDatas[row]
                let el = axis[col].pushElement(data, false, 0.7)
                el.node.setScale(0.7, 0.7, 0.7);
                el.updateIcon(false)
                eles.push(el);
            }
        }
        this.resetPosIdx(axis);

        let mulList = this.getMulList();
        this.showMul(mulList, mulList.indexOf(data.multi_time));

        let hasWin = !(!data.prize_list || data.prize_list.length == 0);
        this.m_ui.black_mask.active = hasWin;
        if (hasWin) {
            data.prize_list.forEach((msg, idx) => {
                let iconSp = null;
                eles.forEach((ele) => {
                    let has = msg.win_pos_list.indexOf(ele.serverIdx) > -1;
                    if (has) {
                        ele.node.parent = this.m_ui.elements_top;

                        if (ele.changeId() != TItemtype.ITEM_TYPE_WILD) {
                            ele.node.getChildByName("di").getComponent(Sprite).spriteFrame = this.winSpriteFrame[ele.count - 1];
                            ele.node.getChildByName("di").setScale(1.26, 1.26, 1.26);
                        }

                        !iconSp && ele.icons.children.forEach((node, cId) => {
                            if (node.active) {
                                for (let i = 0; i < node.children.length; i++) {
                                    let child = node.children[i];
                                    if (child.active) {
                                        iconSp = child.getChildByName("sp").getComponent(Sprite).spriteFrame;
                                        break;
                                    }
                                }
                            }
                        });
                    }
                })

                let { t, node } = this.createAwardLine();
                t.icon.getComponent(Sprite).spriteFrame = iconSp;
                t.lb_ways.getComponent(Label).string = l10n.t("shared_record_win_line_n").replace("%{1}", msg.count.toString());
                t.lb_num.getComponent(Label).string = l10n.t("shared_record_win_line_" + msg.level);
                let win = new BigNumber(data.bet_size).multipliedBy(data.bet_multiple).multipliedBy(msg.rate).multipliedBy(msg.count);
                t.lb_gain.getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(win.multipliedBy(data.multi_time).toNumber());
                t.lb_mul.getComponent(Label).string = MoneyUtil.currencySymbol() + MoneyUtil.rmbStr(win.toNumber()) + " x " + data.multi_time;
                t.lb_free_mul.active = false;
                t.lb_free_num.active = false;

                let datas = [];
                datas.push(data.bet_size_s);
                datas.push(data.bet_multiple);
                datas.push(msg.rate);
                datas.push(msg.count);
                datas.push(data.multi_time);
                let tmpdata = {
                    dataArr: datas,
                    item: node,
                }
                node.getComponent(CompDissItem).init(this.m_ui.kong)
                node.getComponent(CompDissItem).setData(tmpdata)
            });
        } else {
            let scNum = this.checkScatterNum(data.item_type_list);
            if (scNum > 3) {
                let n = (scNum - 4) * 2 + 15;
                let { t, node } = this.createAwardLine();
                t.iconDi.getComponent(Sprite).spriteFrame = this.scatterFrame[0];
                t.icon.getComponent(Sprite).spriteFrame = this.scatterFrame[1];
                t.lb_ways.active = false;
                t.lb_num.active = false;
                t.lb_gain.active = false;
                t.lb_mul.active = false;
                t.lb_free_mul.active = true;
                t.lb_free_num.active = true;
                t.lb_free_mul.getComponent(Label).string = "x " + scNum;
                if (isFree) {
                    t.lb_free_num.getComponent(Label).string = "+" + l10n.t("shared_record_free_bonus_n").replace("%{1}", n.toString());
                } else {
                    t.lb_free_num.getComponent(Label).string = l10n.t("shared_record_free_bonus_n").replace("%{1}", n.toString());
                }
            }
        }


        this.leftRightMoveEvent();
    }

    getMulList() {
        let min = this.recordInfo.result.round_list[0].multi_time;
        let mul = Math.round(min / GameCtrl.getIns().getModel().multipleList[0])
        let list = [];
        GameCtrl.getIns().getModel().multipleList.forEach((item) => {
            list.push(item * mul);
        })
        return list;
    }

    showMul(mulList: number[], idx: number) {
        this.m_ui.multipleList.children.forEach((element, index) => {
            element.getComponent(Label).string = "x" + mulList[index];
            if (idx == index) {
                element.getComponent(Label).color = new Color(255, 255, 255, 255);
            }
        });
    }

    resetPosIdx(rollAxisList: RollAxisCom[]) {
        let posIdx = 0;
        for (let i = 0; i < rollAxisList.length; i++) {
            let list = rollAxisList[i];
            for (let j = list.elementList.length - 1; j >= 0; j--) {
                let item = list.elementList[j];
                if (j == 0) {
                    item.posIdx = -1;
                } else {
                    item.posIdx = posIdx;
                    posIdx += item.count;
                }
            }
        }
    }

    loadAsset() {
        return new Promise<void>((resolve, reject) => {
            let count = 0, total = 4;
            let checkEnd = () => {
                count++;
                if (count == total) {
                    resolve();
                }
            }
            assetManager.loadBundle("game", (err, bundle) => {
                if (err) return error(err);
                bundle.load("prefabs/gameItem/GameItem", Prefab, (err, prefab) => {
                    if (err) return error(err);
                    this.itemPre = prefab;
                    checkEnd();
                })
                bundle.load("textures/main/normal/s_scatter_frame_a/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                    if (err) return error(err);
                    this.scatterFrame[0] = spriteFrame;
                    checkEnd();
                })
                bundle.load("textures/main/normal/s_scatter_a/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                    if (err) return error(err);
                    this.scatterFrame[1] = spriteFrame;
                    checkEnd();
                })
                bundle.load("font/multipleNum", Font, (err, font) => {
                    if (err) return error(err);
                    this.multipleNode.children.forEach((child) => {
                        child.getComponent(Label).font = font;
                    })
                    checkEnd();
                })
            })
        })
    }

    // async setData(data: RoundDetailInfo, listData: RecordDetailInfo) {
    //     this.detailInfo = data;
    //     this.recordInfo = listData;
    // }

    createAwardLine() {
        let node = instantiate(this.prfAwardLine);
        let t: { [key: string]: Node; } = {};
        CocosUtil.traverseNodes(node, t);
        this.ndAwardLineParent.addChild(node);
        return { t, node };
    }

    checkScatterNum(arr: number[]) {
        let scCount = 0;
        for (let i = 0; i < arr.length; i++) {
            let ele = arr[i];
            if (ele == TItemtype.ITEM_TYPE_SCATTER) {
                scCount++;
            }
        }
        return scCount;
    }

    setOpacity(curIdx: number, multiples: Node[]) {
        multiples.forEach((node, idx) => {
            if (curIdx == idx) {
                node.getComponent(UIOpacity).opacity = 255;
            } else {
                node.getComponent(UIOpacity).opacity = 122;
            }
        });
    }
}


