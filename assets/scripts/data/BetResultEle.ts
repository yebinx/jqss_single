import DataManager from "../network/netData/DataManager";
import CardListEle from "./CardListEle";

export default class BetResultEle{
    public card_list:Array<CardListEle>=[];
    public win:number=0;
    public havewin:number=0;
    public removelist=[];
  
    public roundid:string="";
    public sceneodds:number=1;
    public balance:number=0;
    public scattercount:number=0;
    public createtime:number=0;
    public freeCount:number=0;
    public totalFreeCount:number=0;
    public triFreeCount:number=0;
    public multiple:number=1;
    public lNormalTotalAwardGold:number=0;
    public nFreeTotalAwardGold:number=0;
    constructor(CMD_S_GameEnd){
        this.win = CMD_S_GameEnd.lAwardGold.value;
        this.havewin = CMD_S_GameEnd.lNormalTotalAwardGold.value;
        this.balance = CMD_S_GameEnd.llUserTotalScore.value;
        this.freeCount = CMD_S_GameEnd.nFreeCount.value;
        this.totalFreeCount = CMD_S_GameEnd.nTotalFreeCount.value;
        this.triFreeCount = CMD_S_GameEnd.nCurRoundFreeCount.value;
        this.multiple = CMD_S_GameEnd.nMultiple.value;
        this.lNormalTotalAwardGold = CMD_S_GameEnd.lNormalTotalAwardGold.value;
        this.nFreeTotalAwardGold = CMD_S_GameEnd.nFreeTotalAwardGold.value;
        this.addCardList(CMD_S_GameEnd);
        this.setRmoveListData();
    }

    private addCardList(CMD_S_GameEnd){
        let nIconAreaDistri = CMD_S_GameEnd.nIconAreaDistri;
        let nIconAwardPos = CMD_S_GameEnd.nIconAwardPos;
        let nReplaceWildCol = CMD_S_GameEnd.nReplaceWildCol;
        let nRemoveIcon = CMD_S_GameEnd.nRemoveIcon;
        let nIconAfterRemove = CMD_S_GameEnd.nIconAfterRemove;
        let nIconAfterFill = CMD_S_GameEnd.nIconAfterFill;

        let tele:CardListEle;
        let tdata;
        for(let col=0;col<6;col++){
            tele = new CardListEle();
            let trow=-1;//因为服务端并不是按位置来设置数据，这个用于转化位置
            for(let row=0;row<nIconAreaDistri.length;row++){
                tdata = nIconAreaDistri[row][col];
                let trowcount = tdata.nMaxColCount.value;
                let frameType1 = tdata.isGold.value;
                let tisremove = tdata.isRemove.value;
                //if(DataManager.isWild(tdata.iType.value))frameType1=0;
                let tid = DataManager.convertId(tdata.iType.value,frameType1,trowcount);
                if(tdata.iType.value>0){
                    trow++;
                    tele.addListEle(tid);
                    tele.addSourceListEle(tid,trowcount,frameType1);
                    if(trowcount>1){
                        for(let i=1;i<trowcount;i++){
                            tele.addListEle(48);
                            tele.addSourceListEle(48,trowcount,frameType1);
                            trow++;
                        }
                    }
                }

                tdata = nRemoveIcon[row][col];
                trowcount = tdata.nMaxColCount.value;
                let frameType2 = tdata.isGold.value;
               
                //tid = DataManager.convertId(tdata.iType.value,frameType,trowcount);
                if(tdata.iType.value>0 || frameType2>0){
                    //tele.addDropEle(tid);
                    if(tele.isRemoveEle(frameType2))tele.removeList.push({row:row,rowCount:trowcount,col:col,id:tid,norId:DataManager.convertToNorId(tdata.iType.value)});
                    else console.log("win not remove",frameType2,tid,row,col);
                    let tpos = trow;
                    tele.addWinPos(tpos);
                    tele.addWinPosData(tid,trowcount,frameType2);
                    console.log("win row "+row,"col "+col,tpos,tid,trowcount);
                }
            }
            this.card_list.push(tele);
        }
    }

    private setRmoveListData(){
        let tremoveIds = this.getRemoveIds();
        if(tremoveIds.length){
            for(let i=0;i<tremoveIds.length;i++){
                let tcounts = this.getWinCount(tremoveIds[i]);
                this.removelist.push({iconid:tremoveIds[i],winlines:this.getWinLins(tcounts),wincount:tcounts});
            }
        }
    }

    private getRemoveIds(){
        let tids=[];
        let tCardEle:CardListEle = this.card_list[0];
        for(let i=0;i<tCardEle.removeList.length;i++){
            let tid = tCardEle.removeList[i].norId;
            if(tids.indexOf(tid)<0)tids.push(tid);
        }
        return tids;
    }

    private getWinCount(norId:number){
        let tcounts = [];
        for(let i=1;i<this.card_list.length;i++){
            let tremoveEles = this.card_list[i].removeList;
            let tnum=0;
            for(let h=0;h<tremoveEles.length;h++){
                if(tremoveEles[h].norId==norId)tnum++;
            }
            if(tnum>0)tcounts[i-1]=tnum;
        }
        let tupremoveList = this.card_list[0].removeList;
        for(let i=0;i<tupremoveList.length;i++){
            if(tcounts[tupremoveList[i].col])tcounts[tupremoveList[i].col] += 1;
            else tcounts[tupremoveList[i].col] = 1;
        }
        return tcounts;
    }

    private getWinLins(counts){
        let tlines=1;
        for(let i=0;i<counts.length;i++){
            tlines = tlines*counts[i];
        }
        return tlines;
    }
}