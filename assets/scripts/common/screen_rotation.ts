import { _decorator, Component, instantiate, Node, Sprite, view, screen, Vec3, Size, Label } from 'cc';
const { ccclass, property } = _decorator;

// 屏幕旋转提示

@ccclass('ScreenRotetion')
export class ScreenRotetion extends Component {
    @property({ type: Sprite })
    spRotation: Sprite; // 旋转

    @property({ type: Node })
    spGray: Node; // 背景

    @property({ type: Label })
    lbTips: Label; // 提示

    @property({ type: Node })
    ndContent: Node;

    @property({ type: Node })
    ndRotation: Node;

    private gameAreaSize: Size;// 游戏显示区域

    static New(prefab: any, parent: Node) {
        let nd = instantiate(prefab);
        nd.parent = parent;
        return nd.getComponent(ScreenRotetion) as ScreenRotetion;
    }

    setGameAreaSize(gameAreaSize: Size) {
        this.gameAreaSize = gameAreaSize;
    }

    delayDestroy() {
        this.node.active = false;
        this.scheduleOnce(() => {
            this.node.destroy();
        }, 15);
    }

    updateRotetion(isLandscape: boolean) {
        this.unscheduleAllCallbacks();
        this.node.active = true;
    }

    updateTips() {
        // 如果一开始就是旋转屏幕，l10n没有完成初始化，会导致卡死
        if (!window["l10n"]) {
            this.lbTips.string = "";
            this.delayUpdateTips();
            return;
        }
        this.lbTips.string = window["l10n"].t("shared_rotation_tips");
    }

    private delayUpdateTips() {
        this.lbTips.schedule(() => {
            if (!window["l10n"]) {
                return;
            }
            this.lbTips.unscheduleAllCallbacks();
            this.lbTips.string = window["l10n"].t("shared_rotation_tips");
        }, 1 / 60);
    }

    updateSize(isLandscape: boolean) {
        let scale = Math.min(view.getScaleX(), view.getScaleY());
        this.updateScale(scale, isLandscape);
    }

    // 更新背景图大小
    private updateScale(scale: number, isLandscape: boolean) {
        let designResolutionSize = view.getDesignResolutionSize();
        let showWidth = (designResolutionSize.width) * scale;
        let showHeight = (designResolutionSize.height) * scale;

        // 计算宽度的缩放比例
        let widthRatio = screen.windowSize.width / showWidth;

        // 计算高度的缩放比例
        let heightRatio = screen.windowSize.height / showHeight;

        // 选择最大的缩放比例
        let maxRatio = Math.max(widthRatio, heightRatio);

        this.spGray.scale = new Vec3(maxRatio, maxRatio, 1);

        // 计算水平和垂直偏移量
        let offsetY = (screen.windowSize.height) * 0.1 / scale / maxRatio;
        this.ndContent.position = new Vec3(0, offsetY / 2, 1);

        let contentScale = 1 + (designResolutionSize.height - this.gameAreaSize.height) / designResolutionSize.height;
        this.ndContent.scale = new Vec3(contentScale, contentScale, 1);

        // -90屏幕左旋转，需要镜像
        this.ndRotation.scale = new Vec3(window.orientation == 90 ? -1 : 1, 1, 1);
      
        // console.log("showHeight", showHeight, "screenHeight", screen.windowSize.height, "offsetY", offsetY);
        // console.log("showWidth", showWidth, "scale", scale, "maxRatio", maxRatio, "contentScale", contentScale);
    }
}


