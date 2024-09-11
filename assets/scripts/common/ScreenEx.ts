import { _decorator, Component, screen, UITransform, Node, Sprite, game, Game, Prefab, isValid, sys } from 'cc';
import { DEV, HTML5 } from 'cc/env';
import { ScreenSplashLogo } from './screen_splash_logo';
import { ScreenBackground } from './screen_background';
import { ScreenGameArea } from './screen_game_area';
import { ScreenRotetion } from './screen_rotation';
const { ccclass, property } = _decorator;

@ccclass('ScreenEx')
export class ScreenEx extends Component {
    @property({ type: Node })
    limitContent: Node; // 显示缩放大小的节点

    @property({ type: Sprite })
    splash: Sprite; // 自适应的背景图

    @property({ type: Node })
    gameRoot: Node; // 游戏根节点

    @property({ type: Node })
    shadow: Node;// 游戏边缘阴影

    @property({ type: Node })
    ndScreenRotationTipsLayer: Node;

    @property({ type: Prefab })
    screenRotationTips: Prefab; // 屏幕旋转提示

    private static instance: ScreenEx = null;

    private screenGameArea = new ScreenGameArea();
    private screenBackground = new ScreenBackground();
    private screenSplashLogo = new ScreenSplashLogo();
    private screenRotetion: ScreenRotetion = null;

    static listenViewReset(hander: (offsetY: number, limitOffsetY: number) => void, target: any) {
        if (!this.instance) {
            return;
        }
        this.instance.screenGameArea.listenViewReset(hander, target);
    }

    static async waitSplashLogoHide() {
        if (!this.instance) {
            return;
        }
        await this.instance.screenSplashLogo.waitSplashLogoHide();
    }

    static getLimitOffsetY() {
        if (!this.instance) {
            return 0;
        }

        return this.instance.screenGameArea.getLimitOffsetY();
    }
    static getOffsetY() {
        if (!this.instance) {
            return 0;
        }
        return this.instance.screenGameArea.getOffsetY();
    }

    protected onLoad(): void {
        ScreenEx.instance = this;

        this.listenMouseLeaveGame();
        screen.on("window-resize", (windowWidth: number, windowHeight: number) => {
            this.updateWindowResize(windowWidth, windowHeight);
        });
        screen.on("orientation-change", (windowWidth: number, windowHeight: number) => {
            // 这个有时候在尺寸变化的时候不会发生调用。而且调用是滞后的
            // 在已经旋转的情况下，尺寸是不会发生变化，需要使用这个监听才能获得旋转后的翻转参数
            this.updateOrientationChange(windowWidth, windowHeight, false);
        });
    }

    start() {
        this.screenGameArea.init(this.gameRoot, this.limitContent, this.shadow);
        this.screenBackground.init(this.splash);

        let windowSize = screen.windowSize;
        this.updateWindowResize(windowSize.width, windowSize.height);
        this.updateOrientationChange(windowSize.width, windowSize.height, false);
        this.screenSplashLogo.hideLoadingSvg();
    }

    private listenMouseLeaveGame() {
        if (HTML5) {
            window.addEventListener("blur", () => {
                // console.log("blur")
                game.emit(Game.EVENT_HIDE);
            });

            window.addEventListener("focus", () => {
                // console.log("focus")
                game.emit(Game.EVENT_SHOW);
            });
        }
    }

    private updateOrientationChange(windowWidth: number, windowHeight: number, isRetry: boolean) {
        if (!sys.isMobile) {
            return
        }

        let isLandscape = this.isLandscape(windowWidth, windowHeight);
        // if (DEV) {
        // console.log(isLandscape ? "横屏" : "竖屏", "windowWidth", windowWidth, "windowHeight", windowHeight);
        // console.log("屏幕旋转", window.orientation == 0 ? "正常" : window.orientation == 90 ? "左旋转" : "右边旋转", window.orientation);
        // console.log(isLandscape, window.orientation);
        // }

        // window.orientation的更新有的浏览器会滞后， 如果业务是旋转，而浏览器底层是未旋转，则等待下次更新
        // orientation 只有 -90 0 90 这几个值
        // 调整刷新 engine代码
        // 文件web/screen-adapter.ts的 const EVENT_TIMEOUT = EDITOR ? 5 : 200; 改成 const EVENT_TIMEOUT = EDITOR ? 5 : 0;
        // 否则会造成更新延迟明显
        if (isLandscape && window.orientation == 0) {
            if (!isRetry) {
                // 有时候在事件发生后window.orientation的值是错误的，这样就没办法知道旋转的角度，需要下帧从新计算
                this.scheduleOnce(() => {
                    // console.log("旋转不统一", isLandscape, window.orientation);
                    this.updateOrientationChange(windowWidth, windowHeight, true)
                }, 0)
            }
            return;
        }
        // console.log("updateOrientationChange", "windowWidth", windowWidth, "windowHeight", windowHeight);
        this.updateScreenRotationTips(isLandscape);
    }
    private isLandscape(windowWidth: number, windowHeight: number) {
        if (!sys.isMobile) {
            return false;
        }
        if (windowWidth < windowHeight) {
            return false;
        }

        return true;
    }

    // 屏幕旋转提示
    private updateScreenRotationTips(isLandscape: boolean) {
        if (!isLandscape) {
            if (isValid(this.screenRotetion)) {
                this.screenRotetion.delayDestroy();
            }
            return;
        }

        if (!isValid(this.screenRotetion)) {
            this.screenRotetion = ScreenRotetion.New(this.screenRotationTips, this.ndScreenRotationTipsLayer);
            let uiTransform = this.limitContent.getComponent(UITransform);
            this.screenRotetion.setGameAreaSize(uiTransform.contentSize.clone());
            this.screenRotetion.updateTips();
        }
        this.screenRotetion.updateRotetion(isLandscape);
        this.screenRotetion.updateSize(isLandscape);
    }

    private updateWindowResize(windowWidth: number, windowHeight: number) {
        if (!HTML5) {
            return;
        }

        this.screenGameArea.updataArea();
        this.screenBackground.updateSplash();

        // if (DEV){
        // let date = new Date()
        // console.log()
        // console.log()
        // console.log("updateWindowResize", "windowWidth", windowWidth, "windowHeight", windowHeight, "orientation", window.orientation, "isLandscape", this.isLandscape(windowWidth, windowHeight), "availHeight", window.screen.availHeight, window.screen.height, "availWidth", window.screen.availWidth, window.screen.width, date.getSeconds(), date.getMilliseconds());
        // }

        this.updateOrientationChange(windowWidth, windowHeight, false);
    }
}