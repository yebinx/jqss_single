import MoneyUtil from "../kernel/core/utils/MoneyUtil";

export enum EDateType {
    year,
    month,
    day,
}

export enum TItemtype {

    ITEM_TYPE_NIL = 0,// 空
    ITEM_TYPE_WILD = 1,// 百搭可代替所有图标，除了夺宝
    ITEM_TYPE_SCATTER = 2,// 夺宝
    ITEM_TYPE_H1 = 3,// 现金
    ITEM_TYPE_H2 = 4,// 彩票
    ITEM_TYPE_H3 = 5,// 鞋子
    ITEM_TYPE_H4 = 6,// 手套
    ITEM_TYPE_H5 = 7,// 棋子
    ITEM_TYPE_H6 = 8,// 口哨
    ITEM_TYPE_A = 9,// Ａ
    ITEM_TYPE_K = 0xA,// Ｋ
    ITEM_TYPE_Q = 0xB,// Ｑ
    ITEM_TYPE_J = 0xC,// Ｊ
    ITEM_TYPE_10 = 0xD,// 10

    SILVER_MOD = 0x10, // 银色取模

    ITEM_TYPE_H1_SILVER = 0x13,// 现金
    ITEM_TYPE_H2_SILVER = 0x14,// 彩票
    ITEM_TYPE_H3_SILVER = 0x15,// 鞋子
    ITEM_TYPE_H4_SILVER = 0x16,// 手套
    ITEM_TYPE_H5_SILVER = 0x17,// 棋子
    ITEM_TYPE_H6_SILVER = 0x18,// 口哨
    ITEM_TYPE_A_SILVER = 0x19,// Ａ
    ITEM_TYPE_K_SILVER = 0x1A,// Ｋ
    ITEM_TYPE_Q_SILVER = 0x1B,// Ｑ
    ITEM_TYPE_J_SILVER = 0x1C,// Ｊ
    ITEM_TYPE_10_SILVER = 0x1D,// 10

    GOLD_MOD = 0x20,// 金色取模

    ITEM_TYPE_H1_GOLD = 0x23,// 金现金
    ITEM_TYPE_H2_GOLD = 0x24,// 金彩票
    ITEM_TYPE_H3_GOLD = 0x25,// 金鞋子
    ITEM_TYPE_H4_GOLD = 0x26,// 金手套
    ITEM_TYPE_H5_GOLD = 0x27,// 金棋子
    ITEM_TYPE_H6_GOLD = 0x28,// 金口哨
    ITEM_TYPE_A_GOLD = 0x29,// Ａ
    ITEM_TYPE_K_GOLD = 0x2A,// Ｋ
    ITEM_TYPE_Q_GOLD = 0x2B,// Ｑ
    ITEM_TYPE_J_GOLD = 0x2C,// Ｊ
    ITEM_TYPE_10_GOLD = 0x2D,// 10

    ITEM_TYPE_DUPLICATE = 0x30, // 重复用的填充

    ITEM_TYPE_WILD_NUM = 0X64,//100  填充wild用
    ITEM_TYPE_WILD_1 = 0X65,//101 wild1
    ITEM_TYPE_WILD_2 = 0xC9,//201  wild2
    ITEM_TYPE_WILD_3 = 0x12D,//301  wild3
    ITEM_TYPE_WILD_4 = 0x191,//401  wild4
}

export default class GameConst {
    /**掉落时间间隔 */
    static fallDownInterval: number = 0.05;

    /**掉落时间 */
    static fallDownTime: number = 0.05;

    /**最大行数 */
    static MaxRow: number = 7;

    /**登录最大重试次数 */
    static MaxReLoginCnt: number = 5;

    static ElementList = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    static WDElementId = 1;

    static MergeMax: number = 4;

    /**基础倍数 */
    static BeseGold: number = 1000;

