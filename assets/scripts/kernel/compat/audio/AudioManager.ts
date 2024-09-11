//-------------------------------------
//-- 音频播放
//-------------------------------------
import { Node, AudioSource, AudioClip, resources, director, log, warn, error } from 'cc';
import LoadHelper from '../load/LoadHelper';
import { ResInfo } from '../load/ResInfo';

export class AudioManager {
    private static _inst: AudioManager;

    private clipEffectList: AudioClip[] = []

    public static get inst(): AudioManager {
        if (this._inst == null) {
            this._inst = new AudioManager();
        }
        return this._inst;
    }

    private _bgmSource: AudioSource;
    private _musicSource: AudioSource;
    private _effetSource: AudioSource;
    private _bgmSourceMap: Map<AudioClip, AudioSource> = new Map();

    public _bgmEnable = true;
    private _musicEnable = true;
    private _effectEnable = true;

    public _bgmVolume = 1;
    private _musicVolume = 0.8;
    private _effectVolume = 0.5;
    private _curBgm: AudioSource = null;
    private _bgmInterval: NodeJS.Timeout = null;

    /**屏蔽重叠音效 */
    private _effectMap: Map<AudioClip, NodeJS.Timeout> = new Map();

    private constructor() {
        this.setBgmVolume(this._bgmVolume);
        this.setMusicVolume(this._musicVolume);
        this.setEffetVolume(this._effectVolume);
    }

    private createSource(sName: string) {
        let audioNode = new Node();
        audioNode.name = sName;
        director.getScene().addChild(audioNode);
        return audioNode.addComponent(AudioSource);
    }

    private get bgmSource() {
        this._bgmSource = this._bgmSource || this.createSource("bgmNode__");
        return this._bgmSource;
    }

    private getBgmSource(clip: AudioClip) {
        let source = this._bgmSourceMap.get(clip);
        if (!source) {
            source = this.createSource("bgmNode__");
            source.clip = clip;
            this._bgmSourceMap.set(clip, source);
        }
        return source;
    }

    private get musicSource() {
        this._musicSource = this._musicSource || this.createSource("musicNode__");
        return this._musicSource;
    }

    private get effetSource() {
        this._effetSource = this._effetSource || this.createSource("effetNode__");
        return this._effetSource;
    }

    setBgmVolume(v: number) {
        this._bgmVolume = v;
    }

    setMusicVolume(v: number) {
        this._musicVolume = v;
    }

    setEffetVolume(v: number) {
        this._effectVolume = v;
    }


    setBgmEnable(b: boolean) {
        this._bgmEnable = b;
        if (!b) {
            this.pauseBGM();
        } else {
            this.resumeBGM();
        }
    }

    setMusicEnable(b: boolean) {
        this._musicEnable = b;
        if (!b) {
            this.stopMusic();
        } else {
            this.resumeMusic();
        }
    }

    setEffetEnable(b: boolean) {
        this._effectEnable = b;
        if (!b) {
            this.stopEffet();
        } else {
            this.resumeEffet();
        }
    }

    setAllEnabled(b: boolean) {
        this.setBgmEnable(b);
        this.setMusicEnable(b);
        this.setEffetEnable(b);
    }

    get bgmEnable() {
        return this._bgmEnable;
    }

    get musicEnable() {
        return this._musicEnable;
    }

    get effectEnable() {
        return this._effectEnable;
    }

    playBGM(sound: ResInfo) {
        if (!this._bgmEnable) { return; }
        LoadHelper.loadRes(sound, AudioClip, (err, clip: AudioClip) => {
            if (err) {
                log(err);
            } else {
                this.playBGMex(clip);
            }
        });
    }

    private playBGMex(clib: AudioClip) {
        if (!this._bgmEnable) { return; }

        if (this._curBgm?.clip == clib && this._curBgm?.state == AudioSource.AudioState.PLAYING) {
            return;
        }
        this._curBgm?.stop();

        let source = this._bgmSourceMap.get(clib);
        if (!source) {
            source = this.getBgmSource(clib);
            source.volume = this._bgmVolume;
            source.loop = true;
        }
        source.play();
        this._curBgm = source;
    }

    playMusic(sound: ResInfo, loop: boolean = false) {
        if (sound === undefined || sound === null) { return; }
        if (!this._musicEnable) { return; }
        LoadHelper.loadRes(sound, AudioClip, (err, clip: AudioClip) => {
            if (err) {
                log(err);
            } else {
                this.playMusicEx(clip, loop);
            }
        });
    }

    private playMusicEx(clib: AudioClip, loop: boolean = false) {
        if (!this._musicEnable) { return; }
        let srcMusic = this.musicSource;
        srcMusic.volume = this._musicVolume;
        srcMusic.loop = loop;
        srcMusic.clip = clib;
        srcMusic.play();
    }

    playEffet(sound: ResInfo, v: number = 1) {
        if (sound === undefined || sound === null) { return; }
        if (!this._effectEnable) { return; }
        LoadHelper.loadRes(sound, AudioClip, (err, clip: AudioClip) => {
            if (err) {
                log(err);
            } else {
                this.playEffetEx(clip, v);
            }
        });
    }

    private playEffetEx(clip: AudioClip, v: number) {
        if (!this._effectEnable) { return; }
        let has = this._effectMap.get(clip);
        if (has) {
            return
        } else {
            let id = setTimeout(() => {
                this._effectMap.delete(clip);
            }, 35)
            this._effectMap.set(clip, id);
        }
        this.effetSource.loop = false;
        this.effetSource.playOneShot(clip, v * this._effectVolume);
        // this.clipEffectList.push(clip);
    }

    stopBGM() {
        this._bgmSourceMap.forEach((source) => {
            source.stop();
        })
    }

    pauseBGM() {
        this._curBgm?.pause();
    }

    resumeBGM() {
        if (!this._bgmEnable) { return; }
        if (this._curBgm && this._curBgm.state == AudioSource.AudioState.PAUSED) {
            this._curBgm.volume = 0;
            this._curBgm.play();
            clearInterval(this._bgmInterval);
            this._bgmInterval = setInterval(() => {
                let t = this._curBgm.volume + 0.02;
                if (t >= 1) {
                    t = 1;
                    clearInterval(this._bgmInterval);
                }
                this._curBgm.volume = t;
            }, 50)
        }
    }

    stopMusic() {
        if (this._musicSource) {
            this._musicSource.stop();
            this._musicSource.node.destroy();
            this._musicSource = null;
        }
    }

    pauseMusic() {
        this.musicSource?.pause();
    }

    resumeMusic() {
        if (!this._musicEnable) { return; }
        this.musicSource.play();
    }

    stopEffet() {
        this.effetSource.stop();
    }

    pauseEffet() {
        this.effetSource.pause();
    }

    resumeEffet() {
        if (!this._effectEnable) { return; }
        this.effetSource.play();
    }

}
