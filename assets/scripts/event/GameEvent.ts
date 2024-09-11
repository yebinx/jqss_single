var Base = {

}

var GameEvent = {

    key_down_space: "key_down_space",
    key_pressing_space: "key_pressing_space",


    click_element: "click_element",//点击元素
    reconnect_tip: "reconnect_tip_enter",//重连提示
    reconnect_tip_close: "reconnect_tip_close",//重连提示

    close_bigreward: "close_bigreward",
    game_switch_fast: "game_switch_fast",//切换快速模式

    game_axis_roll_frist_move_lowest: "game_axis_roll_frist_move_lowest",//第一个元素移动到最低端

    game_axis_roll_top_full_move_scene: "game_axis_roll_top_full_move_scene",//最上面一个元素移动全部移动到屏幕 需要补充元素

    update_game_state: "update_game_state",//更新游戏状态
    game_start_roll: "game_start_roll",//游戏开始转动
    game_axis_roll_end: "game_axis_roll_end",//单轴滚动结束
    game_axis_ready_roll_end: "game_axis_ready_roll_end",//单轴准备滚动结束
    game_roll_complete: "game_roll_complete",//滚动完成
    game_start_stop_roll: "game_start_stop_roll",//数据返回游戏开始停止转动
    game_show_award_result: "game_show_award_result",//展示中奖结果
    game_show_no_award_result: "game_show_no_award_result",//展示不中奖结果
    game_clear_award_result: "game_clear_award_result",//清理展示中奖结果
    game_update_open_auto_roll: "game_open_auto_roll",//是否打开自动旋转
    game_axis_roll_move_ele: "game_axis_roll_move_ele",//清理中奖图标
    chang_black_mask: "chang_black_mask",//改变遮罩状态
    game_update_free_num: "game_update_free_num",//修改免费次数
    game_show_long_juan: "game_show_long_juan",//播放龙卷特效

    game_show_top_ting: "game_show_top_ting",//跑马灯听牌

    game_shake_screen: "game_shake_screen",

    change_bgm_vol: "change_bgm_vol",

    show_or_hide_free_tips: "show_or_hide_free_tips",

    game_sleep: "game_sleep",//待机
}


export default GameEvent