    /**赔付表 */
    static ElementRateList: Map<TItemtype, {
        num: number,
        multiple: number
    }[] | string[]> = new Map([
        [TItemtype.ITEM_TYPE_WILD, ["symbol_wild_info"]],
        [TItemtype.ITEM_TYPE_SCATTER, ["symbol_scatter_info"]],
        [TItemtype.ITEM_TYPE_H1, [{
            num: 6,
            multiple: 80
        }, {
            num: 5,
            multiple: 50
        }, {
            num: 4,
            multiple: 40
        }, {
            num: 3,
            multiple: 30
        }]],
        [TItemtype.ITEM_TYPE_H2, [{
            num: 6,
            multiple: 60
        }, {
            num: 5,
            multiple: 40
        }, {
            num: 4,
            multiple: 30
        }, {
            num: 3,
            multiple: 20
        }]],
        [TItemtype.ITEM_TYPE_H3, [{
            num: 6,
            multiple: 50
        }, {
            num: 5,
            multiple: 25
        }, {
            num: 4,
            multiple: 20
        }, {
            num: 3,
            multiple: 15
        }]],
        [TItemtype.ITEM_TYPE_H4, [{
            num: 6,
            multiple: 30
        }, {
            num: 5,
            multiple: 20
        }, {
            num: 4,
            multiple: 15
        }, {
            num: 3,
            multiple: 10
        }]],
        [TItemtype.ITEM_TYPE_H5, [{
            num: 6,
            multiple: 20
        }, {
            num: 5,
            multiple: 15
        }, {
            num: 4,
            multiple: 10
        }, {
            num: 3,
            multiple: 8
        }]],
        [TItemtype.ITEM_TYPE_H6, [{
            num: 6,
            multiple: 20
        }, {
            num: 5,
            multiple: 15
        }, {
            num: 4,
            multiple: 10
        }, {
            num: 3,
            multiple: 8
        }]],
        [TItemtype.ITEM_TYPE_A, [{
            num: 6,
            multiple: 8
        }, {
            num: 5,
            multiple: 5
        }, {
            num: 4,
            multiple: 3
        }, {
            num: 3,
            multiple: 2
        }]],
        [TItemtype.ITEM_TYPE_K, [{
            num: 6,
            multiple: 8
        }, {
            num: 5,
            multiple: 5
        }, {
            num: 4,
            multiple: 3
        }, {
            num: 3,
            multiple: 2
        }]],
        [TItemtype.ITEM_TYPE_Q, [{
            num: 6,
            multiple: 4
        }, {
            num: 5,
            multiple: 3
        }, {
            num: 4,
            multiple: 2
        }, {
            num: 3,
            multiple: 1
        }]],
        [TItemtype.ITEM_TYPE_J, [{
            num: 6,
            multiple: 4
        }, {
            num: 5,
            multiple: 3
        }, {
            num: 4,
            multiple: 2
        }, {
            num: 3,
            multiple: 1
        }]],
        [TItemtype.ITEM_TYPE_10, [{
            num: 6,
            multiple: 4
        }, {
            num: 5,
            multiple: 3
        }, {
            num: 4,
            multiple: 2
        }, {
            num: 3,
            multiple: 1
        }]],
        // //银
        // [TItemtype.ITEM_TYPE_H1_SILVER, [{
        //     num: 5,
        //     multiple: 50
        // }, {
        //     num: 4,
        //     multiple: 25
        // }, {
        //     num: 3,
        //     multiple: 10
        // }]],
        // [TItemtype.ITEM_TYPE_H2_SILVER, [{
        //     num: 5,
        //     multiple: 40
        // }, {
        //     num: 4,
        //     multiple: 20
        // }, {
        //     num: 3,
        //     multiple: 8
        // }]],
        // [TItemtype.ITEM_TYPE_H3_SILVER, [{
        //     num: 5,
        //     multiple: 30
        // }, {
        //     num: 4,
        //     multiple: 15
        // }, {
        //     num: 3,
        //     multiple: 6
        // }]],
        // [TItemtype.ITEM_TYPE_H4_SILVER, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_H5_SILVER, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_H6_SILVER, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_A_SILVER, [{
        //     num: 5,
        //     multiple: 12
        // }, {
        //     num: 4,
        //     multiple: 5
        // }, {
        //     num: 3,
        //     multiple: 3
        // }]],
        // [TItemtype.ITEM_TYPE_K_SILVER, [{
        //     num: 5,
        //     multiple: 12
        // }, {
        //     num: 4,
        //     multiple: 5
        // }, {
        //     num: 3,
        //     multiple: 3
        // }]],
        // [TItemtype.ITEM_TYPE_Q_SILVER, [{
        //     num: 5,
        //     multiple: 10
        // }, {
        //     num: 4,
        //     multiple: 4
        // }, {
        //     num: 3,
        //     multiple: 2
        // }]],
        // [TItemtype.ITEM_TYPE_J_SILVER, [{
        //     num: 5,
        //     multiple: 6
        // }, {
        //     num: 4,
        //     multiple: 3
        // }, {
        //     num: 3,
        //     multiple: 1
        // }]],
        // [TItemtype.ITEM_TYPE_10_SILVER, [{
        //     num: 5,
        //     multiple: 6
        // }, {
        //     num: 4,
        //     multiple: 3
        // }, {
        //     num: 3,
        //     multiple: 1
        // }]],
        // //金
        // [TItemtype.ITEM_TYPE_H1_GOLD, [{
        //     num: 5,
        //     multiple: 50
        // }, {
        //     num: 4,
        //     multiple: 25
        // }, {
        //     num: 3,
        //     multiple: 10
        // }]],
        // [TItemtype.ITEM_TYPE_H2_GOLD, [{
        //     num: 5,
        //     multiple: 40
        // }, {
        //     num: 4,
        //     multiple: 20
        // }, {
        //     num: 3,
        //     multiple: 8
        // }]],
        // [TItemtype.ITEM_TYPE_H3_GOLD, [{
        //     num: 5,
        //     multiple: 30
        // }, {
        //     num: 4,
        //     multiple: 15
        // }, {
        //     num: 3,
        //     multiple: 6
        // }]],
        // [TItemtype.ITEM_TYPE_H4_GOLD, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_H5_GOLD, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_H6_GOLD, [{
        //     num: 5,
        //     multiple: 15
        // }, {
        //     num: 4,
        //     multiple: 10
        // }, {
        //     num: 3,
        //     multiple: 5
        // }]],
        // [TItemtype.ITEM_TYPE_A_GOLD, [{
        //     num: 5,
        //     multiple: 12
        // }, {
        //     num: 4,
        //     multiple: 5
        // }, {
        //     num: 3,
        //     multiple: 3
        // }]],
        // [TItemtype.ITEM_TYPE_K_GOLD, [{
        //     num: 5,
        //     multiple: 12
        // }, {
        //     num: 4,
        //     multiple: 5
        // }, {
        //     num: 3,
        //     multiple: 3
        // }]],
        // [TItemtype.ITEM_TYPE_Q_GOLD, [{
        //     num: 5,
        //     multiple: 10
        // }, {
        //     num: 4,
        //     multiple: 4
        // }, {
        //     num: 3,
        //     multiple: 2
        // }]],
        // [TItemtype.ITEM_TYPE_J_GOLD, [{
        //     num: 5,
        //     multiple: 6
        // }, {
        //     num: 4,
        //     multiple: 3
        // }, {
        //     num: 3,
        //     multiple: 1
        // }]],
        // [TItemtype.ITEM_TYPE_10_GOLD, [{
        //     num: 5,
        //     multiple: 6
        // }, {
        //     num: 4,
        //     multiple: 3
        // }, {
        //     num: 3,
        //     multiple: 1
        // }]],
    ])
}

export enum GameState {
    wait,//等待
    roll,//转动
    show_result,//显示结果
    start_stop_roll,//停止转动
    cancel_roll,//提前停止转动
    delay,//新增一个阶段可以取消快速旋转
}