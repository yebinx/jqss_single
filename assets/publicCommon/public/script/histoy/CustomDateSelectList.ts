import { _decorator, Component, instantiate, Layout, Node, Prefab, ScrollBar, ScrollView, Size, UITransform, Vec2, Vec3, Widget } from 'cc';
import { EventTouch } from 'cc';
import { v3 } from 'cc';
import { v2 } from 'cc';
import { NodeEx } from './NodeEx';
import { RecordDateItem } from './RecordDateItem';
const { ccclass, property } = _decorator;

// 选择日期
@ccclass('CustomDateSelectList')
export class CustomDateSelectList extends Component {
    @property({ type: Node })
    ndContent: Node;

    @property({ type: Layout })
    content: Layout; // 列表

    @property({ type: ScrollBar })
    scrollBar: ScrollBar; // 滚动条

    @property({ type: ScrollView })
    svContent: ScrollView;

    @property({ type: Prefab })
    recordDateItem: Prefab

    private szData: number[];
    private selectData: number = null;
    private maxSize: Size; // 最大原始范围
    private target: Node
    private closeCallback: (data: number) => void;

    onLoad(): void {
        let uiTransform = this.ndContent.getComponent(UITransform);
        this.maxSize = uiTransform.contentSize.clone();

        this.scrollBar.node.on(Node.EventType.TOUCH_MOVE, (ev: EventTouch) => {
            let local = ev.getUILocation();
            let p = this.scrollBar.node.getComponent(UITransform).convertToNodeSpaceAR(v3(local.x, local.y, 0));
            let bar = this.scrollBar.node.getChildByName("bar");
            let size = bar.getComponent(UITransform).contentSize;
            let sSize = this.scrollBar.getComponent(UITransform).contentSize;
            if (-p.y > sSize.height - size.height / 2) {
                p.y = -sSize.height + size.height / 2;
            } else if (-p.y < size.height / 2) {
                p.y = -size.height / 2;
            }
            let bl = (-p.y - size.height / 2) / (sSize.height - size.height);
            this.svContent.scrollTo(v2(0, 1 - bl));
        })
    }

    start() {
        // this.test()
    }

    protected onDestroy(): void {
        if (this.closeCallback) {
            this.closeCallback(this.selectData);
        }
    }

    getTarget() { return this.target; }
    getSelectData() { return this.selectData; }

    setData(szData: number[], currentData: number) {
        this.szData = szData;
        this.selectData = currentData;
        this.reflush();
    }

    setCallback(cb: (data: number) => void) {
        this.closeCallback = cb;
    }

    setPosition(worldPos: Vec3) {
        this.ndContent.position = NodeEx.getLocalPosition(this.node, worldPos);
    }
    setTarget(target: Node) { this.target = target; }

    destroySelf() {
        this.node.destroy()
    }

    private reflush() {
        this.content.node.removeAllChildren();

        let selectRecordDateItem: RecordDateItem = null;
        for (let i = 0, len = this.szData.length; i < len; i++) {
            let dateItem = instantiate(this.recordDateItem)
            dateItem.parent = this.content.node;

            let recordDateItem = dateItem.getComponent(RecordDateItem);
            recordDateItem.setString(`${this.szData[i]}`);
            recordDateItem.setCallback(this.onClickDateItem.bind(this, this.szData[i]));

            if (this.selectData == this.szData[i]) {
                selectRecordDateItem = recordDateItem;
            }
        }

        this.content.updateLayout();

        // 显示内容太少，更新显示范围
        let uiTransform = this.ndContent.getComponent(UITransform);
        let contentUiTransform = this.content.getComponent(UITransform);
        let height = Math.min(contentUiTransform.height, this.maxSize.height)
        uiTransform.height = height;

        this.scrollBar.node.active = contentUiTransform.height > this.maxSize.height;

        this.content.getComponent(Widget).updateAlignment();

        if (!this.scrollBar.node.active) {
            return
        }

        // 跳转到选中的位置
        if (selectRecordDateItem != null) {
            this.scheduleOnce(() => { this.scrollTo(selectRecordDateItem.node); }, 0)
        }
    }

    private scrollTo(node: Node) {
        let uiTransform = node.getComponent(UITransform)
        let worldPos = uiTransform.convertToWorldSpaceAR(new Vec3(0, -0.5 * uiTransform.height));

        let contentUiTransform = this.content.getComponent(UITransform);
        let localPos = contentUiTransform.convertToNodeSpaceAR(worldPos);
        let viewY = -1 * this.maxSize.height;
        if (0 >= localPos.y && localPos.y >= viewY) { // 在视野范围内
            return
        }

        let offsetY = viewY - localPos.y;
        this.svContent.scrollToOffset(new Vec2(0, offsetY))
    }

    private onClickDateItem(data: number) {
        this.selectData = data;
        // console.log(data)
        this.destroySelf();
    }

    // private test(){
    //     this.setData([
    //         2001, 2002,
    //          2003, 
    //         2004, 2005
    //     ], 2003)
    // }
}


