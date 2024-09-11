import { _decorator, Node, Vec3, view, screen, Size, UITransform, sys } from 'cc';
import { DEV } from 'cc/env';

// 游戏主显示区域，本区域会完全显示，显示不下，会正比缩放
export class ScreenGameArea {
    private gameRoot: Node; // 游戏节点
    private gameArea: Node; // 显示缩放大小的节点
    private gameAreaBorderShadow: Node; // 游戏区域外边框阴影

    private gameAreaSize: Size;
    private ScaleY = 1.0;
    private limitOffsetY: number;
    private offsetY: number;

    init(gameRoot: Node, gameArea: Node, shadow: Node) {
        this.gameRoot = gameRoot;
        this.gameArea = gameArea;
        this.gameAreaBorderShadow = shadow;

        let uiTransform = this.gameArea.getComponent(UITransform);
        this.gameAreaSize = uiTransform.contentSize.clone();

        let designResolutionSize = view.getDesignResolutionSize();
        this.ScaleY = 1 + (designResolutionSize.height - this.gameAreaSize.height) / designResolutionSize.height;

        {// 校验适配后，是否会超出显示
            let scale = Math.min(view.getScaleX(), view.getScaleY());
            let realWidth = designResolutionSize.width * this.ScaleY * scale;
            let windowsSize = screen.windowSize;
            if (realWidth > windowsSize.width) { // 适配后宽度超出显示范围
                // console.log("适配后宽度超出显示范围", "realWidth", realWidth, "windowWidth", windowsSize.width)
                // console.log("适配后宽度超出显示范围", "viewScaleX",view.getScaleX(), "viewScaleY", view.getScaleY(), "scaleY", this.ScaleY)
                this.ScaleY = this.ScaleY - Math.ceil((realWidth - windowsSize.width) / windowsSize.width * 100) / 100;
                // if (DEV){
                //     realWidth = designResolutionSize.width * this.ScaleY * scale;
                //     console.log("适配后宽度超出显示范围",  "afterScaleY", this.ScaleY, "afterRealWidth", realWidth)
                // }
            }
        }

        this.limitOffsetY = (designResolutionSize.height - this.gameAreaSize.height) / this.ScaleY / 2;
    }

    getLimitOffsetY() { return this.limitOffsetY; }
    getOffsetY() { return this.offsetY; }

    updataArea() {
        let scale = Math.min(view.getScaleX(), view.getScaleY());
        this.updateGameRootScale(scale);
    }

    listenViewReset(hander: (offsetY: number, limitOffsetY: number) => void, target: any) {
        this.gameRoot.on("view_resize", hander, target);
    }

    private updateGameRootScale(scale: number) {
        let gameRootScale = new Vec3(this.ScaleY, this.ScaleY, 1);
        // console.log("gameRootScale", gameRootScale)
        this.gameRoot.scale = gameRootScale;

        this.gameAreaBorderShadow.scale = gameRootScale.clone();

        // console.log("scale", scale, "gameRootScale", this.ScaleY)
        // console.log("windowWidth", screen.windowSize.width, "windowHeight", screen.windowSize.height)
        // console.log("realWidth", view.getDesignResolutionSize().width * scale, "realHeight", view.getDesignResolutionSize().height * scale)
        // console.log("RootWidth", view.getDesignResolutionSize().width * gameRootScale.x * scale, "RootHeight", view.getDesignResolutionSize().height * gameRootScale.y * scale)
        this.emitViewResize(scale, gameRootScale.y);
    }

    // 
    private emitViewResize(scale: number, gameRootScale: number) {
        let designResolutionSize = view.getDesignResolutionSize();
        let windowsSize = screen.windowSize;
        let showHeight = designResolutionSize.height * scale; // 显示最高尺寸

        // console.log("designResolutionSize", designResolutionSize);
        // console.log("windowsSize", windowsSize);
        // console.log("showHeight", showHeight);
        // console.log("");
        // console.log("");
        // console.log("");

        let offsetY = (designResolutionSize.height * (this.ScaleY - 1)) + (windowsSize.height - showHeight) / scale / 2;
        let limitY = this.limitOffsetY - (windowsSize.height - showHeight) / scale / this.ScaleY / 2;

        this.emit(offsetY, Math.max(0, limitY));
    }

    private emit(offsetY: number, limitY: number) {
        this.offsetY = offsetY;
        this.gameRoot.emit("view_resize", offsetY, limitY);
    }
}