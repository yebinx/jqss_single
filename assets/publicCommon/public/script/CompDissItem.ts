import { _decorator, Component, Node, warn } from 'cc';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { UIOpacity } from 'cc';
import GameEvent from '../../../scripts/event/GameEvent';
import { EventTouch } from 'cc';
import { ScrollView } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('CompDissItem')
export class CompDissItem extends Component {
    private _info: { dataArr: string[], item: Node };

    private _isMoved: boolean = false;

    parent: Node;
    init(parent: Node) {
        this.parent = parent
    }

    start() {
        let about = false, upAndDown = false;
        this.node.on(Node.EventType.TOUCH_START, () => {
            let op = this.node.getComponent(UIOpacity);
            if (!op) {
                op = this.node.addComponent(UIOpacity);
            }
            op.opacity = 200;
            this._isMoved = false;
        })

        this.node.on(Node.EventType.TOUCH_END, (ev: EventTouch) => {
            let op = this.node.getComponent(UIOpacity);
            if (!op) {
                op = this.node.addComponent(UIOpacity);
            }
            op.opacity = 255;
            !this._isMoved && EventCenter.getInstance().fire(PUBLIC_EVENTS.UI_SHOW_HISTORICAL_DETAILS, this.parent, this._info, this.node);

            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
        })

        this.node.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            if (!this._isMoved) {
                let c = ev.getUILocation().subtract(ev.getUIStartLocation());
                this._isMoved = Math.abs(c.x) >= 50 || Math.abs(c.y) >= 50;
            }

            if (upAndDown) {
                return;
            } else if (about) {
                this.parent.parent.parent.parent.getComponent(ScrollView).vertical = false;
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
            } else {
                let d = ev.getUILocation().subtract(ev.getUIStartLocation());
                if (Math.abs(d.x) >= 50) {
                    about = true;
                    this.parent.parent.parent.parent.getComponent(ScrollView).vertical = false;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                } else if (Math.abs(d.y) >= 50) {
                    upAndDown = true;
                    EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE, ev);
                }
            }
        })

        this.node.on(Node.EventType.TOUCH_CANCEL, (ev: EventTouch) => {
            let op = this.node.getComponent(UIOpacity);
            if (!op) {
                op = this.node.addComponent(UIOpacity);
            }
            op.opacity = 255;

            if (!upAndDown) {
                EventCenter.getInstance().fire(PUBLIC_EVENTS.HISTORY_LIST_MOVE_END, ev);
            }
            about = false;
            upAndDown = false;
            this.parent.parent.parent.parent.getComponent(ScrollView).vertical = true;
        })
    }

    setData(data: { dataArr: string[], item: Node }) {
        this._info = data;
    }
}


