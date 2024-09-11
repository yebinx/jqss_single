import { _decorator, Component, Node, sp, warn } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    @property(sp.Skeleton)
    spHuzi: sp.Skeleton = null;

    async start() {
        let sps = this.node.getComponent(sp.Skeleton);
        let anim = ["freein_idle_15", "freein_idle_17", "freein_idle_19", "freein_idle_21"];
        let idx = 0;
        let temp = [];
        while (idx < anim.length) {
            sps.setAnimation(0, anim[idx], false);
            temp.push({name: anim[idx], time: sps.getCurrent(0).animationEnd})
            idx++;
            await this.waitTime();
        }
        warn("temp", JSON.stringify(temp))
    }
    
    waitTime() {
        return new Promise<void>((resolve, reject) => {
            this.scheduleOnce(() => {
                resolve()
            }, 0.1)
        })
    }

    update(deltaTime: number) {

    }
}