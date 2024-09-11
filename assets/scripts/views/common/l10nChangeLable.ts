import { _decorator, CCInteger, Label } from 'cc';
// @ts-ignore
import { EDITOR } from 'cc/env';
import { Component } from 'cc';
import { l10n } from '../../../../extensions/localization-editor/static/assets/l10n';
import MoneyUtil from '../../kernel/core/utils/MoneyUtil';

const {
    ccclass,
    property,
    executeInEditMode,
    menu,
} = _decorator;

@ccclass('l10nChangeLable')
@executeInEditMode(true)
export default class l10nChangeLable extends Component {
    @property({ visible: false })
        _key = '';

    @property({ visible: true })
    set key(value: string) {
        this._key = value;
        this.render();
    }

    get key(): string {
        return this._key;
    }
    @property({ visible: false })
        _count = 0;
    @property({
        type: CCInteger,
        visible: true,
    })
    set count(value: number) {
        this._count = value;
        this.render();
    }

    get count(): number {
        return this._count;
    }

    protected constructor() {
        super();
    }

    @property({ readonly: true })
    get string() {
        return this.label?.string || '';
    }
    label?: Label | null = undefined;

    onLoad() {
        this.label = this.node.getComponent(Label);
    }
    
    protected start() {
        this.render();
    }
    render() {
        const translatedString = l10n.t(this._key, { count: this._count });
        if (typeof this.label === 'undefined' || typeof translatedString === 'undefined') {
            return;
        }
        let str = translatedString .replace("{1}", `${MoneyUtil.currencySymbol()}`)
        if (EDITOR) {
            this.preview(str);
        } else {
            this.label!.string = str;
        }
    }
    public preview(value: string) {
        if (this.label && EDITOR) {
            const originalString = this.label.string;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.label._string = value;
            // this.label.updateRenderData(true);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cce.Engine.repaintInEditMode();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.label._string = originalString;
        }
    }
}
