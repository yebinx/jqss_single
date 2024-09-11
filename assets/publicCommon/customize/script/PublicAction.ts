import BigNumber from "bignumber.js";
import { Tween } from "cc";
import { tween } from "cc";
import { Label, Node } from "cc";
import MoneyUtil from "../../../scripts/kernel/core/utils/MoneyUtil";
import { Sprite } from "cc";
import { Color } from "cc";
import { AudioManager } from "../../../scripts/kernel/compat/audio/AudioManager";
import { sp } from "cc";

class _PublicAction {

    menuConfig = { initY: 20.862, moveY: 200 };

    /**固定时间跑分  */
    runScore(label: Label, duration: number, target: number, start: number, format: boolean = true, hasSymbol: boolean = false) {
        return new Promise<void>((resolve, reject) => {
            Tween.stopAllByTarget(label.node);
            let now = new Date().getTime();
            duration *= 1000;
            tween(label.node).call(() => {
                let c = new Date().getTime() - now;
                let b = c / duration;
                if (b > 1) {
                    b = 1;
                    Tween.stopAllByTarget(label.node);
                    resolve();
                }
                // b = 1 - Number(Math.cos((b * Math.PI) / 2).toFixed(4))
                if (hasSymbol) {
                    label.string = MoneyUtil.currencySymbol();
                } else {
                    label.string = "";
                }
                if (format) {
                    label.string += MoneyUtil.formatGold(new BigNumber(start).plus(new BigNumber(b).multipliedBy(new BigNumber(target).minus(start))).toNumber());
                } else {
                    label.string += new BigNumber(start).plus(new BigNumber(b).multipliedBy(new BigNumber(target).minus(start))).toFixed(2);
                }
            }).delay(0.001).union().repeatForever().start();
        })
    }
    
    /**按钮音效 */
    btnAudio(config: {name: string, vol: number}) {
        AudioManager.inst.playEffet({ respath: "customize/audio/" + config.name, bundleName: "publicCommon" }, config.vol);
    }
}

export const PublicAction = new _PublicAction();