import { _decorator, Component, error, Label, log, Node, NodeEventType, sp, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, v3, Vec3, warn } from 'cc';
import EventCenter from '../../kernel/core/event/EventCenter';
import GameEvent from '../../event/GameEvent';
import GameConst, { TItemtype } from '../../define/GameConst';
import { RollAxisCom, RollState } from './RollAxisCom';
import { ElementCtrl } from './ElementCtrl';
import CocosUtil from '../../kernel/compat/CocosUtil';
import GameAudio from '../../mgrs/GameAudio';
import GameCtrl from '../../ctrls/GameCtrl';
import { AssetManager } from 'cc';
import { assetManager } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import { l10nSpine } from '../common/l10nSpine';
import MathUtil from '../../kernel/core/utils/MathUtil';
import { game } from 'cc';
import { Prefab } from 'cc';
import { instantiate } from 'cc';
import { poolManager } from '../../kernel/compat/pool/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('ElementCom')
export class ElementCom extends Component {

    @property(Node)
    jin: Node = null;
    @property(Node)
    yin: Node = null;
    @property(Node)
    jinBlur: Node = null;
    @property(Node)
    yinBlur: Node = null;
    spine: Node = null;

    @property(Node)
    duoBaoGuang: Node = null;

    @property(Node)
    iconsDi: Node = null;
    @property(Node)
    iconsBlurDi: Node = null;

    @property(Node)
    kuang: Node = null;

    @property(SpriteFrame)
    diSprite: SpriteFrame[] = [];
    @property(SpriteFrame)
    diBlurSprite: SpriteFrame[] = [];
    @property(SpriteFrame)
    iconsBlurSprite: SpriteFrame[] = [];

    @property(Prefab)
    prefabList: Prefab[] = [];

    /**0 "spine", 1 "icons", 2 "iconsBlur", 3 "eliminate", 4 "waiFaGuang" */
    @property(Node)
    prefabParentList: Node[] = [];

    parentCom: RollAxisCom = null;

    locked: boolean = false;

    moved: boolean = false;

    isRollEnd: boolean = false;

    initParent: Node = null;

    scatterAppear: boolean = false;

    wdNum: number = 0;

    id: number = 0;
    /**占多少格子 */
    count: number = 0;
    eliminate: Node = null;
    waiFaGuang: Node = null;
    icons: Node = null;
    iconsBlur: Node = null;

    /*顺序编号 0-n 用于获取该元素悬浮提示面板位置信息 */
    private _posIdx: number = -1;
    targetPos: Vec3 = null;

    get posIdx() {
        return this._posIdx;
    }
    set posIdx(value: number) {
        // if (this._posIdx != value) {
        //     this._posIdx = value;
        //     let idx = this._posIdx % GameConst.MaxRow;
        //     if (idx == -1) {
        //         this.serverIdx = -1;
        //     } else if (idx == 0) {
        //         this.serverIdx = -1;
        //     } else if (idx == GameConst.MaxRow - 1) {
        //         this.serverIdx = Infinity;
        //     } else {
        //         this.serverIdx = this._posIdx - Math.floor(this._posIdx / GameConst.MaxRow) * 2 - 1;
        //     }
        // }
        this._posIdx = value;
        this.serverIdx = value;
    }

    serverIdx: number = -1;

    showServerId() {
        let label = this.node.getChildByName("Label");
        // label.active = true;
        label.getComponent(Label).string = this.count + ":::" + this.serverIdx
    }

    init(id: number, count: number, parentCom: RollAxisCom) {
        this.setId(id)
        this.posIdx = -1;
        this.parentCom = parentCom;
        this.count = count;

        this.locked = false;
        this.moved = false;
        this.isRollEnd = false;
        this.targetPos = null;
        this.initParent = null;
        this.scatterAppear = false;
    }

    addClickEvent() {
        this.node.on(NodeEventType.TOUCH_START, this.onClick, this)
    }

    onClick(ev) {
        EventCenter.getInstance().fire(GameEvent.click_element, this);
    }

    changeId() {
        let id = this.id;
        if (this.id >= TItemtype.SILVER_MOD && this.id < TItemtype.GOLD_MOD) {
            id = this.id - TItemtype.SILVER_MOD;
        } else if (this.id >= TItemtype.GOLD_MOD && this.id < TItemtype.ITEM_TYPE_DUPLICATE) {
            id = this.id - TItemtype.GOLD_MOD;
        } else if (this.id > TItemtype.ITEM_TYPE_DUPLICATE) {
            id = TItemtype.ITEM_TYPE_WILD;
        }
        return id;
    }

