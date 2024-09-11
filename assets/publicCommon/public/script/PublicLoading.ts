import { _decorator, Component, Node, ProgressBar, Label, resources, AssetManager, Vec3, tween, v3, color, assetManager, Color, Sprite, Size, warn, sys, log } from 'cc';
import { Prefab } from 'cc';
import { BaseView } from '../../../scripts/kernel/compat/view/BaseView';
import LoginCtrl from '../../../scripts/ctrls/LoginCtrl';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import CocosUtil from '../../../scripts/kernel/compat/CocosUtil';
import MathUtil from '../../../scripts/kernel/core/utils/MathUtil';
import { CompColorBlur } from '../../../scripts/kernel/compat/view/comps/CompColorBlur';
import { AdaptScreenManager } from '../../../scripts/views/common/AdaptScreenManager';
import LoadHelper from '../../../scripts/kernel/compat/load/LoadHelper';
import { createResInfo } from '../../../scripts/kernel/compat/load/ResInfo';
import { PublicConfig } from '../../customize/script/PublicConfig';
import { instantiate } from 'cc';
import { SpriteFrame } from 'cc';
import { Button } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import { error } from 'cc';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { EViewNames, g_uiMap } from '../../../scripts/configs/UIConfig';
import { Asset } from 'cc';
import { sp } from 'cc';
import { js } from 'cc';
import { NoSleepEx } from '../../../scripts/common/NoSleepEx';
import { Tween } from 'cc';
import { Network } from '../../../scripts/network/Network';
import DataManager from '../../../scripts/network/netData/DataManager';
import { roomCmd } from '../../../scripts/network/netData/cmd';
import { EUILayer, ParamConfirmDlg } from '../../../scripts/kernel/compat/view/ViewDefine';
import { UIManager } from '../../../scripts/kernel/compat/view/UImanager';
import GameEvent from '../../../scripts/event/GameEvent';


let tip_notes = [
    "loading_tips1",
    "loading_tips2",
    "loading_tips3",
    "loading_tips4",
    "loading_tips5",
    "loading_tips6",
]

const { ccclass, property } = _decorator;

@ccclass('PublicLoading')
export class PublicLoading extends BaseView {
    spBar: ProgressBar;
    txtProgress: Label;
    txtTip: Label;

    btn_entergame: Node;

    curLoadProgress: number = 0;
    curTipIndex: number = 0;
    originPos: Vec3 = null;

    protected async onLoad() {
        await this.loadPre();
        super.onLoad();
        this._initNode();
        this.btn_entergame.active = false;
        window.addEventListener("startGame", () => {
            LoginCtrl.getIns().enterGame();
        })
        this.next();
    }

    private loadPre() {
        return new Promise<void>((resolve, reject) => {
            let load = () => {
                LoadHelper.loadPrefab(createResInfo(PublicConfig.loadingConfig.loadingBgPre.path, PublicConfig.bundleName), (err, pre: Prefab) => {
                    if (err) {
                        this.scheduleOnce(() => {
                            load()
                        }, 1);
                        return;
                    }
                    this.node.addChild(instantiate(pre));
                    resolve();
                })
            }
            load();
        })
    }

    private _initNode() {
        this.spBar = this.m_ui.ProgressBar.getComponent(ProgressBar);
        this.txtProgress = this.m_ui.txt_desc.getComponent(Label);
        this.txtTip = this.m_ui.txt_tip.getComponent(Label);
        this.btn_entergame = this.m_ui.startBtn;
        /**
         * 需要时开启
         */
        // let PGone = this.m_ui.bottomLayer.getChildByPath("bottom/pgNode/PGone").getComponent(sp.Skeleton);
        // let PGtwo = this.m_ui.bottomLayer.getChildByPath("bottom/pgNode/PGtwo").getComponent(sp.Skeleton);
        // PGone.node.active = true;
        // PGone.animation = "animation";
        // this.scheduleOnce(() => {
        //     PGtwo.node.active = true;
        //     PGone.node.active = false;
        //     PGtwo.animation = "chuxian";
        // }, 2.0)
        // PGtwo.setCompleteListener((_trackEntry) => {
        //     if (_trackEntry.animation.name == "chuxian") {
        //         PGtwo.animation = "diji";
        //     }
        // })
    }

