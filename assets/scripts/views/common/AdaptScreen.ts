import { _decorator, CCBoolean, Component, error, Game, game, isValid, Node, size, Size, UITransform, view, warn } from 'cc';
import { AdaptScreenManager } from './AdaptScreenManager';
const { ccclass, property } = _decorator;

@ccclass('AdaptScreen')
export class AdaptScreen extends Component {

    @property(CCBoolean)
    coveredWidth: boolean = false;
    @property(CCBoolean)
    coveredHeight: boolean = false;
    @property(CCBoolean)
    maxWidth: boolean = false;
    @property(CCBoolean)
    maxHeight: boolean = true;

    nodeSize: UITransform = null;

    onLoad() {
        this.nodeSize = this.node.getComponent(UITransform);
        this.changeSize(AdaptScreenManager.visible);
        AdaptScreenManager.addEvent(this.node, this.changeSize.bind(this));
    }

    changeSize(visible: Size) {
        let t = this.nodeSize.contentSize.clone();
        if (this.coveredHeight) {
            t.height = visible.height;
        }
        if (this.coveredWidth) {
            t.width = visible.width;
        }
        if (this.maxHeight) {
            if (t.height > 1638) {
                t.height = 1638;
            }
        }
        if (this.maxWidth) {
            if (t.width > 1334) {
                t.width = 1334;
            }
        }
        this.nodeSize.setContentSize(t.width, t.height);
    }

    protected onDestroy(): void {
        AdaptScreenManager.deleteEvent(this.node);
    }

    update(deltaTime: number) {

    }
}


