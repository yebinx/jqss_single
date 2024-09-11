import { _decorator, Component, Label, Layout, Node, NodeEventType, sp, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec2, Vec3, warn } from 'cc';
import { ElementCom } from './ElementCom';
import GameConst from '../../define/GameConst';
import { assetManager } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import { error } from 'cc';
import { instantiate } from 'cc';
import { log } from 'cc';
const { ccclass, property } = _decorator;

window["paytableMask"] = {
    interval: 0.25,
    opacity: 150
}

@ccclass('ClickElementRateTip')
export class ClickElementRateTip extends Component {
    @property(Node)
    root: Node;
    @property(Node)
    mask: Node;
    @property(SpriteFrame)
    kuangArr: SpriteFrame[] = [];

    cloneNode: Node = null;

    protected onLoad(): void {
        
    }

    start() {
        this.root.on(NodeEventType.TOUCH_END, () => {
            this.hideTip()
        }, this)
    }

    showTip(com: ElementCom) {
        this.deleteCloneNode();
        let count = com.count, id = com.changeId(), posIdx = com.posIdx, touchNode = com.node;
        log("showTip", posIdx, count)
        if (posIdx == -1) {
            return;
        }
        this.root.active = true;
        let sprite = this.kuangArr[count - 1];

        let arr = GameConst.ElementRateList.get(id);
        let node = this.root.getChildByName("multiple_bg");
        node.getComponent(Sprite).spriteFrame = sprite;
        let h = [150, 284, 424, 538];
        node.getComponent(UITransform).setContentSize(node.getComponent(UITransform).contentSize.width, h[count - 1]);
        let curPos = Vec3.ZERO;
        let icon: Node = null;
        if (arr.length == 1) {
            if (posIdx <= 17) {//左
                icon = node.getChildByName("icon_left");
                icon.active = true;
                node.getChildByName("label_special_left").active = true;
                node.getChildByName("label_special_right").active = false;
                node.getChildByName("icon_right").active = false;
                node.getChildByName("label_special_left").getComponent(Label).string = l10n.t(arr[0] as string);
                node.getChildByName("label_special_left").getComponent(Label).updateRenderData();
            } else {//右
                icon = node.getChildByName("icon_right");
                icon.active = true;
                node.getChildByName("icon_left").active = false;
                node.getChildByName("label_special_left").active = false;
                node.getChildByName("label_special_right").active = true;
                node.getChildByName("label_special_right").getComponent(Label).string = l10n.t(arr[0] as string);
                node.getChildByName("label_special_right").getComponent(Label).updateRenderData();
            }
            node.getChildByName("label_left").active = false;
            node.getChildByName("label_right").active = false;
        } else {
            if (posIdx <= 17) {//左
                icon = node.getChildByName("icon_left");
                icon.active = true;
                node.getChildByName("label_left").active = true;
                node.getChildByName("label_right").active = false;
                node.getChildByName("icon_right").active = false;
                node.getChildByName("label_left").getChildByName("num").getComponent(Label).string = (arr[0] as any).num + "\n" + (arr[1] as any).num + "\n" + (arr[2] as any).num + "\n" + (arr[3] as any).num;
                node.getChildByName("label_left").getChildByName("multiple").getComponent(Label).string = (arr[0] as any).multiple + "\n" + (arr[1] as any).multiple + "\n" + (arr[2] as any).multiple + "\n" + (arr[3] as any).multiple;
            } else {//右
                icon = node.getChildByName("icon_right");
                icon.active = true;
                node.getChildByName("icon_left").active = false;
                node.getChildByName("label_left").active = false;
                node.getChildByName("label_right").active = true;
                node.getChildByName("label_right").getChildByName("num").getComponent(Label).string = (arr[0] as any).num + "\n" + (arr[1] as any).num + "\n" + (arr[2] as any).num + "\n" + (arr[3] as any).num;
                node.getChildByName("label_right").getChildByName("multiple").getComponent(Label).string = (arr[0] as any).multiple + "\n" + (arr[1] as any).multiple + "\n" + (arr[2] as any).multiple + "\n" + (arr[3] as any).multiple;
            }
            node.getChildByName("label_special_left").active = false;
            node.getChildByName("label_special_right").active = false;
        }

        let item = instantiate(com.node);
        item.setPosition(0, 0, 0);
        icon.addChild(item);
        let comClone = item.getComponent(ElementCom);
        comClone.init(com.id, count, com.parentCom);
        comClone.updateIcon(false);
        comClone.showSpineAnim("win", false, false, () => {
            comClone.showSpineAnim("idle", false);
        });
        item.off(NodeEventType.TOUCH_START);
        this.cloneNode = item;

        let targetPos = touchNode.parent.getComponent(UITransform).convertToWorldSpaceAR(touchNode.position);
        curPos = icon.parent.getComponent(UITransform).convertToWorldSpaceAR(icon.position);
        let c = targetPos.subtract(curPos);
        let p = this.root.position.add(c);
        this.root.setPosition(p);

        tween(this.mask.getComponent(UIOpacity)).to(window["paytableMask"].interval, { opacity: window["paytableMask"].opacity }).start();
    }

    deleteCloneNode() {
        this.cloneNode?.destroy();
        this.cloneNode = null;
    }

    hideTip() {
        tween(this.mask.getComponent(UIOpacity)).to(window["paytableMask"].interval, { opacity: 0 }).start();
        this.root.active = false;
    }

}


