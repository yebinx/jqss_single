import { Tween, tween } from 'cc';
import NoSleep from '@marsgames/nosleep.js';

export class NoSleepEx {
    private static noSleep: NoSleep = null;
    private static enabled = false;
    private static schedule: Tween<{}> = null;

    // 在开始按钮调用，需要跟玩家交换的接口调用，否则可能会出现权限不足
    static init() {
        if (!this.noSleep) {
            this.noSleep = new NoSleep();
        }

        this.keepScreenOn(); // 调用是异步的
        // this.cancelScreenOn();

        tween({})
            .delay(5)
            .call(() => { this.checkSleep(); })
            .start(); // 检查状态

        this.initAfter();
    }

    private static initAfter() {
        // this.scheduleDump();
    }

    // 开启屏幕常亮
    static keepScreenOn() {
        //console.log("keepScreenOn", 1111111111);
        this.enabled = true;
        this.scheduleCheck();

        if (this.noSleep.isEnabled) {
            return;
        }
        this.noSleep.enable();
        //console.log("keepScreenOn", 2222222222);
    }

    // 取消屏幕常亮
    static cancelScreenOn() {
        //console.log("cancelScreenOn", 1111111111);
        this.enabled = false;
        if (this.noSleep && this.noSleep.isEnabled) {
            this.noSleep.disable();
            //console.log("cancelScreenOn", 2222222222);
        }
    }

    // 定时检查 休眠状态
    private static scheduleCheck() {
        if (this.schedule) {
            Tween.stopAllByTarget(this.schedule);
            this.schedule = null;
        }

        let empty = {};
        this.schedule = tween(empty)
            .delay(5)
            .call(() => {
                this.schedule = null;
                NoSleepEx.checkSleep();
                if (!this.enabled) {
                    return;
                }

                this.scheduleCheck();
            })
            .start();
    }

    private static checkSleep() {
        //console.log("checkSleep", 1111111111);
        if (!this.noSleep) {
            return;
        }

        if (this.enabled) {
            //console.log("checkSleep", 22222222);
            this.noSleep.enable();
            return;
        }

        if (!this.enabled && this.noSleep.isEnabled) {
            this.noSleep.disable();
            //console.log("checkSleep", 33333333);
            return;
        }
    }

    // // 定时打印状态
    // private static scheduleDump() {
    //     let obj = {};
    //     tween(obj)
    //         .repeatForever(
    //             tween(obj)
    //                 .delay(10)
    //                 .call(() => {
    //                     console.log(JSON.stringify({
    //                         "noSleep": this.noSleep?.isEnabled || false,
    //                         "enabled": this.enabled
    //                     }));
    //                 })
    //         )
    //         .start();
    // }
}

window["NoSleepEx"] = NoSleepEx;