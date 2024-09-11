import { _decorator, Button, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

// 日期
@ccclass('RecordDateItem')
export class RecordDateItem extends Component {
    @property({type:Label})
    lbDate:Label

    @property({type:Button})
    self:Button

    private callback:Function

    onLoad() {
    }

    setCallback(cb:Function){
        this.callback = cb;
    }

    setString(date: string){
        this.lbDate.string = date;
    }

    onClick(){
        this.callback();
    }
}


