import { Component, Node, Size, UITransform, v3, _decorator, tween, Tween, warn, Vec3, easing, log, error, size } from "cc";
import { ElementCom } from "./ElementCom";
import { ObjPoolCom } from "./ObjPoolCom";
import MathUtil from "../../kernel/core/utils/MathUtil";
import GameModel, { ClientElement } from "../../models/GameModel";
import CocosUtil from "../../kernel/compat/CocosUtil";
import EventCenter from "../../kernel/core/event/EventCenter";
import GameEvent from "../../event/GameEvent";
import GameConst, { TItemtype } from "../../define/GameConst";
import GameCtrl from "../../ctrls/GameCtrl";
import GameAudio from "../../mgrs/GameAudio";
import { ElementCtrl } from "./ElementCtrl";
import { AudioManager } from "../../kernel/compat/audio/AudioManager";

const { ccclass, property } = _decorator;

export enum RollState {
    start,
    start_stop,//准备停止
    stop,//完全停止
}

export class RollAxisCom {

    /**编号 */
    idx: number = -1;

    rollInitSpeed: number = -3600;
    // rollInitSpeed: number = -600;

    rollSpeed: number = this.rollInitSpeed;//滚动速度

    rollMinSpeed: number = -600;

    elementList: ElementCom[] = [];

    _tempElementList: Node[] = [];

    state: RollState;

    initY: number = -122;

    itemSize: Size = size(122, 122);

    parent: Node;//顶级父容器 用于坐标装换

    initPos: Vec3[] = [];

    stopData: number[] = [];

    isDraws: boolean = false;

    isDrawsing: boolean = false;

    elementCtrl: ElementCtrl = null;

    node: Node = null;

    rowInterval: number = 121.66666666666667;

    tempNode: Node = new Node();

    fallDownData: ClientElement[] = [];

    constructor(ctrl: ElementCtrl, bindNode: Node) {
        this.elementCtrl = ctrl;
        this.node = bindNode;
        this.elementCtrl.node.addChild(this.tempNode);
    }

    /**掉落回调 */
    fallCb: () => void = null;

    init(idx: number, parent: Node) {
        this.idx = idx;
        this.parent = parent
        this.state = RollState.stop
    }

    pushElement(msg: ClientElement, isTop?: boolean, scale: number = 1) {
        let y = this.initY * scale;
        let lastElement = this.elementList[this.elementList.length - 1];
        if (lastElement) {
            y = lastElement.node.position.y + this.itemSize.height * scale * lastElement.count / 2;
        }

        if (isTop) {
            let t = (GameConst.MaxRow - 1) * this.itemSize.height + msg.count * this.itemSize.height * scale / 2;
            if (y < t) {
                y = t;
            }
        }

        let element = ObjPoolCom.objPoolMgr.createElement();
        let com = element.getComponent(ElementCom)
        com.init(msg.id, msg.count, this)
        element.position = v3(this.rowInterval * (this.idx + 0.5) * scale, y + this.itemSize.height * scale * msg.count / 2, 0)
        this.node.addChild(element);
        this.elementList.push(com)
        return com
    }

    draws() {
        let num = 1;
        if (this.idx <= 2) {
            num = 1
        } else {
            num = this.idx - 2
        }
        GameAudio.scatterEffect(num);
        this.isDrawsing = true;
        let duration = 3000;
        let now = new Date().getTime();
        tween(this.tempNode).call(() => {
            let t = new Date().getTime() - now;
            let b = 1 - t / duration;
            if (b <= 0) {
                b = 0;
                Tween.stopAllByTarget(this.tempNode);
                this.startStopRoll();
                this.elementList.forEach((ele) => {
                    ele.updateIcon(false);
                })
            }
            this.rollSpeed = this.rollMinSpeed + (this.rollInitSpeed - this.rollMinSpeed) * b;
        }).delay(0.001).union().repeatForever().start();
    }

