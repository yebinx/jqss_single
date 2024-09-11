import { _decorator, Component, input, Input, KeyCode, log, Node, sys, System } from 'cc';
import { UIManager } from './kernel/compat/view/UImanager';
import logger from './kernel/core/logger';
import { EViewNames, g_uiMap } from './configs/UIConfig';
import UrlUtil from './kernel/core/utils/UrlUtil';
import HttpMgr from './mgrs/HttpMgr';
import LoginCtrl from './ctrls/LoginCtrl';
import TimerManager from './kernel/compat/timer/TimerManager';
import EventCenter from './kernel/core/event/EventCenter';
import GameEvent from './event/GameEvent';
import { Sprite } from 'cc';
import { sp } from 'cc';
import { EDITOR, PREVIEW } from 'cc/env';
import { find } from 'cc';
const { ccclass, property } = _decorator;

let old = Sprite.prototype.onLoad;
Sprite.prototype.onLoad = function() {
    old && old.bind(this)();
    let t = this.sizeMode;
    if (t == Sprite.SizeMode.TRIMMED) {
        this.sizeMode = Sprite.SizeMode.RAW;
    }
    if (t == Sprite.SizeMode.RAW) {
        this.sizeMode = Sprite.SizeMode.TRIMMED;
    }
    this.sizeMode = t;
}

if (EDITOR) {
    sp.Skeleton.prototype.updateAnimation = function (dt: number) {
        this.markForUpdateRenderData();
        if (this.paused) return;
        dt *= this._timeScale * 1;
        if (this.isAnimationCached()) {
            if (this._isAniComplete) {
                if (this._animationQueue.length === 0 && !this._headAniInfo) {
                    const frameCache = this._animCache;
                    if (frameCache && frameCache.isInvalid()) {
                        frameCache.updateToFrame(0);
                        const frames = frameCache.frames;
                        this._curFrame = frames[frames.length - 1];
                    }
                    return;
                }
                if (!this._headAniInfo) {
                    this._headAniInfo = this._animationQueue.shift()!;
                }
                this._accTime += dt;
                if (this._accTime > this._headAniInfo?.delay) {
                    const aniInfo = this._headAniInfo;
                    this._headAniInfo = null;
                    this.setAnimation(0, aniInfo?.animationName, aniInfo?.loop);
                }
                return;
            }
            this._updateCache(dt);
        } else {
            this._instance.updateAnimation(dt);
        }
    }
}

@ccclass('Main')
export class Main extends Component {

    onLoad() {
        UIManager.setUIRoot(this.node);
        UIManager.setUIMap(g_uiMap);
        // Adaptor.listenScreen()
        TimerManager.start(this);
        // PlatformUtil.setOrientation(false);
        // Adaptor.adaptScreen();
        // Adaptor.deepUpdateAlignment(this.node);
        // logger.enableLogger(sys.os == sys.OS.WINDOWS)
        input.on(Input.EventType.KEY_DOWN, this.onKeyDwon, this);
        input.on(Input.EventType.KEY_PRESSING, this.onPreesing, this);
        log("game_version", 11)
        // l10n.on
    }

    parseUrl() {
        let token = UrlUtil.ParserUrlToken();
        if (token) {
            LoginCtrl.getIns().getModel().setToken(token);
            let domain = UrlUtil.ParseUrlDomain();
            if (domain) {
                HttpMgr.getIns().setDomain(domain)
            }
        }
    }


    onKeyDwon(event) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                let tips = find("Canvas/ScreenRotationTips");
                if (tips && tips.active) {
                    return;
                }
                EventCenter.getInstance().fire(GameEvent.key_down_space)
                break;
        }
    }


    onPreesing(event) {
        switch (event.keyCode) {
            case KeyCode.SPACE:
                let tips = find("Canvas/ScreenRotationTips");
                if (tips && tips.active) {
                    return;
                }
                EventCenter.getInstance().fire(GameEvent.key_pressing_space)
                break;
        }
    }

    start() {
        this.parseUrl()
        UIManager.showView(EViewNames.LoadinView)
    }


}

