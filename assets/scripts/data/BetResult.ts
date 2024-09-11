
import DataManager from "../network/netData/DataManager";
import BetResultEle from "./BetResultEle";
import CardListEle from "./CardListEle";

export default class BetResult{
    public row:number=5;
    public col:number=5;
    public balance:number=0;
    public result:Array<BetResultEle>=[];
    public bet:number=0;
    public freeCount:number=0;
    public totalFreeCount:number=0;
    public triFreeCount:number=0;
    public prize:number=0;
    public order_id:string="7-1703208881-4DB83D1F0";
    public haveWin:number=0;
    public lNormalTotalAwardGold:number=0;
    public nFreeTotalAwardGold:number=0;
    constructor(CMD_S_GameEnd){
       this.addRound(CMD_S_GameEnd);
    }

    public addRound(CMD_S_GameEnd){
        this.setOutData(CMD_S_GameEnd);
        this.addResultData(CMD_S_GameEnd);
    }

    private setOutData(CMD_S_GameEnd){
        this.balance = CMD_S_GameEnd.llUserTotalScore.value;
        this.freeCount = CMD_S_GameEnd.nFreeCount.value;
        this.totalFreeCount = CMD_S_GameEnd.nTotalFreeCount.value;
        this.triFreeCount = CMD_S_GameEnd.nCurRoundFreeCount.value;
        this.prize = CMD_S_GameEnd.lAwardGold.value;
        this.haveWin = CMD_S_GameEnd.lNormalTotalAwardGold.value;
        this.lNormalTotalAwardGold = CMD_S_GameEnd.lNormalTotalAwardGold.value;
        this.nFreeTotalAwardGold = CMD_S_GameEnd.nFreeTotalAwardGold.value;
        this.bet = DataManager.currBet;
    }

    private addResultData(CMD_S_GameEnd){
        let tresuele:BetResultEle = new BetResultEle(CMD_S_GameEnd);
        this.result.push(tresuele);
    }
    /**掉落和消除根据下一屏数据获取*/
    public norData(){
        if(this.result.length>1){
            for(let i=0;i<this.result.length;i++){
                let tresult = this.result[i];
                let tcardlist = tresult.card_list;
                for(let col=0;col<tcardlist.length;col++){
                    this.setLastEle(tcardlist[col],col,i); 
                }
            }
            
            for(let i=0;i<this.result.length;i++){
                let tresult = this.result[i];
                let tcardlist = tresult.card_list;
                for(let col=0;col<tcardlist.length;col++){
                    if(tcardlist[col].removeList.length)this.norDropList(tcardlist[col],col,i);
                }
            }
        }
    }


    private norDropList(cardEle:CardListEle,col,index){
        let tremoveLen = cardEle.getRemoveRows();
        if(tremoveLen>0){
            let tnextresult = this.result[index+1];
            let tnextCardList = tnextresult.card_list[col];
            cardEle.setDropListFromNextList(tnextCardList);
        }
       
    }

    private setLastEle(cardEle:CardListEle,col,index){
        index++;
        let tnextresult = this.result[index];
        if(tnextresult){
            let tremoveLen = cardEle.removeList.length;
            if(tremoveLen>0){
                let tlen = cardEle.list.length;
                let trow = tlen-tremoveLen;
                cardEle.list[tlen-1]=tnextresult.card_list[col].list[trow];
            }else{
                let tnextremoveLen = tnextresult.card_list[col].removeList.length;
                if(tnextremoveLen>0){
                    let tnextnextResult = this.result[index+1];
                    let tlen2 = cardEle.list.length;
                    let trow2 = tlen2-tremoveLen;
                    cardEle.list[tlen2-1]=tnextnextResult.card_list[col].list[trow2];
                }else{
                    this.setLastEle(cardEle,col,index);
                }
            }
        }
    }
}