    /**开始转动 */
    startRoll() {
        this.rollSpeed = this.rollInitSpeed;
        this.isDrawsing = false;

        warn("开始滚动", this.idx, this.rollSpeed);
        let count = 0, len = this.elementList.length;
        let targetY = this.initY + 40;
        this.elementList.forEach((child) => {
            tween(child.node)
                .by(0.1, { position: v3(0, 40, 0) })
                .call(() => {
                    count++;
                    if (count == len) {
                        log("开始滚动end", this.idx)
                        for (let i = 0; i < this.elementList.length; i++) {
                            let ele = this.elementList[i];
                            ele.moved = false;
                            ele.locked = false;
                            ele.isRollEnd = false;
                            let half = ele.count * this.itemSize.height / 2;
                            targetY += half;
                            ele.node.setPosition(ele.node.position.x, targetY, ele.node.position.z);
                            targetY += half;
                        }
                        this.state = RollState.start;
                        this.elementCtrl.checkIsNeedStop();
                    }
                })
                .start();
        });
    }

    /**检测是否需要往上补充元素 */
    checkNeedAddElement() {
        let last = this.elementList[this.elementList.length - 1];
        if (!last || last.node.position.y + this.itemSize.height * last.count / 2 <= this.node.getComponent(UITransform).contentSize.height) {
            EventCenter.getInstance().fire(GameEvent.game_axis_roll_top_full_move_scene, this.idx);
        }
    }

    /**开始停止 */
    startStopRoll() {
        if (this.state != RollState.start || !this.stopData || this.stopData.length == 0) {
            return;
        }
        // warn("开始停止", this.idx, this.stopData, RollState[this.state]);
        let datas = GameCtrl.getIns().getModel().elementChangeClient(this.stopData);
        Tween.stopAllByTarget(this.tempNode)
        let targetY = this.initY;
        for (let i = 0; i < datas.length; i++) {
            let item = datas[i];
            let half = item.count * this.itemSize.height / 2;
            targetY += half;
            let els = this.pushElement(item)
            els.addClickEvent();
            els.targetPos = v3(els.node.position.x, targetY, els.node.position.z);
            els.locked = true;
            els.posIdx = item.rowIdx > -1 ? this.idx * (GameConst.MaxRow - 1) + item.rowIdx : item.rowIdx;
            els.updateIcon(false)
            targetY += half;
        }
        this.state = RollState.start_stop;
        if (GameCtrl.getIns().curFast || GameCtrl.getIns().curQuickFast) {
            this.openMulSpeed(10);
        }
    }

    checkEnd() {
        if (this.state == RollState.stop) {
            return;
        }
        let count = 0, total = 0;
        this.elementList.forEach((ele) => {
            if (ele.isRollEnd) {
                count++;
            }
            if (ele.targetPos) {
                total++;
            }
            if (count == total) {
                this.state = RollState.stop;
                this.onRollEnd();
            }
        });
    }

    /**转动 */
    roll(dt: number) {
        let speed = this.rollSpeed * dt;
        let temp = this.elementList.slice(0);
        for (let i = 0; i < temp.length; i++) {
            let ele = temp[i];
            ele.roll(speed, this.idx)
        }

        if (GameCtrl.getIns().curQuickFast ) {
            if (this.isDraws) {
                AudioManager.inst.stopMusic();
                Tween.stopAllByTarget(this.tempNode);
                this.elementCtrl.rollAxisList.forEach((axis) => {
                    if (axis.isDraws) {
                        axis.isDraws = false;
                        axis.startStopRoll();
                        this.openMulSpeed(10);
                    }
                });
            } else {
                if (this.elementCtrl.canStop) {
                    if (this.stopData) {
                        this.startStopRoll();
                    }
                    this.openMulSpeed(10);
                }
            }
        }
        this.checkNeedAddElement();
    }

    openMulSpeed(mul: number) {
        this.rollSpeed = mul * this.rollInitSpeed;
    }

    startFallDown(data: ClientElement[], cb: () => void, isDelay: boolean, onlyDropped: boolean = false, isTing: boolean) {

        if ((!data || data.length == 0) && !onlyDropped) {
            cb();
            return;
        }
        warn("startFallDown", JSON.stringify(data), isDelay, onlyDropped, isTing);
        this.fallDownData = data;
        // let datas = GameCtrl.getIns().getModel().elementChangeClient(data);
        this.elementList.forEach((ele) => {
            ele.moved = false;
        });
        this.fallCb = () => {
            if (isTing) {
                GameAudio.tingNormalIconDown()
            } else {
                GameAudio.normalRollStop()
            }
            cb();
        }
        this.fallDown(onlyDropped);
        this.fillingEle(data, cb, isDelay);
    }

