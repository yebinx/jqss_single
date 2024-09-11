import { Size, Sprite, UITransform, view, screen, Vec3 } from 'cc';

// 背景模糊图

export class ScreenBackground {
    private background: Sprite; // 背景图
    private backgroundSize: Size;

    init(background: Sprite) {
        this.background = background

        let uiTransform = this.background.getComponent(UITransform);
        this.backgroundSize = uiTransform.contentSize.clone();
    }

    updateSplash() {
        let scale = Math.min(view.getScaleX(), view.getScaleY());
        this.updateSplashScale(scale);
    }

    // 更新背景图大小
    private updateSplashScale(scale: number) {
        // -3是有白边，缩小闪屏图大小，增加放大比例
        let splashWidth = (this.backgroundSize.width) * scale;
        let splashHeight = (this.backgroundSize.height) * scale;

        // 计算宽度的缩放比例
        let widthRatio = screen.windowSize.width / splashWidth;

        // 计算高度的缩放比例
        let heightRatio = screen.windowSize.height / splashHeight;

        // 选择最大的缩放比例
        let maxRatio = Math.max(widthRatio, heightRatio);

        // 计算缩放后的宽度和高度
        let scaledWidth = splashWidth * maxRatio;
        let scaledHeight = splashHeight * maxRatio;

        // 计算水平和垂直偏移量
        let offsetY = (screen.windowSize.height) * 0.1 / scale;

        let uiTransform = this.background.getComponent(UITransform);
        uiTransform.width = scaledWidth / scale + (3);
        uiTransform.height = scaledHeight / scale + (offsetY);

        // console.log("offsetX", offsetX, "offsetY", offsetY)

        this.background.node.position = new Vec3(0, -offsetY / 2, 1);
    }
}


