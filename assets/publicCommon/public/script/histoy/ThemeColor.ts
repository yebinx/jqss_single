import { _decorator, Color, Component, log, Node, UIRenderer } from 'cc';
import { PublicConfig } from '../../../customize/script/PublicConfig';
const { ccclass, property } = _decorator;

// 把节点更新成主题颜色
@ccclass('ThemeColor')
export class ThemeColor extends Component {
    @property({ type: UIRenderer, displayName: "修改成主题的颜色" })
    rendererList: UIRenderer[] = []

    protected onLoad(): void {
        this.rendererList.forEach((render: UIRenderer) => {
            render.color = PublicConfig.themeColor.clone();
        })
    }

    protected start(): void {
        this.destroy();
    }
}


