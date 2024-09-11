import { _decorator, Component, Label, Node, sp, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, v3, warn } from 'cc';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import CHandler from '../../kernel/core/datastruct/CHandler';
import CocosUtil from '../../kernel/compat/CocosUtil';
import GameCtrl from '../../ctrls/GameCtrl';
import BigNumber from 'bignumber.js';
import GameConst from '../../define/GameConst';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import { AudioManager } from '../../kernel/compat/audio/AudioManager';
import { PUBLIC_EVENTS } from '../../event/PublicEvents';
import { instantiate } from 'cc';
import { game } from 'cc';
const { ccclass, property } = _decorator;

window["marquee"] = {
    nextDelayTime: 0.3,
    stillDuration: 2,
    moveSpeed: 90
}

@ccclass('WinAwardNumAnimation')
export class WinAwardNumAnimation extends Component {

    @property(SpriteFrame)
    labelSprites: SpriteFrame[] = [];

    @property(sp.Skeleton)
    topSpS: sp.Skeleton[] = [];

    @property(Node)
    topSpS3: Node = null;

    @property(Node)
    tips: Node = null;

    @property(Node)
    tipsBottom: Node = null;

    @property(Node)
    moveLabel: Node = null;
    
    @property(Node)
    ting: Node = null;

    @property(Sprite)
    moveContent: Sprite = null;

    @property(Label)
    winNum: Label = null;

    private _marqueeIdx: number = -1;
    private _maxWidth: number = 540;
    private _curLevel: number = 0;
    private _rollRate: number = 3;
    private _maxRollRate: number = 5;
    private _rollTime: number = 2;
    private _targetNum: number = 0;
    private _promise: Function = null;
    private _curIdx: number = -1;

    protected start(): void {
        CocosUtil.addClickEvent(this.node.getChildByName("quick_run_top_score"), this.onClickSpace, this);
        EventCenter.getInstance().listen(GameEvent.game_show_top_ting, this.tingPai, this);
        EventCenter.getInstance().listen(GameEvent.show_or_hide_free_tips, this.showOrHideFreeTips, this);
    }

    tingPai(isAward: boolean) {
        if (!isAward) {
            if (!this.ting.active) {
                this.ting.active = true;
                this.tips.active = false;
                this.moveLabel.active = false;
                CocosUtil.playSpineAnim(this.ting, "pmd_ting", true);
            }
        } else {
            this.showOrHideFreeTips(true);
        }
    }

    showMarquee(jump?: boolean, isEnd?: boolean) {
        // console.error("语句", this.ting.active, this.node.getChildByName("info_bns").active)
        if (this.ting.active || this.node.getChildByName("info_bns").active) {
            return;
        }
        let idx = this.getMarqueeIdx();
        if (jump && this._curIdx == idx && this.moveLabel.active && !isEnd) {
            return;
        } else if (!jump && this.moveLabel.active) {
            return;
        }
        this._curIdx = idx;
        this.tips.active = false;
        this.moveLabel.active = true;
        Tween.stopAllByTarget(this.moveContent.node);
        this.moveContent.node.setPosition(0, 0, 0);
        this.moveContent.spriteFrame = this.labelSprites[idx];
        let width = this.moveContent.node.getComponent(UITransform).width;
        // let t = width / this._speed;
        let t = width / window["marquee"].moveSpeed;
        let tw = tween(this.moveContent.node).delay(window["marquee"].stillDuration);
        if (width > this._maxWidth) {
            let x = -(this._maxWidth - width) / 2;
            this.moveContent.node.setPosition(x, 0, 0);
            tw.by(t, { position: v3(-width - 60, 0, 0) })
        }
        tw.delay(window["marquee"].nextDelayTime).call(() => {
            this.showMarquee(true, true);
        }).start();
    }

    getMarqueeIdx() {
        let idx = this._marqueeIdx + 1;
        if (GameCtrl.getIns().getModel().isFree() || GameCtrl.getIns().getModel().isIntoFree()) {
            idx = 0;
        } else {
            if (idx == 0 || idx >= this.labelSprites.length - 1) {
                idx = 1;
            }
        }
        this._marqueeIdx = idx;
        return idx;
    }

    initializationState(level: 0 | 1 | 2) {
        if (level == 2) {
            this.topSpS3.active = true;
        } else {
            this.topSpS3.active = false;
        }
        this.topSpS.forEach((sp, idx) => {
            if (idx == level) {
                sp.node.active = true;
                sp.timeScale = 1000;
                sp.setCompleteListener(() => {
                    sp.setCompleteListener(null);
                    sp.timeScale = 1;
                });
            } else {
                sp.node.active = false;
            }
        });
        this._curLevel = level;
    }