    private hideLoadingSvg(force?: boolean) {
        if (sys.isMobile || sys.isBrowser) {
            this.unschedule(window["removeDom"]);
            Tween.stopAllByTarget(window["opacityTween"]);
            !window["opacityTween"] && (window["opacityTween"] = { opacity: 1 });

            window["removeDom"] = () => {
                let fadeOutDuration = 0.4;

                tween(window["opacityTween"])
                    .to(fadeOutDuration, { opacity: 0.0 }, {
                        progress: (start: number, end: number, current: number, ratio: number) => {
                            let v = start + ((end - start) * ratio);
                            let domSvg = document.getElementById("initial-loader");
                            if (domSvg) {
                                domSvg.style.opacity = `${v}`;
                            }

                            return v;
                        },
                        // easing: "quintIn",
                    })
                    .call(() => {
                        let domSvg = document.getElementById("initial-loader");
                        if (domSvg) {
                            domSvg.remove();
                        }
                    })
                    .start()
            }
            let _svgStartDate = window["_svgStartDate"] as Date;
            if (!_svgStartDate || force) {
                window["removeDom"]();
                return
            }

            let _svgDuration = window["_svgDuration"] as number;

            let now = new Date();
            let pastTime = now.getTime() - _svgStartDate.getTime();
            if (pastTime < _svgDuration) {
                this.scheduleOnce(window["removeDom"], (_svgDuration - pastTime) / 1000);
                return
            }

            window["removeDom"]();
        }
    }

    loadAssets() {
        return new Promise<void>(async (resolve, reject) => {
            await this.checkL10Bundle();
            resolve();
        })
    }

    loadSprite(name: string, path?: string) {
        return new Promise<SpriteFrame>((resolve, reject) => {
            let loadSprite = (cb) => {
                LoadHelper.loadSpriteFrame(createResInfo((path ? path : PublicConfig.loadingConfig.resourcesPath) + "/" + name, PublicConfig.bundleName), (err, sprite: SpriteFrame) => {
                    if (err) {
                        this.scheduleOnce(() => {
                            loadSprite(cb);
                        }, 1);
                        return;
                    }
                    cb(sprite);
                });
            }
            loadSprite(resolve)
        })
    }

    async next() {
        await this.loadAssets();

        EventCenter.getInstance().listen(PUBLIC_EVENTS.USER_LOGIN_FAIL, this.onLoginFail, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.USER_LOGIN_SUCCESS, this.onLoginSucc, this);

        CocosUtil.addClickEvent(this.btn_entergame, this.onBtnEntergame, this)

        this.txtProgress.string = l10n.t("loading_basic_res");

        let pos = this.txtTip.node.position;
        this.originPos = v3(pos.x, pos.y, pos.z);
        MathUtil.shuffle(tip_notes);

        this.txtTip.node.addComponent(CompColorBlur);
        this.txtTip.string = l10n.t(tip_notes[0]);
        this.schedule(() => {
            this.changeTip();
        }, 5);
        // this.spBar.barSprite.active = false;

        this.loadBundleShared();

        this.moveLogo(AdaptScreenManager.visible);
        AdaptScreenManager.addEvent(this.node, (visible) => {
            this.moveLogo(visible)
        })
    }

    moveLogo(visible: Size) {
        if (visible.height > 1683) {
            this.m_ui.bottomLayer.setPosition(0, -572, 0);
        } else if (visible.height > 1334) {
            let c = visible.height - 1334;
            let t = 1638 - 1334;
            let n = -572 - -477;
            let y = n / t * c + -477;
            this.m_ui.bottomLayer.setPosition(0, y, 0);
        } else {
            this.m_ui.bottomLayer.setPosition(0, -477, 0);
        }
    }

    protected onDestroy(): void {
        EventCenter.untarget(this);
        AdaptScreenManager.deleteEvent(this.node);
    }

    private onLoginFail(failTimes: number) {
        this.txtProgress.string = l10n.t("login_fail" + failTimes);
    }