    isVersatile() {
        return this.changeId() == TItemtype.ITEM_TYPE_WILD;
    }

    /**百搭可用次数  */
    getVersatileNum() {
        if (this.id > TItemtype.ITEM_TYPE_DUPLICATE) {
            return Math.floor(this.id / 100);
        } else {
            return "";
        }
    }

    /**是金 */
    isGold() {
        return this.id > TItemtype.GOLD_MOD && this.id < TItemtype.ITEM_TYPE_DUPLICATE;
    }

    /**是银 */
    isSilver() {
        return this.id > TItemtype.SILVER_MOD && this.id < TItemtype.GOLD_MOD;
    }

    showGoldOrSilver(node: Node) {
        node.children.forEach((child, idx) => {
            child.active = this.count - 1 == idx;
        })
    }

    updateChild(node: Node, active: boolean) {
        let idx = this.prefabParentList.indexOf(node);
        let nodeName = "item" + idx;
        if (!poolManager.getPool(nodeName)) {
            poolManager.createPool(nodeName, instantiate(this.prefabList[idx]));
        }
        if (node.children.length) {
            if (!active) {
                node.children.forEach((child) => {
                    poolManager.putNode(child.name, child);
                })
                // node.removeAllChildren();
            }
        } else {
            if (active) {
                let child = poolManager.getNode(nodeName);
                child.name = nodeName;
                node.addChild(child)
            }
        }
        this[node.name] = node.children[0];
        this.setWildNum();
    }

    updateIcon(isDim: boolean, isInit?: boolean, isChange?: boolean) {
        if (!this.initParent) {
            this.initParent = this.node.parent;
        }
        this.duoBaoGuang.active = false;
        this.iconsDi.getChildByName("scbj").active = false;
        this.isRollEnd = false;
        this.node.getComponent(UITransform).setContentSize(this.parentCom.itemSize.width, this.parentCom.itemSize.height * this.count);
        if (this.id) {
            this.iconsBlurDi.active = isDim;
            this.iconsDi.active = !isDim;
            // this.iconsBlur.active = isDim;
            // this.icons.active = !isDim;
            // this.spine.active = false;
            // this.eliminate.active = false;
            // this.waiFaGuang.active = false;

            this.updateChild(this.prefabParentList[2], isDim);
            this.updateChild(this.prefabParentList[1], !isDim);
            this.updateChild(this.prefabParentList[0], false);
            this.updateChild(this.prefabParentList[3], false);
            this.updateChild(this.prefabParentList[4], false);

            this.jin.active = this.isGold();
            this.yin.active = this.isSilver();
            if (this.jin.active) {
                this.showGoldOrSilver(this.jin);
            } else if (this.yin.active) {
                this.showGoldOrSilver(this.yin);
            }

            let id = this.changeId();

            if (this.isVersatile()) {
                let versatileNum = this.getVersatileNum();
                this.wdNum = Number(versatileNum);
                this.setWildNum();
            }

            this.iconsDi.getComponent(Sprite).spriteFrame = this.diSprite[(id - 1) * 4 + this.count - 1];
            this.iconsBlurDi.getComponent(Sprite).spriteFrame = this.diBlurSprite[(id - 1) * 4 + this.count - 1];

            if (isDim) {
                this.iconsBlur.children.forEach((node, cId) => {
                    let active = cId == id - 1;
                    node.active = active;
                    if (active) {
                        node.children.forEach((child, idx) => {
                            child.active = idx == this.count - 1;
                            // if (child.active) {
                            //     child.getChildByName("sp").active = true;
                            // } else {
                            //     child.getChildByName("sp").active = false;
                            // }
                        });
                    }
                });
            } else {
                this.icons.children.forEach((node, cId) => {
                    let active = cId == id - 1;
                    node.active = active;
                    if (active) {
                        node.children.forEach((child, idx) => {
                            child.active = idx == this.count - 1;
                            // if (child.active) {
                            //     child.getChildByName("sp").active = true;
                            // } else {
                            //     child.getChildByName("sp").active = false;
                            // }
                        });
                    }
                });
                if (!isChange) {
                    Tween.stopAllByTarget(this.icons);
                    this.icons.setScale(1, 1, 1);
                }
            }

            if (isInit) {
                this.initSpecialsIcon(isInit);
            }

            this.showServerId();
        }
    }

