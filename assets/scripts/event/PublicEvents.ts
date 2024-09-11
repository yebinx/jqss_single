export enum PUBLIC_EVENTS {
    /**设置赢奖 */
    SET_WIN_AMOUNT,
    /**设置金额 */
    SET_BALANCE_AMOUNT,
    /**设置下注额 */
    SET_BET_AMOUNT,
    /**余额跑分 */
    ADD_WIN,
    /**余额跑分 */
    ADD_BALANCE,
    /**设置字体颜色 */
    SET_LABEL_COLOR,
    /**改变下注额 */
    CHANGE_BET_AMONUT,
    /**设置下注信息 */
    SET_BET_INFO,
    /**背景音效控制 */
    BGM_CTRL,
    /**刷新音乐按钮 */
    REFESH_VOICE_BTN,
    /**改变加减按钮状态 */
    CHANGE_BTNS_STATUS,
    /**改变按钮颜色状态 */
    CHANGE_BTNS_STYLE,
    /**初始化快速按钮状态 */
    INIT_FAST_STATE,
    /**切换急速状态 */
    SWITCH_FAST,
    /**切换菜单 */
    SWITCH_MENU,

    /**spin按钮 */
    ON_SPIN,
    /**改变spin按钮状态 */
    CHANGE_SPIN_STATUS,
    /**更新自动状态 */
    UPDATE_AUTO_ROLL,
    /**更新自动按钮状态 */
    UPDATE_AUTO_STATUS,
    /**更新三个按钮状态 */
    UPDATE_THREE_BTNS_STATUS,
    /**取消自动 */
    CANCEL_AUTO,
    /**spin hover */
    SPIN_HOVER,
    /**show spin hover */
    SHOW_SPIN_HOVER,
    /**改变spin动画 */
    CHANGE_SPIN_ANIM,
    /**改变指针动画 */
    CHANGE_POINTER_STATE,
    /**改变指针颜色 */
    CHANGE_POINTER_COLOR,

    /**改变余额 */
    BALANCE_INFO,
    /**上一局赢钱 */
    LAST_WIN_INFO,
    /**当前下注id */
    GET_BET_ID,
    /**当前下注额 */
    GET_BET_AMOUNT,

    /**loading框 */
    UI_LOADING_REQ_COMPLETE,
    /**展示历史详情 */
    UI_SHOW_HISTORICAL_DETAILS,
    /**下注滚动开始 */
    BET_SCROLL_START,
    /**下注滚动结束 */
    BET_SCROLL_END,
    /**登录成功 */
    USER_LOGIN_SUCCESS,
    /**登录失败 */
    USER_LOGIN_FAIL,
    /**刷新过滤 */
    REFESH_RECORD_FILTER,

    /**自定义日期 */
    REQUEST_CUSTOM_DATE_RECORD,
    // /**打开自定义日期 */
    // OPEN_RECORD_CUSTOM_DATE,

    /**历史列表滑动 */
    HISTORY_LIST_MOVE,
    /**历史列表滑动结束 */
    HISTORY_LIST_MOVE_END,
}