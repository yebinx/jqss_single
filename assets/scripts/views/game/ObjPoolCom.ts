import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import CocosPool from '../../kernel/compat/pool/CocosPool';
import { ElementCom } from './ElementCom';
import { TItemtype } from '../../define/GameConst';
const { ccclass, property } = _decorator;

@ccclass('ObjPoolCom')
export class ObjPoolCom extends Component {

    static objPoolMgr: ObjPoolCom = null;

    @property(Prefab)
    prefabElement: Prefab;

    elementPool: CocosPool

    onLoad() {
        this.initPools()
        ObjPoolCom.objPoolMgr = this;
    }


    initPools() {
        this.elementPool = new CocosPool(() => {
            return instantiate(this.prefabElement)
        })
    }

    createElement() {
        return this.elementPool.newObject()
    }

    delElement(node) {
        this.elementPool.delObject(node)
    }

}


