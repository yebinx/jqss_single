import { _decorator, Component, Node } from 'cc';
import { BaseView } from '../../kernel/compat/view/BaseView';
import { EventMouse } from 'cc';
import { tween } from 'cc';
import { EventTouch } from 'cc';

import { UIOpacity } from 'cc';

import { UIManager } from '../../kernel/compat/view/UImanager';
import { EViewNames } from '../../configs/UIConfig';

import { Layout } from 'cc';
import { Label } from 'cc';
import EventCenter from '../../kernel/core/event/EventCenter';

import { PUBLIC_EVENTS } from '../../event/PublicEvents';
import BigNumber from 'bignumber.js';

import MoneyUtil from '../../kernel/core/utils/MoneyUtil';
import GameAudio from '../../mgrs/GameAudio';
import { NetworkSend } from '../../network/NetworkSend';
import { EUILayer, ParamConfirmDlg } from '../../kernel/compat/view/ViewDefine';
import DataManager from '../../network/netData/DataManager';

const { ccclass, property } = _decorator;

@ccclass('BuyFreePop')
export class BuyFreePop extends BaseView {

    private mIsBuying:boolean=false;
    private mBet:number=0;
    private mPrice:number=0;
    protected onLoad(): void {
        super.onLoad();
        this.node.getComponent(UIOpacity).opacity = 0;
        tween(this.node.getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start();
    }

    start() {
        this.m_ui.cancel.on(Node.EventType.MOUSE_ENTER, this.mouseEnter, this);
        this.m_ui.cancel.on(Node.EventType.MOUSE_LEAVE, this.mouseLeave, this);
        this.m_ui.confirm.on(Node.EventType.MOUSE_ENTER, this.mouseEnter, this);
        this.m_ui.confirm.on(Node.EventType.MOUSE_LEAVE, this.mouseLeave, this);

        // this.m_ui.cancel.on(Node.EventType.TOUCH_START, this.touchStart, this);
        // this.m_ui.cancel.on(Node.EventType.TOUCH_START, this.touchEnd, this);
       
        EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT, (num: number) => {
           
            this.mBet = num;
        })
        this.mPrice = new BigNumber(this.mBet).multipliedBy(75).toNumber();
        this.m_ui.buy_free_prize.getComponent(Label).string = MoneyUtil.rmbStr(this.mPrice);
        this.mIsBuying=false;
    }

    mouseEnter(ev: EventMouse) {
        let node = ev.target as Node;
        tween(node.getChildByName("fb_window_hover_add").getComponent(UIOpacity)).to(0.5, { opacity: 255 }).start();

    }

    mouseLeave(ev: EventMouse) {
        let node = ev.target as Node;
        tween(node.getChildByName("fb_window_hover_add").getComponent(UIOpacity)).to(0.5, { opacity: 0 }).start();
        // Tween.stopAllByTarget(node);
        // tween(node).to(0.5, { scale: v3(1, 1, 1) }).start();
    }

    touchStart(ev: EventTouch) {
        // let node = ev.target as Node;
        // tween(node).to(0.5, { scale: v3(1.2, 1.2, 1.2) }).start();
    }

    // touchEnd(ev: EventTouch) {
    //     let node = ev.target as Node;
    //     tween(node).to(0.5, { scale: v3(1, 1, 1) }).start();
    //     if (node.name == "cancel") {
    //         this.cancel();
    //         console.error("cancel")
    //     } else {
    //         this.confirm();
    //     }
    // }

    cancel(ev?: EventTouch) {
        tween(this.node.getComponent(UIOpacity)).to(0.5, { opacity: 0 }).call(() => {
            UIManager.closeView(EViewNames.UIBuyFree);
        }).start();
        ev && GameAudio.closeBuyFreePop();
    }

    confirm() {
        if(this.mIsBuying)return;
        this.buy();
    }

    update(deltaTime: number) {
        this.m_ui.Layout.getComponent(Layout).affectedByScale = true;
    }

    protected onEnable(): void {
        EventCenter.getInstance().listen("buy_free",this.buyCall,this);
    }

    protected onDisable(): void {
      
        EventCenter.getInstance().remove("buy_free",this.buyCall,this);
    }

    private buy(){
        this.mIsBuying=true;
        let tbalance;
        EventCenter.getInstance().fire(PUBLIC_EVENTS.BALANCE_INFO, (num) => {
            tbalance = num;
        })
        // EventCenter.getInstance().fire(PUBLIC_EVENTS.GET_BET_AMOUNT,(betAmount)=>{
        // },this)
       
        if(this.mPrice>tbalance){
            this.showAlert("余额不足");
            return;
        }
        console.log("buy free",tbalance,this.mPrice,tbalance-this.mPrice);
        NetworkSend.Instance.buyFree(this.mBet);
    }

    private buyCall(value){
        if(value==0){
            this.cancel();
            GameAudio.buyFreeStart();
            EventCenter.getInstance().fire(PUBLIC_EVENTS.ON_SPIN, true);
        }else{
            this.showAlert("购买免费游戏出错");
        }
    }
    
    private showAlert(conttent:string){
        let params: ParamConfirmDlg = {
            callback:()=>{
                this.mIsBuying=false;
            },
            title: "Tip",
            content: conttent,
            okTxt:"OK"
        }
        UIManager.showView(EViewNames.UIConfirmTip, EUILayer.Popup, params)

    }
}


