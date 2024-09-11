import { log, warn } from "cc";
import { AudioManager } from "../kernel/compat/audio/AudioManager";
import { ResInfo } from "../kernel/compat/load/ResInfo";
import MathUtil from "../kernel/core/utils/MathUtil";



export enum BgmType {
    normal,
    free,
    play_big_award,
}

export default class GameAudio {

    private static _curBgm: ResInfo = null;

    static switchBgm(bgType: BgmType) {
        // let next = null;
        // switch (bgType) {
        //     case BgmType.normal:
        //         next = { respath: "audio/bgm", bundleName: "game" };
        //         break;
        //     case BgmType.free:
        //         next = { respath: "audio/free_bgm", bundleName: "game" };
        //         break;
        // }
        // // if (JSON.stringify(next) == JSON.stringify(this._curBgm)) {
        // //     return;
        // // }
        // // AudioManager.inst.playBGM(next);
        // AudioManager.inst.playBGM({ respath: "audio/bgmA", bundleName: "game" });
        // AudioManager.inst.playBGM({ respath: "audio/bgmB", bundleName: "game" });
        // this._curBgm = next;
    }

    static resumeBgm() {
        if (!this._curBgm) { return; }
        AudioManager.inst.resumeBGM();
    }

    //----------------------------------------------------------------

    static buyFreeStart() {
        AudioManager.inst.playEffet({ respath: "audio/buy_free_start_botton", bundleName: "game" });
    }

    static closeBuyFreePop() {
        AudioManager.inst.playEffet({ respath: "audio/close_buy_free", bundleName: "game" });
    }

    // static duoBaoDown() {
    //     AudioManager.inst.playEffet({ respath: "audio/duo_bao_down", bundleName: "game" });
    // }

    static duoBaoHeart() {
        AudioManager.inst.playEffet({ respath: "audio/duo_bao_heart", bundleName: "game" });
    }

    // static duoBaoWin() {
    //     AudioManager.inst.playEffet({ respath: "audio/duo_bao_win", bundleName: "game" });
    // }

    // static fastStop() {
    //     AudioManager.inst.playEffet({ respath: "audio/fast_stop", bundleName: "game" });
    // }

    static fewIconsWin() {
        AudioManager.inst.playEffet({ respath: "audio/few_icons_win", bundleName: "game" });
    }

    static freeAddNum() {
        AudioManager.inst.playEffet({ respath: "audio/free_add_num", bundleName: "game" });
    }

    static mulChange() {
        AudioManager.inst.playEffet({ respath: "audio/mul_change", bundleName: "game" });
    }

    static normalIconWin() {
        AudioManager.inst.playEffet({ respath: "audio/normal_icon_win", bundleName: "game" });
    }

    // static normalReelStop() {
    //     AudioManager.inst.playEffet({ respath: "audio/normal_reel_stop", bundleName: "game" });
    // }

    static openBuyFree() {
        AudioManager.inst.playEffet({ respath: "audio/open_buy_free", bundleName: "game" });
    }

    // static startFreeButton() {
    //     AudioManager.inst.playEffet({ respath: "audio/start_free_button", bundleName: "game" });
    // }

    // static ting(num: number) {
    //     AudioManager.inst.stopMusic();
    //     AudioManager.inst.playMusic({ respath: "audio/ting" + num, bundleName: "game" });
    // }

    static tingNormalIconDown() {
        AudioManager.inst.playEffet({ respath: "audio/ting_normal_icon_drop", bundleName: "game" });
    }

    // static topScoreRun() {
    //     AudioManager.inst.stopMusic();
    //     AudioManager.inst.playMusic({ respath: "audio/top_score_run", bundleName: "game" });
    // }

    // static topScoreRunEnd() {
    //     AudioManager.inst.stopMusic();
    //     AudioManager.inst.playEffet({ respath: "audio/top_score_end", bundleName: "game" });
    // }