    initSpecialsIcon(isInit: boolean) {
        let id = this.changeId();
        if (isInit) {
            if (id == TItemtype.ITEM_TYPE_WILD) {
                this.showSpineAnim("idle", true);
                this.toTopEffectNode();
            } else if (id == TItemtype.ITEM_TYPE_SCATTER) {
                this.showScatterAnim(1);
            }
        } else {
            if (id == TItemtype.ITEM_TYPE_SCATTER) {
                this.showScatterAnim(0);
            }
        }
    }

    scatterExit() {
        if (this.id == TItemtype.ITEM_TYPE_SCATTER) {
            this.showScatterAnim(5);
        }
    }

    /**0 出现，1 正常，2 中免费，3 听牌，4 听牌结束，5 退出*/
    showScatterAnim(state: 0 | 1 | 2 | 3 | 4 | 5, cb?: Function) {
        if (this.id != TItemtype.ITEM_TYPE_SCATTER) {
            return;
        }
        let node: Node = null;
        switch (state) {
            case 0: //出现
                if (this.scatterAppear) {
                    return;
                }
                this.scatterAppear = true;
                CocosUtil.playSpineAnim(this.iconsDi.getChildByName("scbj"), "duobaog_x" + this.count + "_in", false, () => {
                    CocosUtil.playSpineAnim(this.iconsDi.getChildByName("scbj"), "duobaog_x" + this.count + "_idle", true);
                })
                this.duoBaoGuang.active = true;
                if (this.count > 1) {
                    this.duoBaoGuang.children[0].setPosition(0, 165.42);
                    this.duoBaoGuang.children[1].setPosition(0, -165.979);
                } else {
                    this.duoBaoGuang.children[0].setPosition(0, 104.82);
                    this.duoBaoGuang.children[1].setPosition(0, -103.605);
                }
                node = this.showSpineAnim("spawn", false, false, () => {
                    this.showSpineAnim("idle", true, true, cb);
                })
                CocosUtil.playSpineAnim(node.parent.getChildByName("scbj"), "duobaog_ziguang", false, () => {
                    node.parent.getChildByName("scbj").active = false;
                })
                CocosUtil.playSpineAnim(node.parent.getChildByName("kuang" + this.count), "duobaog_x1_sg" + (this.count == 2 ? 2 : ""), true);
                break;
            case 1: //正常
                CocosUtil.playSpineAnim(this.iconsDi.getChildByName("scbj"), "duobaog_x" + this.count + "_idle", true);
                this.duoBaoGuang.active = true;
                if (this.count > 1) {
                    this.duoBaoGuang.children[0].setPosition(0, 165.42);
                    this.duoBaoGuang.children[1].setPosition(0, -165.979);
                } else {
                    this.duoBaoGuang.children[0].setPosition(0, 104.82);
                    this.duoBaoGuang.children[1].setPosition(0, -103.605);
                }
                node = this.showSpineAnim("idle", true, false, cb);
                CocosUtil.playSpineAnim(node.parent.getChildByName("kuang" + this.count), "duobaog_x1_sg" + (this.count == 2 ? 2 : ""), true);
                break;
            case 2: //中免费
                this.showSpineAnim("win", false, false, () => {
                    this.showSpineAnim("win_idle", false, true, cb);
                });
                break;
            case 3: //听牌开始
                this.showSpineAnim("fastspin_start", false, false, () => {
                    this.showSpineAnim("fastspin_idle", true, true, cb);
                });
                break;
            case 4: //听牌结束
                this.showSpineAnim("fastspin_exit", false, true, () => {
                    this.showSpineAnim("idle", true, true, cb);
                });
                break;
            case 5: //退出
                let id = this.changeId();
                let child = this.spine.children[id - 1].children[this.count + 1];
                CocosUtil.playSpineAnim(child, "spawn", false, cb, -1);
                break;

            default:
                break;
        }
    }