    changeLevel(level: 0 | 1 | 2, isEnd: boolean, isContinue: boolean) {
        if (isContinue) {
            if (level == 2) {
                this.topSpS3.active = true;
            } else {
                this.topSpS3.active = false;
            }
            this.topSpS.forEach((spS, idx) => {
                if (level == idx) {
                    spS.node.active = true;
                    spS.timeScale = 1000;
                    spS.setCompleteListener(() => {
                        spS.setCompleteListener(null);
                        spS.timeScale = 1;
                    });
                } else {
                    spS.node.active = false;
                }
            });
            this._curLevel = level;
            return;
        }
        // if (!isEnd && level < this._curLevel) {
        //     return;
        // }
        if (level < this._curLevel) {
            if (level == 2) {
                this.topSpS3.active = true;
            } else {
                this.topSpS3.active = false;
            }
            this.topSpS.forEach((spS, idx) => {
                if (idx == this._curLevel) {
                    tween(spS.node.getComponent(UIOpacity)).to(0.3, { opacity: 0 }).call(() => {
                        spS.node.active = false;
                        spS.node.getComponent(UIOpacity).opacity = 255;
                    }).start();
                } else if (level == idx) {
                    spS.node.active = true;
                    spS.timeScale = 100000;
                    spS.setCompleteListener(() => {
                        spS.setCompleteListener(null);
                        spS.timeScale = 1;
                    });
                } else {
                    spS.node.active = false;
                }
            });
        } else if (level > this._curLevel) {
            this.topSpS.forEach(((sp, idx) => {
                sp.node.active = idx == level;
            }));
        }
        this._curLevel = level;
    }

    tipsAction() {
        tween(this.tips).to(0.1, { scale: v3(1.2, 1.2, 1.2) }).call(() => {
            let tips = instantiate(this.tips);
            this.tipsBottom.addChild(tips);
            tween(tips).to(0.5, { scale: v3(1.5, 1.5, 1.5) }).start();
            tween(tips.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).call(() => {
                tips.destroy();
            }).start();
        }).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    showWin(winNum: number, isEnd: boolean, forceRun?: boolean, isContinue?: boolean) {
        return new Promise<void>(async (resolve, reject) => {
            Tween.stopAllByTarget(this.moveContent.node);
            this.tips.active = true;
            this.moveLabel.active = false;
            this._targetNum = new BigNumber(winNum).div(GameConst.BeseGold).toNumber();
            this.winNum.string = MoneyUtil.formatGold(this._targetNum)
            this.tips.getChildByName("totalWin").active = isEnd;
            this.tips.getChildByName("win").active = !isEnd;
            !isContinue && this.tips.setScale(0.1, 0.1, 0.1);
            this.ting.active = false;
            this.node.getChildByName("info_bns").active = false;
            !isContinue && this.tipsAction();

            let amount = 0;
            EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num) => {
                amount = num;
            })
            let rate = winNum / amount;
            let isRun = rate >= this._rollRate && rate < this._maxRollRate;
            let isShake = isRun || rate < this._rollRate;
            if (forceRun !== undefined) {
                isRun = forceRun;
            }

            if (isEnd) {
                if (rate < this._rollRate) {
                    this.changeLevel(0, isEnd, isContinue);
                } else if (rate < this._maxRollRate) {
                    this.changeLevel(1, isEnd, isContinue);
                } else {
                    this.changeLevel(2, isEnd, isContinue);
                }
            } else {
                if (rate < this._rollRate) {
                    this.changeLevel(0, isEnd, isContinue);
                } else {
                    this.changeLevel(1, isEnd, isContinue);
                }
            }
            if (!isContinue) {
                if (this._curLevel < 2) {
                    this.topSpS[this._curLevel].node.active = true;
                    this.topSpS[this._curLevel].timeScale = 1;
                    this.topSpS[this._curLevel].setToSetupPose();
                    this.topSpS[this._curLevel].setAnimation(0, "pmd_win" + (this._curLevel + 1), false);
                    if (this._curLevel == 1) {
                        CocosUtil.playSpineAnim(this.node.getChildByName("jinbifangun"), "animation", false, () => {
                            this.node.getChildByName("jinbifangun").active = false;
                        })
                    }
                    this.topSpS3.active = false;
                } else {
                    this.topSpS3.active = true;
                }

                if (isEnd) {
                    if (isRun) {
                        this._promise = resolve;
                        GameAudio.roundTotalWin();
                        this.scheduleOnce(() => {
                            this.openQuickRun();
                        }, 0.1)
                        await CocosUtil.runScore(this.winNum, this._rollTime, this._targetNum, 0);
                        this.tipsAction();
                        AudioManager.inst.stopMusic();
                        GameAudio.roundTotalWinEnd();
                        this.node.getChildByName("quick_run_top_score").active = false;
                        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickSpace, this);
                        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickSpace, this);
                    } else {
                        GameAudio.normalWinTotal();
                    }
                    isShake && EventCenter.getInstance().fire(GameEvent.game_shake_screen);
                } else {
                    GameAudio.topNormalWin();
                }
            }
            resolve();
        })
    }

    openQuickRun() {
        this.node.getChildByName("quick_run_top_score").active = true;
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickSpace, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickSpace, this);
    }

    onClickSpace() {
        this.node.getChildByName("quick_run_top_score").active = false;
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickSpace, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickSpace, this);

        Tween.stopAllByTarget(this.winNum.node);
        this.winNum.string = MoneyUtil.formatGold(this._targetNum)
        AudioManager.inst.stopMusic();
        GameAudio.roundTotalWinEnd();
        this._promise && this._promise();
    }

    hideWin() {
        this.ting.active = false;
        this.node.getChildByName("info_bns").active = false;
        this.showMarquee(GameCtrl.getIns().getModel().isFree() || GameCtrl.getIns().getModel().isIntoFree());
        this.changeLevel(0, true, false);
    }

    showOrHideFreeTips(isShow: boolean) {
        if (isShow) {
            this.ting.active = false;
            this.tips.active = false;
            this.moveLabel.active = false;
            this.node.getChildByName("info_bns").active = true;
        } else {
            this.node.getChildByName("info_bns").active = false;
        }
    }
}