    static topNormalWin() {
        AudioManager.inst.playEffet({ respath: "audio/top_win", bundleName: "game" });
    }

    static wdAppear() {
        AudioManager.inst.playEffet({ respath: "audio/wd_appear", bundleName: "game" }, 2);
    }

    static wdDisappear() {
        AudioManager.inst.playEffet({ respath: "audio/wd_disappear", bundleName: "game" }, 2);
    }

    static winFreeAdd() {
        AudioManager.inst.playEffet({ respath: "audio/win_free_add", bundleName: "game" });
    }

    static normalWinScore() {
        AudioManager.inst.playEffet({ respath: "audio/win_score", bundleName: "game" });
    }

    static yinChangeJin() {
        AudioManager.inst.playMusic({ respath: "audio/yin_jin_change", bundleName: "game" });
    }

    static yinChangeJinEnd() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playEffet({ respath: "audio/yin_jin_change_end", bundleName: "game" });
    }

    //开始旋转
    static startSpin() {
        AudioManager.inst.playEffet({ respath: "audio/spin", bundleName: "game" });
    }

    //普通中奖结算
    static normalWinTotal() {
        AudioManager.inst.playEffet({ respath: "audio/top_win_total", bundleName: "game" });
    }

    /**卷轴滚动声音 */
    static juanzhouRoll() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playMusic({ respath: "audio/reel_run", bundleName: "game" }, true)
    }
    static stopBigAward() {
        AudioManager.inst.resumeBGM();
        AudioManager.inst.stopMusic();
    }

    static clickShowRateTip() {
        AudioManager.inst.playEffet({ respath: "audio/open_pfb", bundleName: "game" });
    }

    static bigWinEnd() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playEffet({ respath: "audio/big_win_end", bundleName: "game" });
    }

    static bigWin() {
        AudioManager.inst.pauseBGM();
        AudioManager.inst.stopMusic();
        AudioManager.inst.playMusic({ respath: "audio/big_win", bundleName: "game" });
    }

    //--------------------------------------------new------------------------------------------
    static scatterStop() {
        AudioManager.inst.playEffet({ respath: "audio/duo_bao_down", bundleName: "game" });
    }

    static scatterEffect(num: number) {
        AudioManager.inst.playMusic({ respath: "audio/ting" + num, bundleName: "game" });
    }

    static normalRollStop() {
        AudioManager.inst.playEffet({ respath: "audio/normal_reel_stop", bundleName: "game" }, 2);
    }

    static turboRollStop() {
        AudioManager.inst.playEffet({ respath: "audio/fast_stop", bundleName: "game" });
    }

    static winFree() {
        AudioManager.inst.playEffet({ respath: "audio/duo_bao_win", bundleName: "game" });
    }

    // /**消除 */
    // static eliminate() {
    //     AudioManager.inst.playEffet({ respath: "audio/FX-16", bundleName: "game" });
    // }

    static freeSettlement() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playMusic({ respath: "audio/free_end_start", bundleName: "game" });
    }

    static freeSettlementEnd() {
        AudioManager.inst.stopMusic();
        AudioManager.inst.playMusic({ respath: "audio/free_end_end", bundleName: "game" });
    }

    static freeFireWorks() {
        AudioManager.inst.playEffet({ respath: "audio/free_end_fireworks", bundleName: "game" });
    }

    static freeAward() {
        AudioManager.inst.playEffet({ respath: "audio/start_free_button", bundleName: "game" });
    }

    static roundTotalWin() {
        AudioManager.inst.playMusic({ respath: "audio/top_score_run", bundleName: "game" });
    }

    static roundTotalWinEnd() {
        AudioManager.inst.playEffet({ respath: "audio/top_score_end", bundleName: "game" });
    }

    static caiDai() {
        AudioManager.inst.playEffet({ respath: "audio/cai_dai", bundleName: "game" },2);
    }

    static refreshMul() {
        AudioManager.inst.playEffet({ respath: "audio/refresh_mul", bundleName: "game" });
    }

}


