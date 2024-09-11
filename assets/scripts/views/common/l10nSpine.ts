import { assetManager } from 'cc';
import { _decorator, Component, Node } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import { sp } from 'cc';
import { CCString } from 'cc';
import { __private } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('l10nSpine')
export class l10nSpine extends sp.Skeleton {

    @property(CCString)
    bundleName: string = "";

    @property(CCString)
    path: string = "";

    @property(CCString)
    prePlayName: string = "";

    private _isLoaded: boolean = false;
    private _temp = {
        name: "",
        isLoop: false,
        trackIndex: 0
    }

    start() {
        super.start && super.start();
        assetManager.getBundle(this.bundleName).load(this.path.replace("%{0}", l10n.currentLanguage), sp.SkeletonData, (err, data) => {
            if (err) {
                return console.error(err);
            }
            this.node.getComponent(sp.Skeleton).skeletonData = data;
            this._isLoaded = true;
            if (this._temp.name) {
                this.setAnimation(this._temp.trackIndex, this._temp.name, this._temp.isLoop);
            } else if (this.prePlayName) {
                this.setAnimation(0, this.prePlayName, this.loop);
            }
        })
    }

    setAnimation(trackIndex: number, name: string, loop?: boolean): sp.spine.TrackEntry {
        if (!this._isLoaded) {
            this._temp.name = name;
            this._temp.isLoop = loop;
            this._temp.trackIndex = trackIndex;
            return;
        }
        return super.setAnimation(trackIndex, name, loop);
    }

    update(deltaTime: number) {
        
    }
}


