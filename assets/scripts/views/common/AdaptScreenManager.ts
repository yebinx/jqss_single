import { sys } from 'cc';
import { _decorator, Component, game, Node, Size, view, screen, warn } from 'cc';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { EUILayer } from '../../kernel/compat/view/ViewDefine';
import { AssetManager } from 'cc';
import { assetManager } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AdaptScreenManager')
export class AdaptScreenManager extends Component {

    private static _events: Map<Node, ((visible: Size) => void)[]> = new Map();

    static visible: Size = new Size();

    static addEvent(node: Node, ev: (visible: Size) => void) {
        let t = this._events.get(node);
        if (t) {
            t.push(ev);
        } else {
            this._events.set(node, [ev]);
        }
    }

    static deleteEvent(node: Node) {
        this._events.delete(node);
    }

    private calcSize() {
        let visible = new Size();
        let original = view.getVisibleSize().width / view.getVisibleSize().height;
        let now = game.canvas.width / game.canvas.height;
        if (now > original) {
            visible.width = view.getVisibleSize().height / game.canvas.height * game.canvas.width;
            visible.height = view.getVisibleSize().height;
        } else {
            visible.width = view.getVisibleSize().width;
            visible.height = view.getVisibleSize().width / game.canvas.width * game.canvas.height;
        }
        return visible;
    }

    onLoad() {
        AdaptScreenManager.visible = this.calcSize();
        view.on("canvas-resize", () => {
            AdaptScreenManager.visible = this.calcSize();
            AdaptScreenManager._events.forEach((evs) => {
                evs.forEach((ev) => {
                    ev(AdaptScreenManager.visible);
                })
            });
            this.updateRotationTips();
        })

        this.updateRotationTips();
    }

    updateRotationTips() {
        if (sys.isMobile) {
            let node = this.node.getChildByName("ScreenRotationTips");
            if (node) {
                if (AdaptScreenManager.visible.width > AdaptScreenManager.visible.height) {
                    this.node.getChildByName("ScreenRotationTips").active = true;
                } else {
                    this.node.getChildByName("ScreenRotationTips").active = false;
                }
            } else {
                assetManager.loadBundle("publicCommon", (err, bundle) => {
                    if (err) {
                        this.scheduleOnce(() => {
                            this.updateRotationTips();
                        }, 1);
                        return;
                    }
                    bundle.load("public/prefabs/ScreenRotationTips", Prefab, (err, prefab) => {
                        if (err) {
                            this.scheduleOnce(() => {
                                this.updateRotationTips();
                            }, 1);
                            return;
                        }
                        node = instantiate(prefab);
                        node.active = false;
                        this.node.addChild(node);
                        this.updateRotationTips();
                    })
                })
            }
        }
    }

    update(deltaTime: number) {
        
    }
}


