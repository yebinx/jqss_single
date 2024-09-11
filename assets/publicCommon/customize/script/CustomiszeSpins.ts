import { sp } from 'cc';
import { Node } from 'cc';
import EventCenter from '../../../scripts/kernel/core/event/EventCenter';
import { PUBLIC_EVENTS } from '../../../scripts/event/PublicEvents';
import { Tween } from 'cc';
import { tween } from 'cc';
import { Sprite } from 'cc';
import { PublicConfig } from './PublicConfig';
import { UIOpacity } from 'cc';
import { Label } from 'cc';
import { game } from 'cc';

export class CustomiszeSpins {

    private static m_ui: { [name: string]: Node } = null;

    static init(ui: { [name: string]: Node }) {
        this.m_ui = ui;

        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_POINTER_STATE, this.spinPointer, this);
        EventCenter.getInstance().listen(PUBLIC_EVENTS.CHANGE_POINTER_COLOR, this.spinColor, this);
    }

    static autoHover() {
        let light = this.m_ui.AutoBtn.getChildByName("button_light");
        if (light.active) {
            return;
        }
        light.active = true;
        Tween.stopAllByTarget(light);
        let anim = () => {
            light.getComponent(sp.Skeleton).setToSetupPose()
            light.getComponent(sp.Skeleton).setAnimation(0, "anniuauto_idle", false);
            light.getComponent(sp.Skeleton).setCompleteListener(() => {
                light.getComponent(sp.Skeleton).setCompleteListener(null);
                tween(light).delay(0.2).call(() => {
                    if (light.active) {
                        anim();
                    }
                }).start()
            })
        }
        anim();
    }

    static autoHoverLeave() {
        this.m_ui.AutoBtn.getChildByName("button_light").active = false;
    }

    static spinHover() {
        let light = this.m_ui.SpinBtn.getChildByName("button_light");
        if (light.active || !light.parent.active) {
            return;
        }
        light.active = true;
        Tween.stopAllByTarget(light);
        let anim = () => {
            light.getComponent(sp.Skeleton).setAnimation(0, "anniu_idle", false);
            light.getComponent(sp.Skeleton).setCompleteListener(() => {
                light.getComponent(sp.Skeleton).setCompleteListener(null);
                tween(light).delay(0.2).call(() => {
                    if (light.active) {
                        anim();
                    }
                }).start()
            })
        }
        anim();
    }

    static spinHoverLeave() {
        this.m_ui.SpinBtn.getChildByName("button_light").active = false;
    }

    static changeSpinAnim(animName: string, isLoop: boolean = false, spinHover: boolean = false) {
        let light = this.m_ui.SpinBtn.getChildByName("button_light");
        if (!animName) {
            if (spinHover) {
                this.spinHover();
            } else {
                light.active = false;
            }
            return;
        }
        light.active = true;
        let sps = light.getComponent(sp.Skeleton);
        if (!isLoop) {
            sps.setAnimation(0, animName, isLoop);
            sps.setCompleteListener(() => {
                light.active = false;
                sps.setCompleteListener(null);
            })
        } else {
            sps.setAnimation(0, animName, isLoop);
        }
    }

    static spinPointer(state: number) {
        if (state == 0) {
            this.m_ui.pointer.active = true;
            this.m_ui.pointerBlur.active = false;
            this.spinColor(false);
            Tween.stopAllByTarget(this.m_ui.pointer_box);
            tween(this.m_ui.pointer_box).by(1, { angle: window["spinPointer"].normalAngularVelocity }).repeatForever().start();
        } else if (state == 1) {
            this.m_ui.pointer.active = true;
            this.m_ui.pointerBlur.active = false;
            Tween.stopAllByTarget(this.m_ui.pointer_box);
            tween(this.m_ui.pointer_box).by(0.2, { angle: window["spinPointer"].accelerateAngularVelocity }).repeatForever().start();
        } else if (state == 2) {
            this.m_ui.pointer.active = false;
            this.m_ui.pointerBlur.active = true;
        } else if (state == 3) {
            this.m_ui.pointer.active = true;
            this.m_ui.pointerBlur.active = false;
            this.spinColor(true);
            Tween.stopAllByTarget(this.m_ui.pointer_box);
        }
    }

    static spinColor(isGray: boolean, isLight?: boolean) {
        this.m_ui.pointerLight.active = !!isLight;
        if (isLight) {
            tween(this.m_ui.pointerLight.getComponent(UIOpacity)).to(1, { opacity: 0 }).call(() => {
                this.m_ui.pointerLight.active = false;
            }).start();
        } else {
            Tween.stopAllByTarget(this.m_ui.pointerLight.getComponent(UIOpacity));
            this.m_ui.pointerLight.getComponent(UIOpacity).opacity = 255;
        }
        this.m_ui.pointer.getComponent(Sprite).grayscale = isGray;
        this.m_ui.pointerBlur.getComponent(Sprite).grayscale = isGray;
    }

    static exitAuto() {
        Tween.stopAllByTarget(this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName])
        tween(this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].getComponent(UIOpacity)).to(0.3, { opacity: 0 }).call(() => {
            this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].active = false;
            this.m_ui[PublicConfig.autoSpinBtnConfig.autoNumNodeName].getComponent(Label).string = "0";
        }).start()
    }

    static autoNum(cnt: number, isOpen: boolean) {
        let oldState = this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].active;
        if (oldState != isOpen) {
            this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].active = isOpen
            this.m_ui[PublicConfig.autoSpinBtnConfig.autoNodeName].getComponent(UIOpacity).opacity = 255;
            this.autoHoverLeave();
        }
        this.m_ui[PublicConfig.autoSpinBtnConfig.autoNumNodeName].getComponent(Label).string = cnt + "";
    }

}