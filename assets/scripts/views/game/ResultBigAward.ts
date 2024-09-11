import { _decorator, Button, Component, error, EventTouch, log, Node, ParticleSystem2D, sp, tween, UIOpacity, v3, warn } from 'cc';
import { CompNumberEx } from '../../kernel/compat/view/comps/CompNumberEx';
import { BaseView } from '../../kernel/compat/view/BaseView';
import CHandler from '../../kernel/core/datastruct/CHandler';
import GameEvent from '../../event/GameEvent';
import EventCenter from '../../kernel/core/event/EventCenter';
import CocosUtil from '../../kernel/compat/CocosUtil';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
import GameCtrl from '../../ctrls/GameCtrl';
import { PUBLIC_EVENTS } from '../../event/PublicEvents';
const { ccclass, property } = _decorator;

@ccclass('ResultBigAward')
export class ResultBigAward extends BaseView {

    @property(CompNumberEx)
    labNum: CompNumberEx;

    runList: { start: number, end: number }[] = [];
    runIdx: number = 0;
    private autoCloseTime: number = 6;
    private isStartTime: boolean = false;
    private isCloseUi: boolean = false;

    showLevel: number = -1;

    targetNum: number = 0

    targetLevel: number = 0;

    isOnlyBigWin: boolean = false;

    animConfig = [7, 7, 14];

    nextAnimTime = 7.2;

    delay: number = 5;

    onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);

        this.m_ui.win_num_box.setScale(0, 0, 0);
        tween(this.m_ui.win_num_box).to(0.28, { scale: v3(1.2, 1.2, 1.2) }).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    private initNetEvent() {
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickMesk, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickMesk, this);
    }

    initData(data: { amounts: number[] }) {
        this.targetNum = data.amounts[data.amounts.length - 1]
        this.labNum.setEndCallback(new CHandler(this, this.onValueChangeEnd))
        this.labNum.setValueFormater(v => {
            return MoneyUtil.rmbStr(v);
        })
        this.targetLevel = data.amounts.length;
        let startAmount = 0;
        let totalAward = 0;
        warn("amounts", data.amounts);
        for (let index = 0; index < data.amounts.length; index++) {
            totalAward = data.amounts[index]
            this.runList[index] = { start: startAmount, end: totalAward }
            startAmount = totalAward
        }
        if (this.runList.length == 1) {
            this.isOnlyBigWin = true;
        }
        GameAudio.bigWin()
        this.setAllBgmMute(true);
        this.runChange(1)

        this.scheduleOnce(() => {
            this.initNetEvent()
            CocosUtil.addClickEvent(this.node.getChildByName("mask"), this.onClickMesk, this, null, 1);
            CocosUtil.addClickEvent(this.node.getChildByName("quick_close"), this.onClickClose, this, null, 1);
        }, 0.1);
    }

    setAllBgmMute(state: boolean) {
        if (state) {
            EventCenter.getInstance().fire(GameEvent.change_bgm_vol, 0, 0);
            EventCenter.getInstance().fire(GameEvent.change_bgm_vol, 1, 0);
            EventCenter.getInstance().fire(GameEvent.change_bgm_vol, 2, 0);
        } else {
            let time = 5, now = new Date().getTime();
            let id = setInterval(() => {
                let c = (new Date().getTime() - now) / 1000 / time;
                if (c > 1) {
                    c = 1;
                    clearInterval(id);
                }
                EventCenter.getInstance().fire(GameEvent.change_bgm_vol, 0, c);
                EventCenter.getInstance().fire(GameEvent.change_bgm_vol, 2, c);
            }, 16);
        }
    }

    private onClickMesk() {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickMesk, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickMesk, this);
        CocosUtil.delClickEvent(this.node.getChildByName("mask"), this.onClickMesk, this);

        this.openQuickClose();

        this.node.getChildByName("mask").getComponent(Button).interactable = false;
        this.scheduleOnce(() => {
            if (!this.isStartTime) {
                GameAudio.bigWinEnd()
                this.setAllBgmMute(false);
                this.toFinal(true);
            }
        }, 0.1)
    }

    private openQuickClose() {
        EventCenter.getInstance().listen(GameEvent.key_down_space, this.onClickClose, this);
        EventCenter.getInstance().listen(GameEvent.key_pressing_space, this.onClickClose, this);
        this.node.getChildByName("quick_close").active = true;
    }

    private onClickClose() {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickClose, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickClose, this);
        this.node.getChildByName("quick_close").active = false;
        if (this.autoCloseTime > 2) {
            this.autoCloseTime = 2;
        }
    }

    private toFinal(isSkip?: boolean) {
        this.onLevelChg(this.targetLevel, isSkip);
        this.isStartTime = true
        this.labNum.initValue(this.targetNum);
        tween(this.m_ui.win_num_box).to(0.3, { scale: v3(1.3, 1.3, 1.3) }).to(0.1, { scale: v3(1, 1, 1) }).start();
    }

    private showBigAward1(isShow: boolean, cb?: Function, isSkip?: boolean) {
        this.m_ui.win1.active = true;
        let sps = this.m_ui.win1.getComponent(sp.Skeleton);
        if (isShow) {
            if (isSkip) {
                sps.setAnimation(0, "dajiang_idle", true);
            } else {
                sps.setAnimation(0, "dajiang_in", false);
                sps.setCompleteListener(() => {
                    sps.setCompleteListener(null);
                    sps.setAnimation(0, "dajiang_idle", true);
                })
            }
        } else {
            // sps.setAnimation(0, "dajiang_end", false);
            // sps.setCompleteListener(() => {
            //     sps.setCompleteListener(null);
            //     cb && cb();
            // })
            this.winEnd();
        }
    }

    private showBigAward2(isShow: boolean, cb?: Function, isSkip?: boolean) {
        this.m_ui.win2.active = true;
        let sps = this.m_ui.win2.getComponent(sp.Skeleton);
        if (isShow) {
            CocosUtil.playSpineAnim(this.m_ui.winJinBi, "jinbi_in", true);
            if (isSkip) {
                sps.setAnimation(0, "jujiang_idle", true);
            } else {
                sps.setAnimation(0, "jujiang_in", false);
                sps.setCompleteListener(() => {
                    sps.setCompleteListener(null);
                    sps.setAnimation(0, "jujiang_idle", true);
                })
            }
        } else {
            // sps.setAnimation(0, "jujiang_end", false);
            // sps.setCompleteListener(() => {
            //     sps.setCompleteListener(null);
            //     cb && cb();
            // })
            this.winEnd();
        }
    }

    winEnd(cb?: Function) {
        CocosUtil.playSpineAnim(this.m_ui.winEnd, "cjjj_end", false, () => {
            this.m_ui.winEnd.active = false;
            cb && cb();
        })
    }

    private showBigAward3(isShow: boolean, cb?: Function, isSkip?: boolean) {
        this.m_ui.win3.active = true;
        let sps = this.m_ui.win3.getComponent(sp.Skeleton);
        if (isShow) {
            if (isSkip) {
                sps.setAnimation(0, "cjjj_idle", true);
            } else {
                sps.setAnimation(0, "cjjj_in", false);
                sps.setCompleteListener(() => {
                    sps.setCompleteListener(null);
                    sps.setAnimation(0, "cjjj_idle", true);
                })
            }
        } else {
            // sps.setAnimation(0, "cjjj_end", false);
            // sps.setCompleteListener(() => {
            //     sps.setCompleteListener(null);
            //     cb && cb();
            // })
            this.winEnd();
        }
    }

    private onValueChangeEnd(v: number) {
        if (this.runIdx == this.runList.length) {
            // this.isStartTime = true
            GameAudio.bigWinEnd()
            this.setAllBgmMute(false);
            this.toFinal();
        } else {
            this.runIdx++;
            this.runChange(this.runIdx)
        }
    }

    runChange(idx) {
        this.runIdx = idx
        let amounts = this.runList[idx - 1]
        this.onLevelChg(idx)
        this.labNum.initValue(amounts.start)
        if (idx == this.runList.length) {
            this.labNum.chgValue(amounts.end, this.getLastInterval());
        } else {
            this.labNum.chgValue(amounts.end, this.nextAnimTime);
        }
        idx != 1 && tween(this.m_ui.win_num_box).by(0.02, { position: v3(-2, 2, 0) }).by(0.02, { position: v3(4, 0, 0) }).by(0.02, { position: v3(0, -4, 0) }).by(0.02, { position: v3(-2, 2, 0) }).start();
    }
    /**
     * 
     * @returns 大奖结束节点7.82秒 （数字金额滚动速率定义为此时间内，根据金额大小速率随机）
巨奖结束节点14.78秒（数字金额滚动速率定义为此时间内，根据金额大小速率随机）
超级奖播放至结束 28.7秒（数字金额滚动速率定义为此时间内，根据金额大小速率随机）
     */
    getLastInterval() {
        let curBet = 0;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num) => {
            curBet = num;
        })
        let curRate = this.runList[this.runList.length - 1].end / curBet;
        let needTime = 0;
        let config = GameCtrl.getIns().getModel().winConfig;
        if (this.runList.length == 1) {
            // needTime = this.animConfig[0] - this.delay;
            needTime = 7.82;
        } else if (this.runList.length == 2) {
            // needTime = (curRate - config[1]) / (config[2] - config[1]) * (this.animConfig[1] - this.delay);
            needTime = 7;
        } else if (this.runList.length == 3) {
            // if (curRate > config[2] * 2) {
            //     needTime = this.animConfig[2] - this.delay;
            // } else {
            //     needTime = (curRate - config[2]) / config[2] * (this.animConfig[2] - this.delay);
            // }
            needTime = 14;
        }
        log("needTime", needTime, this.runList.length);
        return needTime;
    }

    onLevelChg(level: number, isSkip?: boolean) {
        if (this.showLevel == level) {
            if (this.showLevel > 1) {
                this["showBigAward" + this.showLevel](false);
            }
            return;
        }
        this.showLevel = level
        switch (level) {
            case 1:
                this.showBigAward1(true, null, isSkip);
                break;
            case 2:
                this.showBigAward2(true, null, isSkip)
                break;
            case 3:
                this.showBigAward3(true, null, isSkip)
                break;
        }
    }

    private closeUI() {
        tween(this.node.getComponent(UIOpacity)).to(1, { opacity: 0 }).call(() => {
            EventCenter.getInstance().fire(GameEvent.close_bigreward);
        }).start();
    }

    protected onDestroy(): void {
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickMesk, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickMesk, this);
        EventCenter.getInstance().remove(GameEvent.key_down_space, this.onClickClose, this);
        EventCenter.getInstance().remove(GameEvent.key_pressing_space, this.onClickClose, this);

        // GameAudio.stopBigAward()
        // this.setAllBgmMute(false);
    }

    protected update(dt: number): void {
        if (!this.isCloseUi) {
            if (this.isStartTime) {
                this.autoCloseTime -= dt;
                if (this.autoCloseTime <= 0) {
                    this.isCloseUi = true;
                    this.closeUI();
                }
            }
        }
    }

}


