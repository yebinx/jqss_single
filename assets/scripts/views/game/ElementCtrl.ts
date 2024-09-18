import { _decorator, Component, error, log, Node, Tween, tween, UIOpacity, warn } from 'cc';
import { RollAxisCom, RollState } from './RollAxisCom';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import { ElementLayer } from './ElementLayer';
import { BaseComp } from '../../kernel/compat/view/BaseComp';
import GameConst, { GameState, TItemtype } from '../../define/GameConst';
import { ObjPoolCom } from './ObjPoolCom';
import MathUtil from '../../kernel/core/utils/MathUtil';
import GameAudio from '../../mgrs/GameAudio';
import { ElementCom } from './ElementCom';
import GameCtrl from '../../ctrls/GameCtrl';
import { ClientElement } from '../../models/GameModel';
import CocosUtil from '../../kernel/compat/CocosUtil';
import { sp } from 'cc';
import { UITransform } from 'cc';
import { Pool } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ElementCtrl')
export class ElementCtrl extends BaseComp {

    rollCnt: number = 0;
    /*列滚动轴 */
    rollAxisList: RollAxisCom[] = []
    @property(Node)
    effectNode: Node = null;
    @property(Node)
    toptNode: Node = null;
    @property(Node)
    respinNodeList: Node[] = [];
    @property(UIOpacity)
    maskNodeList: UIOpacity[] = [];

    randomElementIdList: number[] = []

    resultData: number[][] = null;

    mulAnimEnd: boolean = false;

    /**听牌效果  */
    isDrawsEffect: boolean = false;
    /**开始听牌的idx */
    startDrawsIdx: number = Infinity;
    /**开始滚动的轴的数量 */
    startRollCount: number = 0;
    /**可以停止 */
    canStop: boolean = false;
    /**可以自然停止 */
    canNatureStop: boolean = false;
    /**进个数 */
    freeLimit: number = 4;

    poolMap: Map<string, Pool<Node>> = new Map();