    showSpineAnim(animName: string, isLoop: boolean, isSkip: boolean = false, cb?: Function) {
        // this.iconsBlur.active = false;
        // this.icons.active = false;
        // this.spine.active = true;

        this.updateChild(this.prefabParentList[2], false);
        this.updateChild(this.prefabParentList[1], false);
        this.updateChild(this.prefabParentList[0], true);

        let tempNode: Node = null;
        let id = this.changeId();
        log("showSpineAnim", animName, id, this.count, this.id, this.spine.children[id - 1].children[this.count - 1]);
        if (isSkip) {
            let child = null;
            if (id == TItemtype.ITEM_TYPE_SCATTER) {
                child = this.spine.children[id - 1].children[this.count + 1];
            } else {
                this.spine.children[id - 1].children[this.count - 1];
            }
            CocosUtil.playSpineAnim(child, animName, isLoop, cb);
            tempNode = child;
        } else {
            this.spine.children.forEach((node, cId) => {
                let active = cId == id - 1;
                if (active) {
                    node.active = true;
                    node.children.forEach((child, idx) => {
                        if (id == TItemtype.ITEM_TYPE_SCATTER) {
                            child.active = idx == this.count + 1;
                        } else {
                            child.active = idx == this.count - 1;
                        }
                        if (child.active) {
                            tempNode = child;
                            CocosUtil.playSpineAnim(child, animName, isLoop, cb);
                        }
                    });
                } else {
                    node.active = false;
                }
            });
        }
        return tempNode;
    }

    roll(speed: number, idx): void {
        if (this.isRollEnd) {
            return;
        }
        let targetPos = v3(this.node.position.x, this.node.position.y + speed, this.node.position.z);
        if (this.targetPos) {
            if (targetPos.y <= this.targetPos.y) {
                this.isRollEnd = true;
                this.node.setPosition(targetPos.x, this.targetPos.y, targetPos.z);
                this.parentCom.checkEnd();
                this.initSpecialsIcon(false);
            } else {
                this.node.setPosition(targetPos);
            }
        } else {
            this.node.setPosition(targetPos);
            if (targetPos.y < -this.parentCom.itemSize.height * this.count / 2) {
                EventCenter.getInstance().fire(GameEvent.game_axis_roll_frist_move_lowest, this.parentCom.idx);
            }
        }
    }

    showDrawsEffect() {
        if (this.id == TItemtype.ITEM_TYPE_SCATTER) {
            tween(this.spine).delay(0.8).call(() => {
                this.spine.setScale(0.95, 0.95, 0.95);
            }).to(0.1, { scale: v3(1.05, 1.05, 1.05) }).to(0.1, { scale: v3(1, 1, 1) }).call(() => {
                GameAudio.duoBaoHeart();
            }).union().repeat(3).call(() => {

            }).start();
        }
    }

    playDraws() {
        if (this.id == TItemtype.ITEM_TYPE_SCATTER) {
            this.showScatterAnim(3)
        }
    }

    playDrawsEnd() {
        if (this.id == TItemtype.ITEM_TYPE_SCATTER) {
            this.showScatterAnim(4);
            this.toInitNode();
        }
    }

    playScatterWin(cb: () => void) {
        // if (this.serverIdx != -1 && this.id == TItemtype.ITEM_TYPE_SCATTER) {
        //     console.error("播放动画scatter")
        this.showScatterAnim(2, cb);
        // }
    }

    toTopEffectNode() {
        // if (this.serverIdx != -1) {
            this.node.parent = this.parentCom.node.parent.getComponent(ElementCtrl).effectNode;
            this.node.setSiblingIndex(0)
        // }
    }

    toTopNode() {
        if (this.serverIdx != -1) {
            this.node.parent = this.parentCom.node.parent.getComponent(ElementCtrl).toptNode;
        }
    }

    toInitNode() {
        // if (this.serverIdx != -1) {
        this.initParent && (this.node.parent = this.initParent);
        // }
    }

    setWildNum() {
        this.icons?.children[0].children.forEach((child) => {
            let wdLabel = child.getChildByName("wdNum");
            if (wdLabel) {
                wdLabel.getComponent(Label).string = this.wdNum.toString();
            }
        })
        this.spine?.children[0].children.forEach((child) => {
            let wdLabel = child.getChildByName("wdNum");
            if (wdLabel) {
                wdLabel.getComponent(Label).string = this.wdNum.toString();
                wdLabel.getComponent(UIOpacity).opacity = 255;
            }
        })
    }

    wildNumReduce() {
        this.wdNum--;
        let next = this.wdNum;
        if (this.wdNum <= 0) {
            this.wdNum = 1;
        }
        this.setWildNum();
        return next;
    }



