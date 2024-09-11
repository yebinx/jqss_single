import { _decorator, Component, EventMouse, EventTouch, log, Node, tween, Tween, UITransform, v3 } from 'cc';
import { BaseComp } from '../../../scripts/kernel/compat/view/BaseComp';
import CHandler from '../../../scripts/kernel/core/datastruct/CHandler';
import TimerManager from '../../../scripts/kernel/compat/timer/TimerManager';
import MathUtil from '../../../scripts/kernel/core/utils/MathUtil';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';


const { ccclass, property } = _decorator;

@ccclass('CompBetScroll')
export class CompBetScroll extends BaseComp {
    curMidIndex: number = -1;
    private curMidNode: Node = null;
    private _touchCb: CHandler = null;
    private _tmrMouse: number = 0;

    content: Node;

    clickItemIdx: number = 0;

    wheelMove: () => void = null;
    wheelEnd: () => void = null;

    start() {
        this.content = this.node.children[0]
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.fixPos();
    }

    onMouseWheel(event: EventMouse) {
        let dy = event.getScrollY();
        if (dy > 0) {
            this.addConentY(-15);
        } else {
            this.addConentY(15);
        }
        this.wheelMove && this.wheelMove();
        this._tmrMouse = TimerManager.delTimer(this._tmrMouse);
        this._tmrMouse = TimerManager.delaySecond(0.4, new CHandler(this, this.onWheelEnd));
    }

    private onWheelEnd() {
        this.wheelEnd && this.wheelEnd();
        this.fixPos(true, () => {
            if (this._touchCb) {
                this._touchCb.invokeWithExtra(this.curMidIndex, this.curMidNode);
            }
        });
    }

    addConentY(dy: number) {
        let content = this.node.children[0];
        let pos = content.position;
        let itemHei = content.children[0].getComponent(UITransform).contentSize.height;
        let minY = -itemHei;
        let maxY = itemHei * (content.children.length - 4);
        let y = MathUtil.limitNum(pos.y + dy, minY, maxY);
        content.setPosition(pos.x, y, pos.z);
    }

    private onTouchStart(event: EventTouch) {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BET_SCROLL_START, this.node)
        let childs = this.content.children;
        this.clickItemIdx = 0;
        if (childs.length == 0) {
            return;
        }
        let itemSize = childs[0].getComponent(UITransform).contentSize;
        let pos = v3(event.touch.getUILocationX(), event.touch.getUILocationY(), 0)
        let clickPos = this.content.getComponent(UITransform).convertToNodeSpaceAR(pos);
        for (var index = 0; index < childs.length - 1; index++) {
            const element = childs[index];
            if (clickPos.y >= element.position.y - itemSize.height / 2 && clickPos.y < element.position.y + itemSize.height / 2) {
                break;
            }
        }
        if (index != 0 && index != childs.length - 1) {
            this.clickItemIdx = index;
        }
    }

    private onTouchMove(event: EventTouch) {
        let length = Math.abs(event.getDeltaY())
        if (length > 1) {
            this.clickItemIdx = 0;
        }
        this.addConentY(event.getDeltaY());
    }

    private onTouchEnd(event: EventTouch) {
        log("x", this.clickItemIdx)
        if (this.clickItemIdx > 0) {
            this.scrollToIndex(this.clickItemIdx, true, () => {
                this.fixPos();
                if (this._touchCb) {
                    this._touchCb.invokeWithExtra(this.curMidIndex, this.curMidNode);
                }
                EventCenter.getInstance().fire(PUBLIC_EVENTS.BET_SCROLL_END, this.node)
            })
        } else {
            this.fixPos();
            if (this._touchCb) {
                this._touchCb.invokeWithExtra(this.curMidIndex, this.curMidNode);
            }
            EventCenter.getInstance().fire(PUBLIC_EVENTS.BET_SCROLL_END, this.node)
        }
    }

    private onTouchCancel(event: EventTouch) {
        this.fixPos();
        if (this._touchCb) {
            this._touchCb.invokeWithExtra(this.curMidIndex, this.curMidNode);
        }
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BET_SCROLL_END, this.node)
    }

    private fixPos(bAni: boolean = false, callback?) {
        let content = this.node.children[0];
        let itemHei = content.children[0].getComponent(UITransform).contentSize.height;
        let pos = content.position;
        let pre = Math.floor(pos.y / itemHei) * itemHei;
        let after = pre + itemHei;
        let finalY = after;
        //log(pos.y, pre, pos.y-pre, after, pos.y-after);
        if (Math.abs(pre - pos.y) < (after - pos.y)) {
            finalY = pre;
        }

        Tween.stopAllByTarget(content);
        if (bAni) {
            tween(content).to(0.2, { position: v3(pos.x, finalY, pos.z) }).call(() => {
                if (callback) {
                    callback()
                }
            }).start();
        } else {
            content.setPosition(pos.x, finalY, pos.z);
            if (callback) {
                callback()
            }
        }

        let idx = Math.floor(finalY / itemHei);
        this.curMidIndex = idx + 2;
        this.curMidNode = content.children[idx + 2];
    }

    setTouchCb(cb: CHandler) {
        this._touchCb = cb;
    }

    getMidNode(): Node {
        this.fixPos();
        return this.curMidNode;
    }

    getMidIndex(): number {
        this.fixPos();
        return this.curMidIndex;
    }

    scrollToIndex(idx: number, bAni: boolean = true, callback?) {
        let content = this.node.children[0];
        let itemHei = content.children[0].getComponent(UITransform).contentSize.height;
        let pos = content.position;
        let finalY = (idx - 2) * itemHei;
        Tween.stopAllByTarget(content);
        if (bAni) {
            tween(content).to(0.2, { position: v3(pos.x, finalY, pos.z) }).call(() => { callback && callback() }).start();
        } else {
            content.setPosition(pos.x, finalY, pos.z);
        }
    }

    scrollToIdx(idx: number, bAni: boolean = true) {
        let content = this.node.children[0];
        let itemHei = content.children[0].getComponent(UITransform).contentSize.height;
        let pos = content.position;
        let finalY = idx * itemHei;
        Tween.stopAllByTarget(content);
        if (bAni) {
            tween(content).to(0.2, { position: v3(pos.x, finalY, pos.z) }).start();
        } else {
            content.setPosition(pos.x, finalY, pos.z);
        }
    }

}


