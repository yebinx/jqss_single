import { _decorator, Animation, AnimationClip, AnimationState, assetManager, bezier, Button, Color, Component, DynamicAtlasManager, dynamicAtlasManager, error, Event, EventMouse, EventTouch, Game, Input, input, instantiate, KeyCode, Label, log, Node, NodeEventType, Prefab, sp, Sprite, sys, Tween, tween, UIOpacity, UITransform, v3, Vec2, Vec3, warn } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import { ElementCtrl } from './ElementCtrl';
import { ClientElement, GameMode, InitUIInfo, ResultAwardUIInfo, ResultLineInfo } from '../../models/GameModel';
import { ObjPoolCom } from './ObjPoolCom';
import CocosUtil from '../../kernel/compat/CocosUtil';
import GameCtrl from '../../ctrls/GameCtrl';
import GameEvent from '../../event/GameEvent';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameConst, { GameState, TItemtype } from '../../define/GameConst';
import { WinAwardNumAnimation } from './WinAwardNumAnimation';
import { ClickElementRateTip } from './ClickElementRateTip';
import { ElementCom } from './ElementCom';
import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';
import { EDialogMenuId, EDialogType, EUILayer, ParamConfirmDlg } from '../../kernel/compat/view/ViewDefine';
import { AudioManager } from '../../kernel/compat/audio/AudioManager';
import GameAudio, { BgmType } from '../../mgrs/GameAudio';
import { BaseEvent } from '../../kernel/core/event/BaseEvent';
import BigNumber from 'bignumber.js';
import { TRound } from '../../interface/result';
import LoginCtrl from '../../ctrls/LoginCtrl';
import LoadHelper from '../../kernel/compat/load/LoadHelper';
import { createResInfo } from '../../kernel/compat/load/ResInfo';
import { PUBLIC_EVENTS } from '../../event/PublicEvents';
import { easing } from 'cc';
import { SpriteFrame } from 'cc';
import { AudioSource } from 'cc';
import MathUtil from '../../kernel/core/utils/MathUtil';
const { ccclass, property } = _decorator;

@ccclass('GameView')
export class GameView extends BaseView {

    /**元素控制器 */
    @property(ElementCtrl)
    elementCtrl: ElementCtrl;

    @property(WinAwardNumAnimation)
    winNumAnimation: WinAwardNumAnimation

    @property(ClickElementRateTip)
    clickElementRateTip: ClickElementRateTip

    /**对象池 */
    static objPool: ObjPoolCom;

    /**初始化信息 */
    viewInfo: InitUIInfo;

    state: GameState;

    resultAwardUIInfo: TRound

    elementNodes: Node[] = [];

    isFast: boolean = false;
    curMode: GameMode = GameMode.normal;

    /**遮罩黑透明节点 */
    mask_bg: Node;

    ndElementFullSceneEffect: Node;

    @property(SpriteFrame)
    freeSpriteFrame: SpriteFrame[] = []
    @property(SpriteFrame)
    normalSpriteFrame: SpriteFrame[] = []

    nodeScaleTwe: Tween<Node> = null;
    nodeShakeTwe: Tween<Node> = null;

    async onLoad() {
        await this.initPre();
        super.onLoad();
        GameView.objPool = this.getComponent(ObjPoolCom)

        this.next();
    }

    initPre() {
        return new Promise<void>((resolve, reject) => {
            let count = 0, total = 2;
            let calc = () => {
                count++;
                if (count == total) {
                    resolve()
                }
            }
            LoadHelper.loadPrefab(createResInfo("public/prefabs/Btns", "publicCommon"), (err, btns: Prefab) => {
                if (err) {
                    return error(err);
                }
                this.node.getChildByName("btnsBox").addChild(instantiate(btns));
                calc()
            })
            LoadHelper.loadPrefab(createResInfo("customize/prefabs/SpinBtnBox", "publicCommon"), (err, btns: Prefab) => {
                if (err) {
                    return error(err);
                }
                this.node.getChildByName("spinBtnBox").addChild(instantiate(btns));
                calc();
            })
        })
    }

    initData(viewInfo: InitUIInfo) {
        this.viewInfo = viewInfo;
    }

