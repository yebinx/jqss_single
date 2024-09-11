import { _decorator, Component, Label, Node, tween, v3 } from 'cc';
import { BaseView } from '../../../../scripts/kernel/compat/view/BaseView';
import CocosUtil from '../../../../scripts/kernel/compat/CocosUtil';
import { EDialogMenuId, ParamConfirmDlg } from '../../../../scripts/kernel/compat/view/ViewDefine';
import { EViewNames } from '../../../../scripts/configs/UIConfig';
import { UIManager } from '../../../../scripts/kernel/compat/view/UImanager';
import { PublicConfig } from '../../../customize/script/PublicConfig';

const { ccclass, property } = _decorator;

@ccclass('ConfirmTip')
export class ConfirmTip extends BaseView {
	private _callback: Function = null;
	private _thisObj: any = null;
	private _info: ParamConfirmDlg = null;

	onLoad() {
		CocosUtil.traverseNodes(this.node, this.m_ui);
		CocosUtil.addClickEvent(this.m_ui.btn_ok, this.onBtnOk, this);
	
		CocosUtil.changeCurNodeColor(this.m_ui.btn_ok, PublicConfig.themeColor);
	}

	private onBtnOk() {
		if (this._callback) {
			if (this._thisObj) {
				this._callback.call(this._thisObj, EDialogMenuId.ok);
			} else {
				this._callback(EDialogMenuId.ok);
			}
		}
		UIManager.closeView(EViewNames.UIConfirmTip)
	}

	protected start(): void {
		this.scheduleOnce(() => {
			let info = this._info;
			this.m_ui.lb_cont.getComponent(Label).string = info.content;
	
			if (info.title && this.m_ui.lb_title) {
				this.m_ui.lb_title.getComponent(Label).string = info.title;
			}
	
			if (info.okTxt) {
				this.m_ui.lb_ok.getComponent(Label).string = info.okTxt;
			}
		});
	}

	public initData(info: ParamConfirmDlg) {
		this._callback = info.callback;
		this._thisObj = info.thisObj;
		this._info = info;
	}
}