    getFallDownPos() {
        let posY = this.initY;
        let targetPosArr: Vec3[] = [];
        for (let i = 0; i < this.elementList.length; i++) {
            let ele = this.elementList[i];
            let half = this.itemSize.height * ele.count / 2;
            posY += half;
            targetPosArr.push(v3(this.rowInterval * (this.idx + 0.5), posY, 0));
            posY += half;
        }
        return targetPosArr;
    }

    /**掉落动画 */
    fallDown(isLastTime: boolean) {
        let count = 0, noMove = 0;
        let arr = this.elementList;
        let len = arr.length, targetArr = this.getFallDownPos();
        arr.forEach((ele, idx) => {
            let targetPos = targetArr[idx];
            if (targetPos.y != ele.node.position.y && !ele.moved) {
                // let interval = Math.abs(Math.round((targetPos.y - ele.node.position.y) / ele.getSize().height));
                // warn("元素掉落", targetPos.y, ele.node.position.y, GameConst.fallDownTime * interval);
                ele.moved = true;
                Tween.stopAllByTarget(ele.node);
                tween(ele.node).to(0.01 * idx + 0.3, { position: v3(targetPos.x, targetPos.y, targetPos.z) }, { easing: easing.backIn })
                    .by(0.1, { position: v3(0, 10, 0) }).by(0.1, { position: v3(0, -10, 0) })
                    .call(() => {
                        ele.node.setPosition(targetPos.x, targetPos.y, targetPos.z);
                        ele.showScatterAnim(0);
                        count++;
                        if (isLastTime && count + noMove == len) {
                            warn("掉落完回调", count)
                            isLastTime && this.fallCb && this.fallCb();
                        }
                    })
                    .start();
            } else {
                noMove++
                if (isLastTime && noMove + count == len) {
                    warn("noMove回调", noMove)
                    isLastTime && this.fallCb && this.fallCb();
                }
            }
        });
    }

    /**填充数据 */
    fillingEle(data: ClientElement[], cb: () => void, isDelay: boolean) {
        if (data?.length > 0) {
            warn("填充数据", JSON.stringify(data), this.idx);
            let tw = tween(this.tempNode);
            isDelay && tw.delay(GameConst.fallDownTime);
            tw.call(() => {
                let ele = this.pushElement(data.pop(), true);
                ele.addClickEvent();
                ele.updateIcon(false);
                ele.moved = false;
                ele.isRollEnd = true;
                this.elementCtrl.sortAll();
                this.fillingEle(data, cb, isDelay);
                this.fallDown(data.length == 0);
            })
                .start();
        }
    }

    removeFrist() {
        return this.elementList.shift()
    }

    removeSpecified(ele: ElementCom) {
        let idx = this.elementList.indexOf(ele);
        if (idx > -1) {
            warn("删除图标", ele.id);
            return this.elementList.splice(idx, 1)[0];
        } else {
            return ele;
        }
    }

    changeRollState(state: RollState) {
        this.state = state;
    }

    onRollEnd() {
        // log("onRollEnd", this.idx);
        // GameAudio.normalRollStop();
        EventCenter.getInstance().fire(GameEvent.game_axis_ready_roll_end, this.idx)
        let count = 0, total = 0;
        this.isDraws = false;
        this.elementList.forEach((child) => {
            if (child.targetPos) {
                let node = child.node;
                let targetPos = child.targetPos;
                total++;
                let twe = tween(node)
                if (!GameCtrl.getIns().curFast && !GameCtrl.getIns().curQuickFast) {
                    twe.by(0.1, { position: v3(0, 10, 0) })
                        .by(0.1, { position: v3(0, -10, 0) })
                }
                twe.call(() => {
                    node.setPosition(targetPos.x, targetPos.y, targetPos.z);
                    count++;
                    child.locked = false;
                    child.moved = false;
                    child.targetPos = null;
                    child.moved = false;

                    if (count == total) {
                        EventCenter.getInstance().fire(GameEvent.game_axis_roll_end, this.idx)
                    }
                }).start();
            }
        })
        this.stopData = null;
    }

    update(dt: number): void {
        // dt = Number(dt.toFixed(4))
        switch (this.state) {
            case RollState.start:
                this.roll(dt)
                break;
            case RollState.start_stop:
                this.roll(dt)
                break;
            case RollState.stop:
                break;
        }
    }
}



