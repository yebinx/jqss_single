import { Color } from "cc";

class _PublicConfig {
    bundleName = "publicCommon";
    /**分数文字颜色 */
    labelColor: Color = new Color("#84EDFC");
    /**主题颜色 */
    themeColor: Color = new Color("#59F56D");
    /**按钮改变颜色 */
    btnChangeColor: Color = new Color("#6EE78D80");
    /**不能按透明度 */
    btnOpacity = {
        MinusBtn: 0.5,
        AddBtn: 0.5,
        MinusBtnDisable: 0.3,
        AddBtnDisable: 0.3,
        StartAutoBtnDisable: 0.15,
        MoreBtn: 0.3,
        Other: 0.5
    };
    /**自动选中颜色 */
    autoSelectColor = new Color(88, 240, 109, 255);
    /**自动没选中颜色 */
    autoUnSelectColor = new Color(111, 111, 120, 255);
    /**自动hover颜色 */
    autoHoverColor = new Color(110, 231, 141, 64);
    /**loading配置 */
    loadingConfig = {
        loadingBgPre: { path: "customize/prefabs/LoadingContent" },
        resourcesPath: "customize/texture/loading"
    };
    /**按钮音效配置 */
    btnAudioConfig = {
        fast: { name: "menu_icon_press", vol: 0.5 },
        reduceBet: { name: "", vol: 0.5 },
        addBet: { name: "", vol: 0.5 },
        auto: { name: "menu_icon_press", vol: 0.5 },
        moreBtn: { name: "menu_icon_press", vol: 0.5 },
        exitBtn: { name: "menu_icon_press", vol: 0.5 },
        audioBtn: { name: "menu_icon_press", vol: 0.5 },
        payTable: { name: "", vol: 0.5 },
        rule: { name: "", vol: 0.5 },
        history: { name: "menu_icon_press", vol: 0.5 },
        close: { name: "menu_icon_press", vol: 0.5 },
        settingBet: { name: "menu_icon_press", vol: 0.5 },
        balance: { name: "menu_icon_press", vol: 0.5 },

        autoClose: { name: "list_item_click", vol: 3 },
        autoSelect: { name: "list_item_click", vol: 3 },
        autoStart: { name: "list_item_click", vol: 3 },

        betClose: { name: "list_item_click", vol: 3 },
        betMax: { name: "list_item_click", vol: 3 },
        betConfirm: { name: "list_item_click", vol: 3 },
    }

    /**spin按钮配置 */
    spinBtnConfig = {
        spinNodeName: "SpinBtn",
        pointerBoxNodeName: "pointer_box",
    }

    /**自动spin按钮配置 */
    autoSpinBtnConfig = {
        autoNodeName: "AutoBtn",
        autoNumNodeName: "AutoNum"
    }
}

export const PublicConfig = new _PublicConfig();