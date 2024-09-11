import { tween } from 'cc';
import { HTML5 } from 'cc/env';

// 闪屏图处理

export class ScreenSplashLogo {
    private svgStartDate = "_svgStartDate";
    private svgDuration = "_svgDuration";
    hideLoadingSvg() {
        if (HTML5) {
            let removeDom = () => {
                let fadeOutDuration = 0.4;
                let obj = { opacity: 1 };

                let initialLoader = "initial-loader"
                tween(obj)
                    .to(fadeOutDuration, { opacity: 0.0 }, {
                        progress: (start: number, end: number, current: number, ratio: number) => {
                            let v = start + ((end - start) * ratio);
                            let domSvg = document.getElementById(initialLoader);
                            if (domSvg) {
                                domSvg.style.opacity = `${v}`;
                            }

                            return v;
                        },
                        // easing: "quintIn",
                    })
                    .call(() => {
                        let domSvg = document.getElementById(initialLoader);
                        if (domSvg) {
                            domSvg.remove();
                        }
                    })
                    .start();
            };
            let _svgStartDate = window[this.svgStartDate] as Date;
            if (!_svgStartDate) {
                removeDom();
                return;
            }

            let _svgDuration = window[this.svgDuration] as number;

            let now = new Date();
            let pastTime = now.getTime() - _svgStartDate.getTime();
            if (pastTime < _svgDuration) {
                tween({})
                .delay((_svgDuration - pastTime) / 1000)
                .call(()=>{
                    removeDom();
                })
                .start()
                return;
            }

            removeDom();
        }
    }

    async waitSplashLogoHide(){
        let _svgStartDate =  window[this.svgStartDate] as Date;
        if (!_svgStartDate){
            return 
        }

        let _svgDuration = window[this.svgDuration] as number + 500;

        let now = new Date();
        let pastTime = now.getTime() - _svgStartDate.getTime();
        if (pastTime < _svgDuration){
            await window["PromiseEx"].CallDelayOnly((_svgDuration - pastTime) / 1000)
        }
    }
}