    start() {
        this.initNetEvent()
    }

    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_end, this.onAxisRollEnd, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_frist_move_lowest, this.onFristElementMoveLowest, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_top_full_move_scene, this.onTopElementMoveScene, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_move_ele, this.onDeleteSpecified, this);

    }

    init(elementList: Array<Array<number>>, ishis: boolean = false) {
        CocosUtil.traverseNodes(this.node, this.m_ui);
        ishis == false && this.restRandomElementList()
        for (let col = 0; col < elementList.length; col++) {
            this.rollAxisList[col] = new RollAxisCom(this, this.m_ui.ItemContainerBottom);
            let elementDatas = GameCtrl.getIns().getModel().elementChangeClient(elementList[col]);
            this.rollAxisList[col].init(col, this.getComponent(ElementLayer).node)
            for (let row = 0; row < elementDatas.length; row++) {
                const data = elementDatas[row]
                let el: ElementCom = null;
                if (ishis) {
                    el = this.rollAxisList[col].pushElement(data, false, 0.7)
                    el.node.setScale(0.7, 0.7, 0.7);
                    el.updateIcon(false)
                } else {
                    el = this.rollAxisList[col].pushElement(data)
                    el.addClickEvent();
                    el.updateIcon(false, true)
                }

                el.isRollEnd = true;
            }
        }
        this.resetPosIdx();
        ishis == false && this.elementsSort(this.m_ui.ItemContainerBottom);
    }

    sortAll() {
        this.elementsSort(this.m_ui.ItemContainerTop);
        this.elementsSort(this.m_ui.ItemContainerBottom);
        this.elementsSort(this.m_ui.ItemContainerTopEffect);
    }

    elementsSort(node?: Node) {
        if (!node) {
            node = this.m_ui.ItemContainerBottom;
        }
        let arr: { node: Node, idx: number }[] = [];
        let temp = [];
        // let childrens = node.children.filter((item) => {
        //     return !!item.getComponent(ElementCom);
        // })
        let childrens = node.children.slice(0);
        let h = node.getComponent(UITransform).contentSize.height;
        childrens.sort((a, b) => {
            let com1 = a.getComponent(ElementCom);
            let com2 = b.getComponent(ElementCom);
            let id1 = com1.changeId();
            let id2 = com2.changeId();
            let score1 = 0, score2 = 0;
            if (id1 == TItemtype.ITEM_TYPE_WILD) {
                score1 = 100000;
            } else if (id1 == TItemtype.ITEM_TYPE_SCATTER) {
                score1 = 10000;
            } else {
                score1 = 1000;
            }
            // score1 += com1.count * 1000;
            if (id2 == TItemtype.ITEM_TYPE_WILD) {
                score2 = 100000;
            } else if (id2 == TItemtype.ITEM_TYPE_SCATTER) {
                score2 = 10000;
            } else {
                score2 = 1000;
            }
            // score2 += com2.count * 1000;
            score1 += (h - com1.node.position.y);
            score2 += (h - com2.node.position.y);
            return score1 - score2;
        });
        childrens.forEach((node, idx) => {
            arr.push({ node, idx });
            temp.push({ id: node.getComponent(ElementCom).changeId(), idx })
        });
        this.scheduleOnce(() => {
            arr.forEach((obj) => {
                obj.node.setSiblingIndex(obj.idx);
            });
        })
    }

    /**开始转动 */
    startRoll(isFast) {
        this.isDrawsEffect = false;
        this.canNatureStop = false;
        this.canStop = false;
        this.mulAnimEnd = false;
        this.startRollCount = 0;

        this.rollCnt = 0;
        for (let index = 0; index < this.rollAxisList.length; index++) {
            this.rollCnt++;
            const element = this.rollAxisList[index];
            if (isFast) {
                element.startRoll()
            } else {
                this.scheduleOnce(() => {
                    element.startRoll()
                }, index * 0.1)
            }
        }
    }

    /**检测是否需要急停 */
    checkIsNeedStop(mulAnimEnd?: boolean) {
        if (mulAnimEnd) {
            this.mulAnimEnd = mulAnimEnd;
        } else {
            this.startRollCount++;
        }
        // log("检测是否需要急停", this.resultData, this.mulAnimEnd, this.startRollCount)
        if (this.startRollCount == this.rollAxisList.length && this.mulAnimEnd) {
            if ((GameCtrl.getIns().curFast || GameCtrl.getIns().curQuickFast) && this.resultData) {
                // warn("需要急停", GameCtrl.getIns().curFast, GameCtrl.getIns().curQuickFast)
                EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.start_stop_roll)
                this.rollAxisList.forEach((element, index) => {
                    element.isDraws = false;
                    element.startStopRoll()
                });
            } else {
                this.canStop = true;
                if (this.canNatureStop) {
                    this.canNatureStop = false;
                    this.stopRoll();
                }
            }
        } else {
            this.canStop = false;
        }
        log("可不可以停止", this.canStop, "自然停", this.canNatureStop);
    }

    /**是否听牌 */
    isDraws(data: Array<Array<number>>) {
        this.resultData = data;
        warn("是否听牌", JSON.stringify(data), GameCtrl.getIns().curFast, GameCtrl.getIns().curQuickFast);
        let count = 0, idx = Infinity;
        if (GameCtrl.getIns().curFast || GameCtrl.getIns().curQuickFast) {
            return this.startDrawsIdx = idx;
        }
        for (let i = 0; i < data.length; i++) {
            let list = data[i].slice(1);
            for (let j = 0; j < list.length; j++) {
                let ele = list[j];
                if (ele == TItemtype.ITEM_TYPE_SCATTER) {
                    count++;
                }
            }
            if (count >= this.freeLimit - 1 && i != data.length - 1) {
                idx = i + 1;
                this.isDrawsEffect = true;
                return this.startDrawsIdx = idx;
            }
        }
        return this.startDrawsIdx = idx;
    }

    /**设置听牌 */
    setAxisDraws() {
        for (let i = 0; i < this.rollAxisList.length; i++) {
            let ele = this.rollAxisList[i];
            ele.isDraws = ele.idx >= this.startDrawsIdx;
            ele.stopData = this.resultData[i];
            warn("设置停止数据", ele.stopData, ele.isDraws)
        }
    }

    /**停止转动 */
    stopRoll() {
        let isFast = GameCtrl.getIns().curFast || GameCtrl.getIns().curQuickFast;
        if (GameCtrl.getIns().getModel().isShowLongJuan) {
            return;
        }
        warn("停止转动", this.canStop, this.resultData, isFast);
        if (this.canStop && this.resultData) {
            EventCenter.getInstance().fire(GameEvent.update_game_state, GameState.start_stop_roll)
            for (let index = 0; index < this.rollAxisList.length; index++) {
                let element = this.rollAxisList[index];
                let i = index;
                if (isFast) {
                    element.isDraws = false;
                    element.startStopRoll();
                } else {
                    this.scheduleOnce(() => {
                        !element.isDraws && element.startStopRoll();
                    }, i * 0.3)
                }
            }
        } else {
            if (isFast) {
                for (let index = 0; index < this.rollAxisList.length; index++) {
                    let element = this.rollAxisList[index];
                    element.isDraws = false;
                }
            }
            if (this.resultData) {
                this.canNatureStop = true;
            }
        }
    }

    onAxisRollEnd(idx: number) {
        log("onAxisRollEnd", idx);
        this.rollCnt--;
        if (idx + 1 < this.rollAxisList.length) {
            let nextIdx = idx + 1;
            let next = this.rollAxisList[nextIdx];
            if (next.isDraws) {
                for (let i = 0; i < this.rollAxisList.length; i++) {
                    EventCenter.getInstance().fire(GameEvent.chang_black_mask, i != nextIdx, i);
                }
                this.respinNodeList[idx].active = false;
                let node = this.respinNodeList[nextIdx];
                CocosUtil.playSpineAnim(node, "reel_ting", false, () => {
                    CocosUtil.playSpineAnim(node, "reel_ting2", true);
                })
                next.draws();
                let scNum = 0;
                this.rollAxisList.forEach((axis, idx) => {
                    if (idx <= idx) {
                        axis.elementList.forEach((item) => {
                            if (item.id == TItemtype.ITEM_TYPE_SCATTER) {
                                scNum++;
                            }
                        })
                    }
                });
                EventCenter.getInstance().fire(GameEvent.game_show_top_ting, scNum >= this.freeLimit);
            } else {
                this.respinNodeList[idx].active = false;
            }
            this.highIconToTop(idx);
        } else {
        }
        if (this.rollCnt <= 0) {
            this.respinNodeList[idx].getComponent(sp.Skeleton).setCompleteListener(null);
            this.respinNodeList[idx].active = false;
            EventCenter.getInstance().fire(GameEvent.chang_black_mask, false);
            this.recoverDrawsEffect();
            EventCenter.getInstance().fire(GameEvent.game_roll_complete)
        }
    }

    resetPosIdx() {
        let posIdx = 0;
        for (let i = 0; i < this.rollAxisList.length; i++) {
            let list = this.rollAxisList[i];
            for (let j = list.elementList.length - 1; j >= 0; j--) {
                let item = list.elementList[j];
                if (j == 0) {
                    item.posIdx = -1;
                } else {
                    item.posIdx = posIdx;
                    posIdx += item.count;

                    item.showServerId()
                }
            }
        }
    }

    /**将高分图片移至上层 */
    highIconToTop(idx: number) {
        if (this.isDrawsEffect) {
            this.rollAxisList[idx].elementList.forEach((child) => {
                let id = child.changeId();
                if (id == TItemtype.ITEM_TYPE_SCATTER) {
                    child.toTopNode();
                    child.playDraws();
                }
            });
        }
    }

    /**恢复听牌效果 */
    recoverDrawsEffect() {
        if (this.isDrawsEffect) {
            this.rollAxisList.forEach((axis) => {
                axis.elementList.forEach((child) => {
                    child.playDrawsEnd();
                });
            });
        }
    }

    getElementNode(col: number, row: number) {
        let axis = this.rollAxisList[col];
        if (axis) {
            return axis.elementList[row];
        }
    }

    onFristElementMoveLowest(col: number) {
        let axis = this.rollAxisList[col];
        if (axis) {
            let element = axis.removeFrist()
            if (element) {
                element.node.off(Node.EventType.TOUCH_START);
                ObjPoolCom.objPoolMgr.delElement(element.node);
            }
        }
    }

    onDeleteSpecified(col: number, ele?: ElementCom) {
        let axis = this.rollAxisList[col];
        if (axis) {
            axis.removeSpecified(ele);
            if (ele) {
                ele.node.off(Node.EventType.TOUCH_START);
                ObjPoolCom.objPoolMgr.delElement(ele.node);
            }
        }
    }

    restRandomElementList() {
        this.randomElementIdList = GameConst.ElementList.slice(1);
    }

    onTopElementMoveScene(idx: number) {
        let max = MathUtil.getRandomInt(1, GameConst.MergeMax);
        let repeat = false;
        for (let i = 0; i < this.rollAxisList.length; i++) {
            let axis = this.rollAxisList[i];
            if (axis.state != RollState.start) {
                continue;
            } else if (axis.isDraws && i != idx) {
                continue;
            }
            let tempMax = max;
            let last: ElementCom = null;
            while (tempMax > 0) {
                let count = MathUtil.getRandomInt(1, tempMax);
                let id = GameConst.ElementList[MathUtil.getRandomInt(0, GameConst.ElementList.length - 1)];
                let element = axis.pushElement(new ClientElement(id, count, -1));
                element.updateIcon(true);
                last = element;
                tempMax -= count;
            }
            if (!last || last.node.position.y + axis.itemSize.height * last.count / 2 <= axis.node.getComponent(UITransform).contentSize.height) {
                repeat = true;
            }
        }

        if (repeat) {
            this.onTopElementMoveScene(idx);
        }
    }

    protected update(dt: number): void {
        if (dt > 0.04) {
            dt = 0.04;
        }
        this.rollAxisList.forEach((axis) => {
            axis.update(dt)
        })
    }
}