    private onLoginSucc() {
        log("login succ ------");
        this.setCurLoadBar(0.4);
        this.hideLoadingSvg(true);
        this.txtProgress.string = l10n.t("loading_game_res");
        this.loadPublic();
    }

    private onBtnEntergame() {
        LoginCtrl.getIns().enterGame()
        NoSleepEx.init();
    }

    private loadBundleGame() {
        log("load game bundle...");
        LoadHelper.loadBundle("game", null, (err, bun) => {
            if (err) {
                this.scheduleOnce(() => {
                    this.loadBundleGame();
                }, 1);
                return;
            }
            this.loadGame(bun);
        });
    }

    private loadPublic() {
        let percent = 0;
        LoadHelper.loadBundle("publicCommon", null, (err, bun) => {
            if (err) {
                this.scheduleOnce(() => {
                    this.loadPublic();
                }, 1);
                return;
            }
            this.loadCurLanguageAssets(bun, (finished: number, total: number) => {
                let curPercent = finished / total;
                if (percent < curPercent) {
                    percent = curPercent;
                    this.setCurLoadBar(0.4 + curPercent * 0.1);
                }
            }, (err) => {
                if (err) {
                    log(err);
                }
                this.loadBundleGame();
            });
        });
    }

    private loadCurLanguageAssets(bundle: AssetManager.Bundle, onProgress: (finished: number, total: number, item: AssetManager.RequestItem) => void, onComplete: (err: Error) => void) {
        // let needPath = new RegExp((`audio|prefabs|multiLanguage\/${l10n.currentLanguage}\/spine`));
        let needPath = new RegExp((`audio|prefabs`));
        // let needPath = new RegExp((`^(?!.*multiLanguage\/${l10n.currentLanguage}\/texture)(?=.*audio|.*prefabs)`));
        let all = bundle.getDirWithPath("");
        let need = all.filter((item) => {
            return needPath.test(item.path);
        })
        let f = 0, t = need.length;
        for (let i = 0; i < need.length; i++) {
            let ele = need[i];
            bundle.load(ele.path, ele.ctor, (err: Error, data: Asset) => {
                if (err) {
                    console.error(err);
                }
                f++;
                onProgress(f, t, null);
                if (f == t) {
                    onComplete(err)
                }
            })
        }
    }

    private loadGame(bun: AssetManager.Bundle) {
        log("load game dir");
        let percent = 0;
        this.loadCurLanguageAssets(bun, (finished: number, total: number) => {
            let curPercent = finished / total;
            if (percent < curPercent) {
                percent = curPercent;
                this.setCurLoadBar(0.5 + curPercent * 0.5);
            }
        }, (err) => {
            if (err) {
                log(err);
            }
            // this.loadSound(bun);
            this.showEnter();
        });
    }

    // private loadSound(bun: AssetManager.Bundle) {
    //     // let p = this.spBar.progress
    //     let percent = 0;
    //     bun.loadDir("audio", (finished: number, total: number) => {
    //         let curPercent = finished / total;
    //         if (percent < curPercent) {
    //             percent = curPercent;
    //             this.setCurLoadBar(0.8 + percent * 0.2);
    //         }
    //     }, (err, data) => {
    //         if (err) {
    //             log(err);
    //         }
    //         data.forEach((item) => {
    //             item.addRef();
    //         });
    //         this.showEnter();
    //     });
    // }

    // 加载通用
    private loadBundleShared() {
        assetManager.loadBundle("publicCommon", async (err: Error | null, data: AssetManager.Bundle) => {
            if (err != null) {
                this.scheduleOnce(this.loadBundleShared.bind(this), 1.0)
                return
            }

            this.loadCommon()
        })
    }

    // 检查l10多语言的子包是否加载完毕
    private async checkL10Bundle() {
        let check = (resolve: Function, reject: Function) => {
            // TODO l10n有时候会比res包加载的慢，先这样， 后面看怎么把l10n不在res下使用，或者调整加载顺序，修改bundle的顺序无效
            if (assetManager.getBundle("l10n") != null) {
                resolve();
                return
            }

            this.scheduleOnce(() => {
                resolve();
            }, 1.5)
            return
        }

        return new Promise<void>((resolve, reject) => {
            check(resolve, reject)
        })
        // this.playAnimation()
    }

