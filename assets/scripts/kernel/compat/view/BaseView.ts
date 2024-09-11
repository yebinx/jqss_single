import { _decorator, Component, input, Input, KeyCode, Label, Node } from 'cc';
import { BaseComp } from './BaseComp';
import { EViewNames } from '../../../configs/UIConfig';
import CocosUtil from '../CocosUtil';

const { ccclass, property } = _decorator;

@ccclass('BaseView')
export class BaseView extends BaseComp {


    uiNmae: EViewNames;

    protected onLoad(): void {
        CocosUtil.traverseNodes(this.node, this.m_ui);
    }

    /**onLoad之前调用 */
    init(...args) {
    }

    before(...arg) {
    }

    /**onLoad之后调用 */
    initData(viewInfo) {

    }

    async closeBefore():Promise<void> {
    }

}