    playWinEffect(changeMaskCb: () => void, cb: () => void) {
        let isChangeMask = false;
        this.toTopEffectNode();
        // this.icons.active = true;
        // this.iconsBlur.active = false;
        // this.eliminate.active = false;
        // this.waiFaGuang.active = false;

        this.updateChild(this.prefabParentList[2], false);
        this.updateChild(this.prefabParentList[1], true);

        let checkEnd = (isDelete: boolean) => {
            if (!isChangeMask) {
                isChangeMask = true;
                changeMaskCb();
            }
            Tween.stopAllByTarget(this.node);
            Tween.stopAllByTarget(this.node.getComponent(UIOpacity));
            Tween.stopAllByTarget(this.eliminate);
            Tween.stopAllByTarget(this.icons);
            this.node.getComponent(UIOpacity).opacity = 255;
            this.icons?.setScale(1, 1, 1);
            this.waiFaGuang?.setScale(1, 1, 1);
            this.eliminate?.setScale(1, 1, 1);
            spNode.active = spNodeActive;
            isDelete && EventCenter.getInstance().fire(GameEvent.game_axis_roll_move_ele, this.parentCom.idx, this);
            cb();
        }

        let id = this.changeId();
        if(!this.icons.children[id - 1] || !this.icons.children[id - 1].children){
            console.log("sss");
        }
        let node = this.icons.children[id - 1].children[this.count - 1];
        let spNode = node.getChildByName("sp");
        let spNodeActive = spNode.active;

        if (id == TItemtype.ITEM_TYPE_WILD) {
            this.updateChild(this.prefabParentList[3], false);
            this.updateChild(this.prefabParentList[4], false);

            // log("消除wd", this.node.uuid)
            let silverUp = this.node.getChildByName("silver_up");
            let next = this.wdNum - 1;
            CocosUtil.playSpineAnim(silverUp, "silver_up" + this.count, false, () => {
                this.resCurPosIdx();
                this.setId(this.getchangeWildId(next))//GameCtrl.getIns().getModel().getChangeElement(this.serverIdx));
                silverUp.active = false;
                checkEnd(next <= 0);
            });
            // this.spine.active = true;
            this.updateChild(this.prefabParentList[0], true);
            let temp = this.showSpineAnim("win", true);
            let sps = temp.getComponent(sp.Skeleton);
            if (next > 0) {
                this.scheduleOnce(() => {
                    CocosUtil.playSpineAnim(this.iconsDi.getChildByName("caidai" + this.count), "animation", false, () => {
                        this.iconsDi.getChildByName("caidai" + this.count).active = false;
                    });
                    GameAudio.caiDai();
                }, 0.5)
                this.scheduleOnce(() => {
                    this.wildNumReduce();
                    sps.setCompleteListener(() => {
                        sps.setAnimation(0, "win_idle", false);
                        sps.setCompleteListener(() => {
                            sps.setAnimation(0, "idle", true);
                        });
                    })
                }, 0.7)
            } else {
                this.scheduleOnce(() => {
                    GameAudio.caiDai();
                    let tnode = this.iconsDi.getChildByName("caidai" + this.count);
                    if(tnode){
                        CocosUtil.playSpineAnim(tnode, "animation", false, () => {
                            this.iconsDi.getChildByName("caidai" + this.count).active = false;
                            this.iconsDi.active = false;
                        });
                    }else{
                        console.log("caidai err",this.id,this.count);
                    }
                }, 0.5)
                sps.setAnimation(0, "win_idle", false);
                sps.setCompleteListener(() => {
                    sps.setAnimation(0, "idle", false);
                });
                tween(this.spine.children[id - 1].children[this.count - 1].getChildByName("wdNum").getComponent(UIOpacity))
                    .delay(1)
                    .to(0.5, { opacity: 1 })
                    .start();
            }
        } else if (id == TItemtype.ITEM_TYPE_SCATTER) {
            // log("消除sc")
            checkEnd(false);
        } else {
            // log("消除普通")
            this.updateChild(this.prefabParentList[4], true);
            this.updateChild(this.prefabParentList[3], true);
            // this.waiFaGuang.active = true;
            // this.eliminate.active = true;
            let idx = this.getGuangAndVanishIdx(id);
            let guang = this.waiFaGuang.children[idx];
            let eliminate = this.eliminate.children[idx];
            let silverUp = this.node.getChildByName("silver_up");
            this.waiFaGuang.setScale(1.2, 1.2, 1.2);
            tween(this.icons).to(0.1, { scale: v3(1.3, 1.3, 1.3) }).call(() => {
                let sg = node.children[1];
                CocosUtil.playSpineAnim(sg, sg.name, false, () => {
                    sg.active = false;
                })
                this.iconsDi.active = false;
                this.iconsBlurDi.active = false;
                CocosUtil.playSpineAnim(guang, guang.name, false, () => {
                    guang.active = false;
                })
                if (this.isGold()) {
                    CocosUtil.playSpineAnim(silverUp, "silver_up" + this.count, false, () => {
                        silverUp.active = false;
                        checkEnd(false);
                    });
                    this.scheduleOnce(() => {
                        GameAudio.wdAppear();
                        this.updateChild(this.prefabParentList[1], false);
                        this.resCurPosIdx();
                        this.setId(this.getLvUpId(id))//GameCtrl.getIns().getModel().getChangeElement(this.serverIdx));
                        this.updateIcon(false, true);
                        this.node.getComponent(UIOpacity).opacity = 0;
                        tween(this.node.getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start();
                    }, 0.8)
                } else if (this.isSilver()) {
                    CocosUtil.playSpineAnim(silverUp, "silver_up" + this.count + "_bian", false, () => {
                        silverUp.active = false;
                        checkEnd(false);
                    });
                    this.scheduleOnce(() => {
                        let k = this.kuang.children[this.count - 1];
                        CocosUtil.playSpineAnim(k, k.name, false, () => {
                            k.active = false;
                        })
                        tween(this.node).call(() => {
                            GameAudio.yinChangeJin();
                            this.setId(GameConst.ElementList[MathUtil.getRandomInt(0, GameConst.ElementList.length - 1)] + 32);
                            this.updateIcon(false, false, true);
                        }).delay(0.1).union().repeat(9).call(() => {
                            GameAudio.yinChangeJinEnd();
                            this.resCurPosIdx();
                            this.setId(this.getLvUpId(id))//GameCtrl.getIns().getModel().getChangeElement(this.serverIdx));
                            this.updateIcon(false, true, true);
                            tween(this.icons).to(0.1, { scale: v3(1, 1, 1) }).start();
                        }).start();
                    }, 1)
                } else {
                    // log("普通消除动画", "silver_up" + this.count)
                    this.parentCom.removeSpecified(this);
                    CocosUtil.playSpineAnim(silverUp, "silver_up" + this.count, false, () => {
                        silverUp.active = false;
                        checkEnd(true);
                    });
                }
            }).to(0.1, { scale: v3(1.2, 1.2, 1.2) }).call(() => {
                tween(this.eliminate).delay(0.6).call(() => {
                    spNode.active = false;
                    this.eliminate.setScale(1.2, 1.2, 1.2);
                    GameAudio.normalIconWin();
                    CocosUtil.playSpineAnim(eliminate, "normal_" + eliminate.name, false, () => {
                        eliminate.active = false;
                        this.updateChild(this.prefabParentList[3], false);
                        if (!isChangeMask) {
                            isChangeMask = true;
                            changeMaskCb();
                        }
                    })
                }).start();
            }).start()
        }
    }

    resCurPosIdx() {
        let count = 0;
        for (let i = 0; i < this.parentCom.elementList.length; i++) {
            let ele = this.parentCom.elementList[i];
            if (ele.serverIdx == -1) {
                continue;
            }
            if (ele == this) {
                count += ele.count;
                break;
            } else {
                count += ele.count;
            }
        }
        this.posIdx = this.parentCom.idx * (GameConst.MaxRow - 1) + (GameConst.MaxRow - 1) - count;
        return this.posIdx;
    }

    getGuangAndVanishIdx(id: number) {
        let idx = 0;
        if (id == TItemtype.ITEM_TYPE_H1) {
            if (this.count == 1) {
                idx = 0;
            } else {
                idx = 1;
            }
        } else {
            idx = id - 2;
        }
        return idx;
    }

    getSize() {
        return this.node.getComponent(UITransform).contentSize
    }

    private setId(id:number){
        if(id==48){
            console.log("set id");
        }
       this.id=id;
    }

    private getchangeWildId(next){
        if(next<=0)return 1;
        return next*100+1;
    }

    private getLvUpId(id){
        let tid = id+TItemtype.GOLD_MOD;
        if(this.isGold()){
            tid = this.count*100 +1;
        }
        return tid;
    }

}