    private showEnter() {
        this.btn_entergame.active = true;
        this.m_ui.ProgressBar.active = false;
        this.txtTip.node.active = false;
        this.txtProgress.node.active = false;
    }

    private loadCommon() {
        LoadHelper.loadBundle(g_uiMap[EViewNames.UIConfirmDialog].bundleName, null, (err, bun) => {
            if (err) {
                this.scheduleOnce(() => {
                    this.loadBundleGame();
                }, 1);
                return;
            }
            let percent = 0;
            bun.load(g_uiMap[EViewNames.UIConfirmDialog].respath, Prefab, (finished: number, total: number) => {
                let cur = finished / total;
                if (cur > percent) {
                    percent = cur;
                    this.setCurLoadBar(percent * 0.2);
                }
            }, () => {
                this.setCurLoadBar(0.2);
                this.hideLoadingSvg();
                //this.loginGame();
                this.connect();
            })
        });
    }

    private loginGame() {
        clearTimeout(this.mtimer);
        EventCenter.getInstance().fire(GameEvent.reconnect_tip_close)
        let eventName = DataManager.getCmdEventName(roomCmd.MDM_GF_FRAME, roomCmd.SUB_GF_SCENE,DataManager.serverTypeStr);
        EventCenter.getInstance().remove(eventName,this.loginGame,this);
        this.txtProgress && (this.txtProgress.string = l10n.t("account_verification"));
        LoginCtrl.getIns().login(() => {
            this.setCurLoadBar(0.3);
            this.txtProgress && (this.txtProgress.string = l10n.t("loading_player_info"));
            LoginCtrl.getIns().getBetInfo();
        })
    }

    private setCurLoadBar(percent: number) {
        if (percent < this.spBar.progress) {
            return
        }
        this.spBar.progress = percent;
        let p = Math.floor(percent * 100);
        if (p < 20) {
            this.txtProgress.string = `${l10n.t("loading_basic_res")}【${p}%】`
        } else if (p >= 40) {
            this.txtProgress.string = `${l10n.t("loading_basic_res")}【${p}%】`
        }
    }

    private changeTip() {
        this.curTipIndex++;
        if (this.curTipIndex >= tip_notes.length) {
            this.curTipIndex = 0;
        }

        let txtNode = this.txtTip.node;
        tween(txtNode)
            .call(() => {
                txtNode.getComponent(CompColorBlur).blurAlpha(18, 255, 0);
            })
            .to(0.35, { position: v3(this.originPos.x, this.originPos.y + 30, this.originPos.z) })
            .call(() => {
                this.txtTip.string = l10n.t(tip_notes[this.curTipIndex]);
                txtNode.position = v3(this.originPos.x, this.originPos.y - 30, this.originPos.z);
            })
            .hide()
            .delay(0.5)
            .show()
            .call(() => {
                txtNode.getComponent(CompColorBlur).blurAlpha(18, 0, 255);
            })
            .to(0.35, { position: v3(this.originPos.x, this.originPos.y, this.originPos.z) })
            .start();
    }

    private connect(){
        Network.Instance.CreateWS();
        EventCenter.getInstance().listen("onConnect",this.onConnect,this);
    }
    
    private onConnect(){
        let eventName = DataManager.getCmdEventName(roomCmd.MDM_GF_FRAME, roomCmd.SUB_GF_SCENE,DataManager.serverTypeStr);
        EventCenter.getInstance().listen(eventName,this.loginGame,this);
        this.mtimer=setTimeout(this.loginTimeOut, 20000);
        
    }

    private mtimer:NodeJS.Timeout=null;
    private loginTimeOut(){
        Network.Instance.ClearWS();
        let tself = this;
        let params: ParamConfirmDlg = {
            callback: () => {
                if(DataManager.betCfg)return;
                Network.Instance.ClearWS(false);
                tself.mtimer=setTimeout(this.loginTimeOut, 20000);
            },
            title: "Tip",
            content: `登录失败，是否重新登录？`,
            okTxt:"OK"
        }
        UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)
        EventCenter.getInstance().fire(GameEvent.reconnect_tip,1)
    }

}


