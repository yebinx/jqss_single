import { _decorator, Component, Node } from 'cc';
import { CCInteger } from 'cc';
import { RichText } from 'cc';
import { EDITOR } from 'cc/env';
import l10n from '../../../../extensions/localization-editor/static/assets/core/l10n-manager';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('l10nRichText')
@executeInEditMode(true)
export class l10nRichText extends Component {
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
    label?: RichText | null = undefined;

    onLoad() {
        this.label = this.node.getComponent(RichText);
    }
    
    protected start() {
        this.render();
    }

    render() {
        const translatedString = l10n.t(this._key, { count: this._count });
        if (typeof this.label === 'undefined' || typeof translatedString === 'undefined') {
            return;
        }
        if (EDITOR) {
            this.preview(translatedString);
        } else {
            this.label!.string = translatedString;
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