    next() {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.INIT_FAST_STATE);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SWITCH_MENU, true, false);

        this.initNetEvent();
        this.initUIEvent();
        this.onUpdateState(GameState.wait)
        this.clickElementRateTip.hideTip();
        this.refreshVoice();

        let amount = 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num: number) => {
            amount = num;
        });
        this.initBuyFree(amount);

        this.onUpdateOpenAutoRoll(false, 0)
        // this.switchMenu(true, false);
        this.winNumAnimation.initializationState(0);
        if (this.viewInfo.lastWinAmount > 0) {
            this.winNumAnimation.showWin(this.viewInfo.lastWinAmount, true, false, true)
        } else {
            this.winNumAnimation.hideWin()
        }
        this.elementCtrl.init(this.viewInfo.elementList);
        this.m_ui.click_quick_stop_effect.active = false;

        if (this.viewInfo.remainFreeTimes) {
            this.onUpdateState(GameState.show_result);
            let multi_time = this.viewInfo.lastResultAwardUIInfo?this.viewInfo.lastResultAwardUIInfo.multi_time:2
            this.connectFreeMode(this.viewInfo.remainFreeTimes, multi_time, GameCtrl.getIns().getModel().gameInfo.free_total_times == GameCtrl.getIns().getModel().gameInfo.free_remain_times, () => {
                // GameCtrl.getIns().updateBetResult();
                this.initGameMul();
            });
        } else {
            this.initGameMul();
        }
    }

    initGameMul() {
        let data = GameCtrl.getIns().getModel().getBetData();
        if (!data.result || !data.result.round_list) {
            GameCtrl.getIns().getModel().setMultiTime(1);
        }
        let mul = data.result.round_list[data.result.round_list.length - 1].multi_time;
        if (data.free_remain_times > 0) {
            let mul = GameCtrl.getIns().getModel().getCurMinMul();
            if (mul < 2) {
                mul = 2;
                GameCtrl.getIns().getModel().setMultiTime(mul);
                this.initFreeMul(mul, false);
            } else {
                GameCtrl.getIns().getModel().setMultiTime(mul);
                this.changeCurMul(mul, false, true, true);
            }
        } else {
            if (GameCtrl.getIns().getModel().isEndFree) {
                GameCtrl.getIns().getModel().setMultiTime(1);
                this.changeCurMul(1, false, false, true);
            } else {
                if (!mul) {
                    mul = 1;
                }
                this.changeCurMul(mul, false, false, true);
            }
        }
    }

    test() {
        this.changeEnterFreeBg(10, true)
        // this.freeAgain(10)

        this.outFreeMode(1000000)
    }

    private initUIEvent() {
        this.m_ui.click_quick_stop_layer.on(NodeEventType.TOUCH_START, this.onClickQuickStop, this)

        this.m_ui.click_quick_stop_effect.getComponent(sp.Skeleton).setCompleteListener((t) => {
            this.m_ui.click_quick_stop_effect.active = false;
        })

        this.setBuyFreeBtn(true);
    }

    setBuyFreeBtn(state: boolean) {
        if (state) {
            this.m_ui.fb_btn.on(Node.EventType.MOUSE_ENTER, () => {
                Tween.stopAllByTarget(this.m_ui.fb_hover_add.getComponent(UIOpacity));
                Tween.stopAllByTarget(this.m_ui.fb_btn);
                tween(this.m_ui.fb_hover_add.getComponent(UIOpacity)).to(0.5, { opacity: 255 }).to(0.5, { opacity: 0 }).delay(0.5).union().repeatForever().start();
                tween(this.m_ui.fb_btn).to(0.1, { scale: v3(1.1, 1.1, 1.1) }).start();
            })
            this.m_ui.fb_btn.on(Node.EventType.MOUSE_LEAVE, () => {
                Tween.stopAllByTarget(this.m_ui.fb_hover_add.getComponent(UIOpacity));
                Tween.stopAllByTarget(this.m_ui.fb_btn);
                this.m_ui.fb_hover_add.getComponent(UIOpacity).opacity = 0;
                tween(this.m_ui.fb_btn).to(0.1, { scale: v3(1, 1, 1) }).start();
            })
            this.m_ui.fb_btn.getComponent(Button).interactable = true;
            this.m_ui.fb_btn.getComponent(UIOpacity).opacity = 255;
        } else {
            this.m_ui.fb_btn.off(Node.EventType.MOUSE_ENTER);
            this.m_ui.fb_btn.off(Node.EventType.MOUSE_LEAVE);
            this.m_ui.fb_btn.getComponent(UIOpacity).opacity = 128;
            this.m_ui.fb_btn.getComponent(Button).interactable = false;
        }
    }

    openBuyFreePop() {
        GameAudio.openBuyFree();
        UIManager.openPopup(EViewNames.UIBuyFree);
    }

    initBuyFree(amount: number) {
        // this.m_ui.buyFreeButton.active = BigNumber(amount).div(GameConst.BeseGold).toNumber() <= 30;
        this.m_ui.buyFreeButton.active = true;
    }

    switchMenu(active: boolean) {
        this.m_ui.buyFreeButton.active = active;
    }

    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.game_start_roll, this.onStartRoll, this);
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickSpace, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickSpace, this);
        EventCenter.getInstance().listen(BaseEvent.click_mouse, this.onClickMouse, this)
        EventCenter.getInstance().listen(GameEvent.update_game_state, this.onUpdateState, this);
        EventCenter.getInstance().listen(GameEvent.game_start_stop_roll, this.onStartStopRoll, this);
        EventCenter.getInstance().listen(GameEvent.game_roll_complete, this.onRollComplete, this);
        EventCenter.getInstance().listen(GameEvent.game_show_award_result, this.onShowAwardResult, this);
        EventCenter.getInstance().listen(GameEvent.game_clear_award_result, this.onClearAwardResultInfo, this);
        EventCenter.getInstance().listen(GameEvent.click_element, this.onShowElementRateInfo, this);
        EventCenter.getInstance().listen(GameEvent.close_bigreward, this.onCloseBigAward, this);
        EventCenter.getInstance().listen(GameEvent.game_update_open_auto_roll, this.onUpdateOpenAutoRoll, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_ready_roll_end, this.onGameAxisReadyRoll, this);
        EventCenter.getInstance().listen(GameEvent.chang_black_mask, this.onChangeBlackMask, this);
        EventCenter.getInstance().listen(GameEvent.game_update_free_num, this.setFreeNum, this);
        EventCenter.getInstance().listen(GameEvent.game_axis_roll_end, this.singleRollEnd, this);
        EventCenter.getInstance().listen(GameEvent.game_shake_screen, this.shakeScene, this);
        EventCenter.getInstance().listen(GameEvent.change_bgm_vol, this.changeAudioVol, this);

        EventCenter.getInstance().listen(PUBLIC_EVENTS.BGM_CTRL, this.refreshVoice, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.ON_SPIN, this.onSpin, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_BET_AMONUT, this.initBuyFree, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SWITCH_MENU, this.switchMenu, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.SPIN_HOVER, (cb: Function) => {
            cb(this.state == GameState.wait);
        }, this);
    }
    private rollidx = -1;
    /**单列滚动结束 */
    singleRollEnd(idx: number) {

        this.rollidx++;
        if (this.rollidx >= 5) {
            this.rollidx = 5
        }
        let num = 1;
        for (let i = 0; i <= this.rollidx; i++) {
            num *= this.elementCtrl.rollAxisList[i].elementList.length - 1;
        }
        warn("单列滚动结束", this.rollidx, num)
        this.updateWinWays(num);
        if (this.elementCtrl.isDrawsEffect && this.node.scale.x == 1 && !(GameCtrl.getIns().isFast || GameCtrl.getIns().curQuickFast || GameCtrl.getIns().curFast)) {
            this.rollidx = -1;
            this.nodeScaleTwe?.stop();
            this.nodeScaleTwe = tween(this.node).to(5, { scale: v3(1.05, 1.05, 1.05) }).start();
        }
        this.elementCtrl.sortAll();
    }

    /**更新中奖路 */
    async updateWinWays(num: number, isRun: boolean = false, isReset: boolean = false) {
        let label = this.m_ui.ways_num.getComponent(Label);
        if (isRun) {
            await CocosUtil.runScore(label, 1, num, Number(label.string), false, false, 0);
        } else if (isReset) {
            Tween.stopAllByTarget(label.node);
            label.string = ".....";
        } else {
            if (num) {
                label.string = num.toString();
            } else {
                label.string = ".....";
            }
        }
    }

    async onCloseBigAward() {
        UIManager.closeView(EViewNames.ResultBigAward);
        await this.winNumAnimation.showWin(GameCtrl.getIns().getModel().getBetData().prize, true);
        this.playerLastResultAward(true)
    }

    /**0 普通，1 免费 */
    selectGameAudio(type: 0 | 1) {
        if (AudioManager.inst._bgmEnable) {
            if (type == 0) {
                this.m_ui.bgmFree.getComponent(AudioSource).pause();
                this.m_ui.bgmA.getComponent(AudioSource).play();
                this.m_ui.bgmB.getComponent(AudioSource).play();
                this.changeAudioVol(1, 0);
            } else if (type == 1) {
                this.m_ui.bgmFree.getComponent(AudioSource).play();
                this.m_ui.bgmA.getComponent(AudioSource).pause();
                this.m_ui.bgmB.getComponent(AudioSource).pause();
            }
        }
    }

    /**0 bgmA，1 bgmB，2 bgmFree */
    changeAudioVol(type: 0 | 1 | 2, vol: number) {
        let node: Node = null;
        switch (type) {
            case 0:
                node = this.m_ui.bgmA;
                break;
            case 1:
                node = this.m_ui.bgmB;
                break;
            case 2:
                node = this.m_ui.bgmFree;
                break;

            default:
                break;
        }
        node.getComponent(AudioSource).volume = vol;
    }

    /**初始化上局中奖结果 */
    initLastAwardResult(data: TRound) {
        warn("初始化上局中奖结果", data);
        if (data) {
            this.resultAwardUIInfo = data;
            for (let index = 0; index < this.elementNodes.length; index++) {
                const element = this.elementNodes[index];
                ObjPoolCom.objPoolMgr.delElement(element)
            }
        }
    }

    showWinIcon(data: ResultAwardUIInfo) {
        return new Promise<void>((resolve, reject) => {
            if (data.win_pos_list.length > 0) {
                let count1 = 0, count2 = 0, total = 0;
                this.elementCtrl.rollAxisList.forEach((com, idx) => {
                    com.elementList.forEach((child) => {
                        if (data.win_pos_list.indexOf(child.serverIdx) > -1) {
                            total++;
                            child.playWinEffect(() => {
                                count2++;
                                log("playWinEffectCount", count2, total);
                                if (count2 == total) {
                                    this.onChangeBlackMask(false);
                                }
                            }, () => {
                                count1++;
                                log("showWinIcon", count1, idx, total)
                                if (count1 == total) {
                                    this.elementCtrl.rollAxisList.forEach(els => {
                                        els.elementList.forEach(ele => {
                                            ele.toInitNode();
                                        });
                                    });
                                    this.elementCtrl.sortAll();
                                    resolve();
                                }
                            });
                        }

                    });
                });
                if (total > 4) {
                    GameAudio.normalWinScore();
                } else {
                    GameAudio.fewIconsWin()
                }
                this.elementCtrl.sortAll();
            } else {
                resolve();
            }
        })
    }

    onChangeBlackMask(isBlack: boolean, index?: number) {
        if (isBlack) {
            this.elementCtrl.maskNodeList.forEach((op, idx) => {
                if (index !== undefined) {
                    if (index == idx) {
                        Tween.stopAllByTarget(op);
                        tween(op)
                            .to(0.1, { opacity: 170 })
                            .start();
                    }
                } else {
                    Tween.stopAllByTarget(op);
                    tween(op)
                        .to(0.1, { opacity: 170 })
                        .start();
                }
            });
        } else {
            this.elementCtrl.maskNodeList.forEach((op, idx) => {
                if (index !== undefined) {
                    if (index == idx) {
                        tween(op)
                            .to(0.5, { opacity: 0 })
                            .start();
                    }
                } else {
                    tween(op)
                        .to(0.5, { opacity: 0 })
                        .start();
                }
            });
        }
    }

    /**屏幕抖动 */
    shakeScene() {
        this.nodeShakeTwe?.stop();
        this.nodeShakeTwe = tween(this.node).by(0.02, { position: v3(-2, 0, 0) })
            .by(0.02, { position: v3(0, 2, 0) })
            .by(0.02, { position: v3(0, -4, 0) })
            .by(0.02, { position: v3(4, 2, 0) })
            .by(0.02, { position: v3(-2, 0, 0) })
            .call(() => {
                this.node.setPosition(0, 0, 0);
            })
            .start()
    }

    /**掉落动画 */
    playFallDown(fillingMsg: ClientElement[][], isDraws: boolean = false, onlyDropped: boolean = false, isTing: boolean) {
        return new Promise<void>((resolve, reject) => {
            let delayTime = 0, count = 0;
            let needNum = fillingMsg.length - 1;
            log("掉落动画needNum", needNum, fillingMsg, isDraws)
            if (isDraws) {
                let next = (idx: number) => {
                    if (idx > needNum) {
                        return;
                    }
                    let container = this.elementCtrl.rollAxisList[idx];
                    container.startFallDown(fillingMsg[idx], async () => {
                        if (count == needNum) {
                            this.elementCtrl.resetPosIdx();
                            this.elementCtrl.sortAll();
                            resolve();
                        }
                        this.shakeScene();
                        count++;
                        await CocosUtil.wait(0.1)
                        next(idx + 1);
                    }, !isDraws, null, true);
                }
                next(0);
            } else {
                for (let i = needNum; i >= 0; i--) {
                    let container = this.elementCtrl.rollAxisList[i];
                    let idx = i;
                    this.scheduleOnce(() => {
                        container.startFallDown(fillingMsg[idx], () => {
                            if (count == needNum) {
                                this.elementCtrl.resetPosIdx();
                                this.elementCtrl.sortAll();
                                resolve();
                            }
                            count++;
                        }, isDraws, onlyDropped, isTing);
                    }, delayTime)
                    if (fillingMsg[idx] && !GameCtrl.getIns().curFast) {
                        delayTime += GameConst.fallDownInterval;
                    }
                }
            }
        })
    }

    /**统计总路数 */
    calcAllWays() {
        let num = 1;
        this.elementCtrl.rollAxisList.forEach((axis) => {
            num *= axis.elementList.filter((item) => {
                return item.serverIdx > -1;
            }).length;
        });
        return num;
    }

    /**改变当前乘倍 */
    changeCurMul(mul: number, isNext: boolean, isFree: boolean = false, isContinue: boolean = false, isUpdate: boolean = false, isSkip: boolean = false) {
        return new Promise<void>((resolve, reject) => {
            let checkEnd = () => {
                if (isUpdate) {
                    GameCtrl.getIns().updateBetResult();
                }
                if (!isNext) {
                    this.elementCtrl.checkIsNeedStop(true);
                }
                resolve()
            }
            let list = GameCtrl.getIns().getModel().getCurMultipleList();
            let idx = isNext ? GameCtrl.getIns().getModel().getNextMulIdx(mul) : GameCtrl.getIns().getModel().getCurMulIdx(mul);
            warn("changeCurMul", idx, mul, GameCtrl.getIns().getModel().getCurMultipleList())
            this.m_ui.multiple_box.children.forEach((child, index) => {
                child.getChildByName("Label").getComponent(Label).string = "x" + list[index].toString();
                if (index == idx) {
                    if (idx == 0 && child.getChildByName("Label").scale.x == 1 && !isFree) {
                        child.getChildByName("guangqiu").active = false;
                        checkEnd();
                        return;
                    }
                    child.getChildByName("Label").getComponent(UIOpacity).opacity = 255;
                    if (!isFree && idx == 0) {
                        child.getChildByName("Label").setScale(1, 1, 1);
                        child.getChildByName("guangqiu").active = false;
                        checkEnd();
                    } else if (!isFree && idx == 3) {
                        child.getChildByName("Label").setScale(1, 1, 1);
                        !child.getChildByName("guangqiu").active && CocosUtil.playSpineAnim(child.getChildByName("guangqiu"), "guangqiu_idle", true);
                        checkEnd();
                    } else {
                        if (isContinue || isSkip) {
                            CocosUtil.playSpineAnim(child.getChildByName("guangqiu"), "guangqiu_idle", true);
                            child.getChildByName("Label").setScale(1, 1, 1);
                            checkEnd();
                        } else {
                            GameAudio.mulChange();
                            CocosUtil.playSpineAnim(child.getChildByName("guangqiu"), "guangqiu_in", false, () => {
                                CocosUtil.playSpineAnim(child.getChildByName("guangqiu"), "guangqiu_idle", true);
                            })
                            tween(child.getChildByName("Label")).to(0.2, { scale: v3(1.3, 1.3, 1.3) }).call(() => {
                                checkEnd();
                            }).to(0.1, { scale: v3(1, 1, 1) }).start();
                        }
                    }
                } else {
                    if (isFree) {
                        tween(child.getChildByName("Label").getComponent(UIOpacity)).to(0.2, { opacity: 128 }).start();
                        child.getChildByName("Label").setScale(0.7, 0.7, 0.7);
                        child.getChildByName("guangqiu").active = false;
                    } else {
                        child.getChildByName("Label").getComponent(UIOpacity).opacity = 128;
                        child.getChildByName("Label").setScale(0.7, 0.7, 0.7);
                        child.getChildByName("guangqiu").active = false;
                    }
                }
            })
        })
    }

    showIconTingPai() {
        return new Promise<void>((resolve, reject) => {
            this.m_ui.ting_deng.active = true;
            CocosUtil.playSpineAnim(this.m_ui.ting_deng, "xiaochu_ting", true);
            this.elementCtrl.rollAxisList.forEach((axis) => {
                axis.elementList.forEach((ele) => {
                    ele.showDrawsEffect();
                })
            })
            this.scheduleOnce(() => {
                resolve();
            }, 2.9)
        })
    }

    isHasDraws(data: number[]) {
        let sum = data.filter((item) => {
            return item == TItemtype.ITEM_TYPE_SCATTER;
        }).length;
        return sum >= this.elementCtrl.freeLimit - 1;
    }

    async onShowAwardResult(data: ResultAwardUIInfo) {
        console.log("onShowAwardResult", data);
        this.resultAwardUIInfo = data;
        if (data?.prize_list?.length > 0) {
            let fillList = [];
            data.dyadic_list.forEach((list, idx) => {
                if (!list.list || list.list.length == 0) {
                    return;
                }
                let temp: number[] = JSON.parse(JSON.stringify(list.list));
                fillList[idx] = GameCtrl.getIns().getModel().elementChangeClient(temp.reverse()).reverse();
            });
            if (data.multi_time >= 2 && !GameCtrl.getIns().getModel().isFree()) {
                Tween.stopAllByTarget(this.m_ui.bgmB)
                this.changeAudioVol(0, 0);
                this.changeAudioVol(1, 1);
            }
            let hasDraw = this.isHasDraws(data.item_type_list);
            this.onChangeBlackMask(true);
            this.winNumAnimation.showWin(data.win, false);
            this.playAddWinAnimation()//播放加钱奖金
            // await CocosUtil.wait(0.5);
            await this.showWinIcon(data);
            await this.changeCurMul(data.multi_time, true, GameCtrl.getIns().getModel().isFree());
            if (hasDraw) {
                await this.playFallDown([null, null, null, null, null, null], false, true, hasDraw);
                let scatterNum = 0;
                this.elementCtrl.rollAxisList.forEach((axis) => {
                    axis.elementList.forEach((ele) => {
                        if (ele.id == TItemtype.ITEM_TYPE_SCATTER) {
                            scatterNum++;
                        }
                    })
                })
                this.winNumAnimation.tingPai(scatterNum >= 4);
                await this.showIconTingPai();
            }
            await this.playFallDown(fillList, hasDraw, null, hasDraw);
            // this.elementCtrl.elementsSort(this.m_ui.ItemContainerBottom);
            this.updateWinWays(this.calcAllWays(), true, false);
            if (hasDraw) {
                this.m_ui.ting_deng.active = false;
            }
            // this.checkGameData();
            if (GameCtrl.getIns().getModel().isFree()) {
                GameCtrl.getIns().getModel().isShowLongJuan = false;
            }
            GameCtrl.getIns().showResultAward();
            this.checkIsCorrect()
        } else {
            log("playerLastResultAward", data);
            let totalWin = GameCtrl.getIns().getModel().getBetData().prize;
            let level = await GameCtrl.getIns().showBigWin(totalWin);
            if (level == 0) {
                if (totalWin > 0) {
                    await this.winNumAnimation.showWin(totalWin, true);
                    await CocosUtil.wait(0.3);
                } else {
                    this.winNumAnimation.hideWin();
                }
                this.playerLastResultAward(totalWin > 0 || GameCtrl.getIns().autoRollCnt > 0);
                if (data && data.multi_time >= 3 && !GameCtrl.getIns().getModel().isFree()) {
                    let time = 5, now = new Date().getTime();
                    tween(this.m_ui.bgmB).call(() => {
                        let c = (new Date().getTime() - now) / 1000 / time;
                        if (c > 1) {
                            c = 1;
                            Tween.stopAllByTarget(this.m_ui.bgmB)
                        }
                        c = 1 - c;
                        this.changeAudioVol(1, c);
                    }).delay(0.000001).union().repeatForever().start();

                    tween(this.m_ui.bgmA).call(() => {
                        let c = (new Date().getTime() - now) / 1000 / time;
                        if (c > 1) {
                            c = 1;
                            Tween.stopAllByTarget(this.m_ui.bgmB)
                        }
                        this.changeAudioVol(0, c);
                    }).delay(0.000001).union().repeatForever().start();
                }
            }
        }
    }

    checkIsCorrect() {
        this.elementCtrl.rollAxisList.forEach((ele) => {
            ele.elementList.forEach((els) => {
                if (els.serverIdx > -1 && this.resultAwardUIInfo.item_type_list[els.serverIdx] != els.id) {
                    debugger
                }
            })
        })
    }

    /**百搭抖动 */
    versatileJitter() {
        this.elementCtrl.rollAxisList.forEach(axis => {
            axis.elementList.forEach((ele) => {
                if (ele.serverIdx > 0 && ele.serverIdx < Infinity) {
                    if (ele.id == TItemtype.ITEM_TYPE_WILD) {
                        ele.spine.active = true;
                        ele.spine.children.forEach((node, idx) => {
                            if (idx == 0) {
                                node.active = true;
                                let sps = node.getComponent(sp.Skeleton);
                                if(sps){
                                    sps.setAnimation(0, "spawn", false);
                                    sps.setCompleteListener(() => {
                                        sps.setAnimation(0, "idle", true);
                                        sps.setCompleteListener(null);
                                    })
                                }
                            } else {
                                node.active = false;
                            }
                        });
                    }
                }
            });
        });
    }

    playScatterWin() {
        return new Promise<void>((resolve, reject) => {
            GameAudio.winFree();
            let count = 0, total = 0;
            this.elementCtrl.rollAxisList.forEach((axis) => {
                axis.elementList.forEach((com) => {
                    if (com.id == TItemtype.ITEM_TYPE_SCATTER) {
                        total++
                        com.playScatterWin(() => {
                            count++;
                            if (count == total) {
                                resolve();
                            }
                        });
                    }
                });
            });
        })
    }

    async initFreeMul(mul: number, isSkip: boolean) {
        warn("initFreeMul")
        if (!isSkip) {
            let list = GameCtrl.getIns().getModel().getSelectMultipleList(mul);
            for (let i = 0; i < this.m_ui.multiple_box.children.length; i++) {
                let child = this.m_ui.multiple_box.children[i];
                child.getChildByName("Label").setScale(0.7, 0.7, 0.7);
                child.getChildByName("guangqiu").active = false;
                child.getChildByName("Label").getComponent(UIOpacity).opacity = i == 0 ? 255 : 128;
                child.getChildByName("Label").getComponent(Label).string = "x" + list[i];
            }
            this.m_ui.multiple_top_box.removeAllChildren();
        }
        await this.refreshFreeMul(mul, isSkip);
    }

    refreshFreeMul(mul: number, isSkip: boolean) {
        return new Promise<void>(async (resolve, reject) => {
            if (!isSkip) {
                CocosUtil.playSpineAnim(this.m_ui.multi_refresh, "multi_refresh", false);
                GameAudio.refreshMul();
                this.m_ui.multiple_box.children[0].getChildByName("Label").getComponent(UIOpacity).opacity = 128;
                for (let i = 0; i < this.m_ui.multiple_box.children.length; i++) {
                    let node = this.m_ui.multiple_box.children[i];
                    let idx = i;
                    let newNode = instantiate(node);
                    this.m_ui.multiple_top_box.addChild(newNode);
                    tween(newNode.getChildByName("Label").getComponent(UIOpacity)).to(0.2, { opacity: 255 }).start();
                    tween(newNode.getChildByName("Label")).to(0.2, { scale: v3(1, 1, 1) }).to(0.2, { scale: v3(0.7, 0.7, 0.7) }).call(() => {
                        node.active = false;
                        if (idx == this.m_ui.multiple_box.children.length - 1) {
                            this.m_ui.multiple_box.children.forEach((item) => {
                                item.active = true;
                                item.getChildByName("Label").getComponent(UIOpacity).opacity = 255;
                            })
                            this.changeCurMul(mul, false, true, false, true);
                            this.m_ui.multiple_top_box.removeAllChildren();
                            resolve();
                        }
                    }).start();
                    await CocosUtil.wait(0.2);
                }
            } else {
                this.changeCurMul(mul, false, true, false, true, isSkip);
                resolve();
            }
        })
    }

    async enterFree() {
        EventCenter.getInstance().fire(GameEvent.show_or_hide_free_tips, true);
        await this.playScatterWin();
        let freeNum = GameCtrl.getIns().getModel().getBetData().free_total_times;

        this.m_ui.free_start_box.active = true;
        this.m_ui.free_start_box.getComponent(UIOpacity).opacity = 255;
        this.m_ui.button_start.active = false;
        this.m_ui.button_start.setScale(0, 0, 0);
        CocosUtil.playSpineAnim(this.m_ui.freein, "freein_idle_" + freeNum, false);

        this.scheduleOnce(() => {
            this.winNumAnimation.hideWin();
            this.changeEnterFreeBg(freeNum);

            this.m_ui.button_start.active = true;

            tween(this.m_ui.free_start_box.getComponent(UIOpacity)).delay(5).to(1, { opacity: 0 }).call(() => {
                this.onCloseFreeIn();
            }).start();

            tween(this.m_ui.button_start).to(0.5, { scale: v3(1, 1, 1) }, { easing: easing.backOut }).call(() => {

                EventCenter.getInstance().listen(GameEvent.key_down_space, this.onCloseFreeIn, this);
                EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onCloseFreeIn, this);
            }).start()
        }, 1)

        let t = new Date().getTime(), total = 1300;
        this.m_ui.free_load_num.active = true;
        this.m_ui.free_load_num.getComponent(Label).string = "0";
        this.m_ui.free_load_num.getComponent(UIOpacity).opacity = 0;
        this.m_ui.free_load_num.setScale(0, 0, 0);
        tween(this.m_ui.free_load_num.getComponent(UIOpacity)).to(0.1, { opacity: 255 }).start();
        tween(this.m_ui.free_load_num).to(0.1, { scale: v3(1, 1, 1) }).start();
        tween(this.m_ui.free_load_num).delay(0.001).call(() => {
            let now = new Date().getTime();
            let c = (now - t) / total;
            if (c > 1) {
                c = 1;
                this.m_ui.free_load_num.active = false;
                Tween.stopAllByTarget(this.m_ui.free_load_num);
            }
            this.m_ui.free_load_num.getComponent(Label).string = Math.floor(c * 100).toString();
        }).union().repeatForever().start();
    }

    /**接续免费 */
    connectFreeMode(freeNum: number, mul: number, isIntoFree: boolean, cb?: Function) {
        if (isIntoFree) {
            GameCtrl.getIns().getModel().mode = GameMode.into_free;
        } else {
            GameCtrl.getIns().getModel().mode = GameMode.free;
        }
        this.changeEnterFreeBg(freeNum, true);
        this.scheduleOnce(() => {
            this.resumeSpin();
            cb && cb();
        }, 0.5);
    }

    setFreeNum(num: number, isRun: boolean = false) {
        if (!isRun) {
            if (num == 0) {
                this.m_ui.free_last.active = true;
                this.m_ui.remain_times.active = false;
                this.m_ui.free_times_num.active = false;
            } else {
                this.m_ui.free_last.active = false;
                this.m_ui.remain_times.active = true;
                this.m_ui.free_times_num.active = true;
            }
            this.m_ui.free_times_num.getComponent(Label).string = num.toString();
        }
    }

    freeAgain(freeNum: number) {
        GameAudio.winFreeAdd();
        this.onChangeBlackMask(true);
        this.m_ui.free_again.active = true;
        this.m_ui.free_again.getComponent(UIOpacity).opacity = 255;
        this.m_ui.free_again_num.getComponent(Label).string = freeNum.toString();
        this.m_ui.free_again_num.getComponent(UIOpacity).opacity = 0;
        this.m_ui.free_last.active = false;
        this.m_ui.remain_times.active = true;
        this.m_ui.free_times_num.active = true;
        tween(this.m_ui.free_again_num.getComponent(UIOpacity)).delay(0.2).call(() => {
            tween(this.m_ui.free_again_num).to(0.2, { scale: v3(2.2, 2.2, 2.2) }).to(0.2, { scale: v3(2, 2, 2) }).start();
        }).to(0.2, { opacity: 255 }).start();
        CocosUtil.playSpineAnim(this.m_ui.free_again, "free_add", false);
        tween(this.m_ui.free_again.getComponent(UIOpacity)).delay(3).to(0.5, { opacity: 0 }).start();
        let num = 0;
        tween(this.m_ui.free_times_num).call(() => {
            num = Number(this.m_ui.free_times_num.getComponent(Label).string) + 1;
            this.m_ui.free_times_num.getComponent(Label).string = num.toString();
            this.m_ui.free_times_num.getComponent(UIOpacity).opacity = 0;
            tween(this.m_ui.free_times_num.getComponent(UIOpacity)).to(0.05, { opacity: 255 }).start();
        }).by(0.05, { position: v3(0, 10, 0) }).by(0.05, { position: v3(0, -10, 0) }).call(() => {
            GameAudio.freeAddNum();
            CocosUtil.playSpineAnim(this.m_ui.mf_guan, "free_add_light", false, () => {
                this.m_ui.mf_guan.active = false;
            })
            if (num == GameCtrl.getIns().getModel().getBetData().free_remain_times) {
                Tween.stopAllByTarget(this.m_ui.free_times_num);
                Tween.stopAllByTarget(this.m_ui.free_again.getComponent(UIOpacity));
                tween(this.m_ui.free_again.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).start();
                this.onChangeBlackMask(false);
                this.scheduleOnce(() => {
                    this.resumeSpin();
                }, 0.5);
            }
        }).delay(0.1).union().repeatForever().start();
    }

    changeEnterFreeBg(freeNum: number, skipJump?: boolean) {
        log("changeEnterFreeBg", freeNum);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_STATUS, false);
        this.m_ui.SlotBg.getComponent(Sprite).spriteFrame = this.freeSpriteFrame[0];
        this.m_ui.ways_bar.getComponent(Sprite).spriteFrame = this.freeSpriteFrame[1];
        this.m_ui.normal_bg_idle.active = false;
        this.m_ui.GameBg.active = false;
        this.m_ui.freeGameBg.active = true;
        this.m_ui.free_bj_idle_normal.active = true;

        this.m_ui.AutoBtn.active = false;
        this.m_ui.buyFreeButton.active = false;
        this.m_ui.free_bg.active = true;
        this.m_ui.remain_times.active = true;
        this.m_ui.free_last.active = false;
        this.setFreeNum(freeNum);
        this.m_ui.Btns.active = false;
        this.changeCoinInfoLocal(true);
    }

    recoverNormalBg() {
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_STATUS, false);
        this.onUpdateOpenAutoRoll(GameCtrl.getIns().autoRollCnt > 0, GameCtrl.getIns().autoRollCnt);
        this.m_ui.SlotBg.getComponent(Sprite).spriteFrame = this.normalSpriteFrame[0];
        this.m_ui.ways_bar.getComponent(Sprite).spriteFrame = this.normalSpriteFrame[1];
        this.m_ui.normal_bg_idle.active = true;
        this.m_ui.GameBg.active = true;
        this.m_ui.freeGameBg.active = false;
        this.m_ui.free_bj_idle_normal.active = false;

        this.m_ui.free_bg.active = false;
        this.m_ui.remain_times.active = false;
        this.m_ui.free_last.active = false;
        this.m_ui.Btns.active = true;
        this.m_ui.buyFreeButton.active = true;
        this.changeCoinInfoLocal(false);

        GameCtrl.getIns().getModel().setMultiTime(1);
        this.changeCurMul(1, false, false, true);
    }

    changeCoinInfoLocal(isFree: boolean) {
        if (isFree) {
            this.m_ui.CoinInfo.setParent(this.m_ui.coin_info_box);
            this.m_ui.CoinInfo.setPosition(0, 0, 0);
            this.m_ui.CoinInfo.children.forEach((child) => {
                let button = child.getComponent(Button);
                button.interactable = true;
                button.enabled = false;
            });
        } else {
            this.m_ui.CoinInfo.setParent(this.m_ui.Btns);
            this.m_ui.CoinInfo.setPosition(0, 137.416, 0);
            this.m_ui.CoinInfo.children.forEach((child) => {
                child.getComponent(Button).enabled = true;
            });
        }
    }

    onCloseFreeIn() {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onCloseFreeIn, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onCloseFreeIn, this);

        GameAudio.freeAward();
        this.m_ui.button_start.getComponent(Button).interactable = false;
        log("onCloseFreeIn")
        Tween.stopAllByTarget(this.m_ui.button_start);
        Tween.stopAllByTarget(this.m_ui.free_start_box);
        Tween.stopAllByTarget(this.m_ui.free_in_bg);
        Tween.stopAllByTarget(this.m_ui.free_start_box.getComponent(UIOpacity));
        EventCenter.getInstance().fire(GameEvent.show_or_hide_free_tips, false);
        tween(this.m_ui.button_start).to(0.2, { scale: v3(0, 0, 0) }).call(() => {
            tween(this.m_ui.free_start_box.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).call(async () => {
                this.m_ui.free_start_box.active = false;
                this.m_ui.button_start.getComponent(Button).interactable = true;
                // GameAudio.switchBgm(BgmType.free);
                this.selectGameAudio(1);
                this.changeAudioVol(2, 1);
                GameCtrl.getIns().getModel().setMultiTime(2);
                await this.initFreeMul(2, false);
                this.resumeSpin();
            }).start();
        }).start();
    }

    outFreeMode(win: number) {
        this.m_ui.free_start_box.active = false;
        this.m_ui.free_end_box.active = true;
        Tween.stopAllByTarget(this.m_ui.button_end);
        this.m_ui.button_end.getComponent(Button).interactable = false;
        this.m_ui.button_end.setScale(0, 0, 0);
        this.m_ui.free_end_box.getComponent(Button).interactable = false;
        this.m_ui.free_end_box.getComponent(UIOpacity).opacity = 255;
        this.m_ui.win_free_total_times_num.getComponent(Label).string = "";
        // this.m_ui.free_label_content.setScale(0, 0, 0);
        // this.m_ui.free_end.getComponent(UIOpacity).opacity = 0;
        this.changeAudioVol(2, 0);
        GameAudio.freeFireWorks();
        CocosUtil.playSpineAnim(this.m_ui.free_end, "tw_vfx_in", false, () => {
            CocosUtil.playSpineAnim(this.m_ui.free_end, "tw_vfx_idle", true);
        })
        this.scheduleOnce(() => {
            tween(this.m_ui.win_free_total_times_num).to(0.2, { scale: v3(2, 2, 2) }).to(0.2, { scale: v3(1, 1, 1) }).start();
            this.scheduleOnce(() => {
                EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickFreeEnd, this);
                EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickFreeEnd, this);
                this.m_ui.free_end_box.getComponent(Button).interactable = true;
            }, 1);
            this.m_ui.win_free_total_times_num.getComponent(Label).string = "0";
            GameAudio.freeSettlement();
            CocosUtil.runScore(this.m_ui.win_free_total_times_num.getComponent(Label), 3.8, win, 0).then(() => {
                this.onClickFreeEnd();
            })
        }, 0.5)
    }

    outFreeRunEnd() {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickFreeEnd, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickFreeEnd, this);
        this.recoverNormalBg();
        GameAudio.freeSettlementEnd();
        CocosUtil.playSpineAnim(this.m_ui.free_end_guang, "tw_vfx_queren", false, () => {
            this.m_ui.free_end_guang.active = false;
        });
        this.selectGameAudio(0);
        this.changeAudioVol(0, 1);
        let time = 7, now = new Date().getTime();
        let id = setInterval(() => {
            let c = (new Date().getTime() - now) / 1000 / time;
            if (c > 1) {
                c = 1;
                clearInterval(id);
            }
            this.changeAudioVol(0, c);
        }, 16)
        Tween.stopAllByTarget(this.m_ui.win_free_total_times_num);
        this.m_ui.free_end_box.getComponent(Button).interactable = false;
        this.m_ui.win_free_total_times_num.getComponent(Label).string = new BigNumber(GameCtrl.getIns().getModel().getBetData().free_game_total_win).div(GameConst.BeseGold).toFixed(2);
        tween(this.m_ui.win_free_total_times_num).to(0.1, { scale: v3(1.2, 1.2, 1.2) }).call(() => {

            tween(this.m_ui.free_end_box).delay(5).call(() => {
                this.onClickFreeButton();
            }).start();

            tween(this.m_ui.button_end).to(0.2, { scale: v3(1.2, 1.2, 1.2) }).to(0.1, { scale: v3(1, 1, 1) }).call(() => {
                this.m_ui.button_end.getComponent(Button).interactable = true;

                EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickFreeButton, this);
                EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickFreeButton, this);
            }).start();
        }).start();
    }

    onClickFreeButton() {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickFreeButton, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickFreeButton, this);

        GameAudio.freeAward();
        this.m_ui.free_end_box.getComponent(Button).interactable = false;
        this.m_ui.button_end.getComponent(Button).interactable = false;
        Tween.stopAllByTarget(this.m_ui.free_end_box);
        tween(this.m_ui.free_end_box.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).call(async () => {
            this.m_ui.free_end_box.getComponent(Button).interactable = true;
            this.m_ui.free_start_box.active = false;
            this.m_ui.free_end_box.active = false;
            this.changeCoinInfoLocal(false);
            this.m_ui.button_end.getComponent(Button).interactable = true;
            this.m_ui.free_end_box.getComponent(Button).interactable = true;
            // GameAudio.switchBgm(BgmType.normal);
            let winAmount = 0;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_WIN_AMOUNT, (num) => {
                winAmount = num;
            })
            this.winNumAnimation.showWin(winAmount, true, false);
            await CocosUtil.wait(0.5);
            GameCtrl.getIns().getModel().mode = GameMode.normal;
            this.resumeSpin();
        }).start();
    }

    onClickFreeEnd() {
        this.outFreeRunEnd();
    }

    /**播放最后的结算动画 */
    async playerLastResultAward(isDelay: boolean) {
        this.curMode = GameMode.normal;
        this.versatileJitter();
        this.onUpdateState(GameState.delay)
        // if (isDelay) {
        await CocosUtil.wait(0.7)
        // } else {
        //     await CocosUtil.wait(0.1)
        // }
        if (this.state == GameState.delay) {//防止按了空格键 重新旋转改变了状态
            if (GameCtrl.getIns().getModel().isIntoFree()) {
                this.enterFree();
            } else if (GameCtrl.getIns().getModel().isFreeAgain()) {
                this.freeAgain(GameCtrl.getIns().getModel().getBetData().result.free_play);
            } else if (GameCtrl.getIns().getModel().isLastFree()) {
                this.outFreeMode(new BigNumber(GameCtrl.getIns().getModel().getBetData().free_game_total_win).div(GameConst.BeseGold).toNumber());
            } else {
                this.resumeSpin();
            }
        }
    }

    /**恢复旋转 */
    async resumeSpin() {
        this.onUpdateState(GameState.wait)
        GameCtrl.getIns().checkAutoRoll()
        this.elementCtrl.resultData = null;
    }

    playAddWinAnimation() {
        log("playAddWinAnimation", this.resultAwardUIInfo);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.ADD_WIN, this.resultAwardUIInfo.win)
        EventCenter.getInstance().fire(PUBLIC_EVENTS.ADD_BALANCE, this.resultAwardUIInfo.balance)
    }

    onClearAwardResultInfo() {
        !GameCtrl.getIns().getModel().isFree() && !GameCtrl.getIns().getModel().isIntoFree() && EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_WIN_AMOUNT, 0);
        this.elementCtrl.restRandomElementList();
        this.winNumAnimation.hideWin()
        this.updateWinWays(0, false, true);
        if (GameCtrl.getIns().getModel().isFree()) {
            let isWin = GameCtrl.getIns().getModel().getAuthoritiesWin() > 0;
            let mul = 1;
            if (isWin) {
                mul = GameCtrl.getIns().getModel().getCurMinMul() + 1;
            } else {
                mul = GameCtrl.getIns().getModel().getCurMinMul()
            }
            GameCtrl.getIns().getModel().setMultiTime(mul);
            this.initFreeMul(mul, !isWin);
        } else if (GameCtrl.getIns().getModel().isIntoFree()) {

        } else {
            GameCtrl.getIns().getModel().setMultiTime(1);
            this.changeCurMul(1, false, false, false, true);
        }
    }

    /**显示元素赔率提示 */
    onShowElementRateInfo(com: ElementCom) {
        if (this.state != GameState.wait) {
            return;
        }
        this.clickElementRateTip.showTip(com)
        GameAudio.clickShowRateTip()
    }

    /**滚动完成 */
    onRollComplete() {
        warn("滚动完成");
        this.rollidx = -1;
        AudioManager.inst.stopMusic();
        this.elementCtrl.elementsSort(this.m_ui.ItemContainerBottom);
        GameCtrl.getIns().showResultAward()

        this.nodeScaleTwe?.stop();
        this.nodeScaleTwe = tween(this.node).to(0.3, { scale: v3(1, 1, 1) }).call(() => {
            this.node.setScale(1, 1, 1);
        }).start();
        // this.checkGameData();
    }

    async onStartStopRoll(info: { data: any }) {
        let datas = info.data
        log("onStartStopRoll", datas);
        this.elementCtrl.isDraws(datas);
        this.elementCtrl.setAxisDraws();
        this.elementCtrl.stopRoll();
    }

    onClickMouse(name: string) {
        if (name != "btn_spine") {
            // GameAudio.clickSystem();
        }
    }

    onStartRoll(isFast: boolean) {
        this.clickElementRateTip.hideTip();
        this.elementCtrl.startRoll(isFast);
        GameAudio.juanzhouRoll()
    }

    enabledButton(button: Button, enabled: boolean) {
        button.interactable = enabled;
        CocosUtil.setNodeOpacity(button.node, enabled ? 255 : 110)
    }

    onUpdateState(state: GameState) {
        if (this.state == state) {
            return;
        }
        warn("当前游戏状态", GameState[state]);
        let waitState = state == GameState.wait && GameCtrl.getIns().autoRollCnt <= 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_AUTO_STATUS, !waitState, true);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BTNS_STYLE, waitState, waitState);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.SHOW_SPIN_HOVER, state == GameState.wait);

        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_STATUS, null, (state == GameState.wait || state == GameState.roll || state == GameState.start_stop_roll));

        if (GameCtrl.getIns().getModel().isFree()) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_THREE_BTNS_STATUS, false);
        } else {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_THREE_BTNS_STATUS, state == GameState.wait);
        }
        switch (state) {
            case GameState.wait:
                EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BTNS_STATUS);
                EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_LABEL_COLOR, true)
                EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "", false, waitState)
                this.setBuyFreeBtn(true);
                break;
            case GameState.roll:
                this.setBuyFreeBtn(false);
                EventCenter.getInstance().fire(PUBLIC_EVENTS.SET_LABEL_COLOR, false)
                this.showSpinAnim();
                break;
            case GameState.start_stop_roll:
                break;
            case GameState.show_result:
                // EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "", true)
                break;
            case GameState.cancel_roll:
                // EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "click_speed")
                break;
            default:
                break;
        }
        this.state = state;
        this.spinPointer();
    }

    showAllScatterExit() {
        this.elementCtrl.rollAxisList.forEach((axis) => {
            axis.elementList.forEach((els) => {
                els.scatterExit();
            })
        })
    }

    onSpin(isBuyFree: boolean) {
        log("onSpin");
        if (this.state == GameState.wait) {
            GameAudio.startSpin()
            this.elementCtrl.resultData = null;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "anniu_spin", false, false)
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, false, true)
            GameCtrl.getIns().reqRoll(isBuyFree);
            this.showAllScatterExit();
        } else if (this.state == GameState.roll) {
            GameCtrl.getIns().cancelDelayShowResult()
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true, true)
        } else if (this.state == GameState.start_stop_roll) {
            GameCtrl.getIns().curQuickFast = true;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true)
        }
    }

    showSpinAnim() {
        CocosUtil.playSpineAnim(this.m_ui.bj_spin, "bj_spin", false, () => {
            this.m_ui.bj_spin.active = false;
        })

    }

    onClickSpace() {
        let popCount = 0;
        for (const key in EUILayer) {
            let num = Number(key);
            if (!isNaN(num)) {
                if (num != 0 && num != 4) {
                    popCount += UIManager.getLayer(num).children.length;
                }
            }
        }
        if (popCount > 0 || this.m_ui.Menu2.active) {
            return;
        }
        if (this.state == GameState.delay && this.m_ui.AutoBtn.active) {
            GameCtrl.getIns().cancelAutoRoll()
            return;
        }
        if (this.state == GameState.wait) {
            if (this.m_ui.AutoBtn.active) {
                GameCtrl.getIns().cancelAutoRoll()
            } else {
                GameAudio.startSpin()
                EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "anniu_spin", false, false)
                GameCtrl.getIns().reqRoll();
                this.showAllScatterExit();
                EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, false, true)
            }
        } else if (this.state == GameState.roll) {
            GameCtrl.getIns().cancelDelayShowResult()
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true, true)
        } else if (this.state == GameState.start_stop_roll) {
            GameCtrl.getIns().curQuickFast = true;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true)
        }
    }

    checkListHasScatter(list: ElementCom[]) {
        for (let i = 0; i < list.length; i++) {
            let com = list[i];
            if (com.serverIdx > -1 && com.serverIdx < Infinity) {
                if (com.id == TItemtype.ITEM_TYPE_SCATTER) {
                    return true;
                }
            }
        }
        return false;
    }

    onGameAxisReadyRoll(idx: number) {
        if (GameCtrl.getIns().curFast) {
            if (idx == this.elementCtrl.rollAxisList.length - 1) {
                let hasSc = false;
                for (let i = 0; i < this.elementCtrl.rollAxisList.length; i++) {
                    let axis = this.elementCtrl.rollAxisList[i];
                    if (this.checkListHasScatter(axis.elementList)) {
                        hasSc = true;
                        break;
                    }
                }
                if (hasSc) {
                    GameAudio.scatterStop();
                } else {
                    GameAudio.turboRollStop();
                }
            }
        } else {
            let hasSc = this.checkListHasScatter(this.elementCtrl.rollAxisList[idx].elementList);
            if (hasSc) {
                GameAudio.scatterStop();
            } else {
                GameAudio.normalRollStop();
            }
        }
    }

    onUpdateOpenAutoRoll(isOpen: boolean, cnt: number = 0) {
        let flag = !(cnt > 0) && this.state == GameState.wait;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_THREE_BTNS_STATUS, flag);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_BTNS_STYLE, flag, flag);

        this.setBuyFreeBtn(flag);
        EventCenter.getInstance().fire(PUBLIC_EVENTS.UPDATE_AUTO_ROLL, isOpen, cnt, this.state == GameState.wait);
        if (this.state == GameState.wait) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_SPIN_ANIM, "", false, true);
        }
    }

    onClickQuickStop(event: EventTouch) {
        event.preventSwallow = true
        if (this.state == GameState.roll) {
            if (GameCtrl.getIns().getModel().isShowLongJuan) {
                return;
            }
            GameCtrl.getIns().cancelDelayShowResult()
            let pos1 = v3(event.touch.getUILocationX(), event.touch.getUILocationY(), 0)
            let pos2 = this.m_ui.click_quick_stop_effect.parent.getComponent(UITransform).convertToNodeSpaceAR(pos1);
            this.m_ui.click_quick_stop_effect.setPosition(pos2)
            this.m_ui.click_quick_stop_effect.active = true;
            this.m_ui.click_quick_stop_effect.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true, true)
        } else if (this.state == GameState.start_stop_roll) {
            if (GameCtrl.getIns().getModel().isShowLongJuan) {
                return;
            }
            GameCtrl.getIns().curQuickFast = true;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, true)
            let arr = this.elementCtrl.rollAxisList.filter((axis) => {
                return axis.isDraws;
            })
            if (arr.length) {
                let pos1 = v3(event.touch.getUILocationX(), event.touch.getUILocationY(), 0)
                let pos2 = this.m_ui.click_quick_stop_effect.parent.getComponent(UITransform).convertToNodeSpaceAR(pos1);
                this.m_ui.click_quick_stop_effect.setPosition(pos2)
                this.m_ui.click_quick_stop_effect.active = true;
                this.m_ui.click_quick_stop_effect.getComponent(sp.Skeleton).setAnimation(0, "animation", false)
            }
        }
    }

    spinPointer() {
        if (this.state == GameState.wait) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_STATE, 0)
        } else if (this.state == GameState.roll) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_STATE, 1)
        } else if (this.state == GameState.cancel_roll || this.state == GameState.start_stop_roll) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_STATE, 2)
        } else if (this.state == GameState.show_result || this.state == GameState.delay) {
            EventCenter.getInstance().fire(PUBLIC_EVENTS.CHANGE_POINTER_STATE, 3)
        }
    }

    private refreshVoice() {
        let bEnable = !LoginCtrl.getIns().getModel().getPlayerInfo().mute;
        AudioManager.inst.setAllEnabled(bEnable);
        this.bgmMute();
        EventCenter.getInstance().fire(PUBLIC_EVENTS.REFESH_VOICE_BTN, bEnable);
        console.log("GameCtrl.getIns().getModel().isFree()", GameCtrl.getIns().getModel().isFree());
        if (GameCtrl.getIns().getModel().isFree()) {
            // GameAudio.switchBgm(BgmType.free);
            this.selectGameAudio(1);
        } else {
            // GameAudio.switchBgm(BgmType.normal);
            this.selectGameAudio(0);
        }
    }

    bgmMute() {
        this.m_ui.specialMusic.children.forEach((child) => {
            child.getComponent(AudioSource).pause();
        })
    }
}


