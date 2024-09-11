import { log, warn } from "cc";
import Routes from "../define/Routes";
import EventCenter from "../kernel/core/event/EventCenter";
import logger from "../kernel/core/logger";
import HttpUtil from "../kernel/core/net/HttpUtil";
import { EHttpResult } from "../kernel/core/net/NetDefine";
import Singleton from "../kernel/core/utils/Singleton";
import LoginCtrl from "../ctrls/LoginCtrl";

export default class HttpMgr extends Singleton {
    _domain = "http://m5.quannengpay.vip:10015"

    _hidePrints = {
        [Routes.req_heartbeat]: true
    }

    setDomain(url: string) {
        if (url === undefined || url === null || url == "" ||
            url.indexOf("localhost") == -1 || url.indexOf("http://127.0.0.1/") == -1) {
            return;
        }
        if (url.lastIndexOf("/") == url.length - 1) {
            url = url.substring(0, url.length - 1);
        }
    }

    norCount = 0
    freeCount = 0

    post(route: string, data: any, callback?: (bSucc: boolean, data: any) => void) {
        let dataStr = JSON.stringify(data)




        if (LoginCtrl.getIns().isTest) {
            let info: any

            if (route == Routes.req_login) {
                info = {
                    "error_code": 0,
                    "data": {
                        "player_info": {
                            "id": 4271,
                            "balance": 99028000,
                            "account": "try_VBlmrEWAfTd5oaB3",
                            "nickname": "试玩OTFeBtl1Rw",
                            "type": 0,
                            "mute": 0
                        },
                        "game_info": {
                            "id": 4271,
                            "free_play_times": 0,
                            "last_time_bet": 60000,
                            "last_time_bet_id": 13,
                            "last_time_bet_size": 1000,
                            "last_time_basic_bet": 20,
                            "last_time_bet_multiple": 3,
                            "free_total_times": 0,
                            "free_remain_times": 0,
                            "free_game_total_win": 0,
                            "total_bet": 5400000,
                            "total_bet_times": 90,
                            "total_free_times": 0,
                            "last_win": 0
                        },
                        "list": [
                            {
                                "item_type_list": [
                                    9,
                                    5,
                                    12,
                                    12,
                                    2,
                                    13
                                ]
                            },
                            {
                                "item_type_list": [
                                    35,
                                    48,
                                    48,
                                    20,
                                    48,
                                    48
                                ]
                            },
                            {
                                "item_type_list": [
                                    101,
                                    48,
                                    48,
                                    7,
                                    12,
                                    6
                                ]
                            },
                            {
                                "item_type_list": [
                                    3,
                                    1,
                                    10,
                                    2,
                                    48,
                                    8
                                ]
                            },
                            {
                                "item_type_list": [
                                    21,
                                    48,
                                    1,
                                    38,
                                    48,
                                    48
                                ]
                            },
                            {
                                "item_type_list": [
                                    13,
                                    6,
                                    12,
                                    10,
                                    10,
                                    2
                                ]
                            }
                        ],
                        "last_round": null
                    },
                    "req": {
                        "token": "7955978BA6DC421C9473000B1E77C0F9"
                    }
                }


            } else if (route == Routes.req_bet_info) {
                info = {
                    "error_code": 0,
                    "data": {
                        "bet_list": [
                            {
                                "bet_size": 200,
                                "bet_multiple": 1,
                                "basic_bet": 20,
                                "total_bet": 4000,
                                "id": 1,
                                "bet_size_s": "0.02",
                                "total_bet_s": "0.40"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 2,
                                "basic_bet": 20,
                                "total_bet": 8000,
                                "id": 2,
                                "bet_size_s": "0.02",
                                "total_bet_s": "0.80"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 3,
                                "basic_bet": 20,
                                "total_bet": 12000,
                                "id": 3,
                                "bet_size_s": "0.02",
                                "total_bet_s": "1.20"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 4,
                                "basic_bet": 20,
                                "total_bet": 16000,
                                "id": 4,
                                "bet_size_s": "0.02",
                                "total_bet_s": "1.60"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 5,
                                "basic_bet": 20,
                                "total_bet": 20000,
                                "id": 5,
                                "bet_size_s": "0.02",
                                "total_bet_s": "2.00"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 6,
                                "basic_bet": 20,
                                "total_bet": 24000,
                                "id": 6,
                                "bet_size_s": "0.02",
                                "total_bet_s": "2.40"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 7,
                                "basic_bet": 20,
                                "total_bet": 28000,
                                "id": 7,
                                "bet_size_s": "0.02",
                                "total_bet_s": "2.80"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 8,
                                "basic_bet": 20,
                                "total_bet": 32000,
                                "id": 8,
                                "bet_size_s": "0.02",
                                "total_bet_s": "3.20"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 9,
                                "basic_bet": 20,
                                "total_bet": 36000,
                                "id": 9,
                                "bet_size_s": "0.02",
                                "total_bet_s": "3.60"
                            },
                            {
                                "bet_size": 200,
                                "bet_multiple": 10,
                                "basic_bet": 20,
                                "total_bet": 40000,
                                "id": 10,
                                "bet_size_s": "0.02",
                                "total_bet_s": "4.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 1,
                                "basic_bet": 20,
                                "total_bet": 20000,
                                "id": 11,
                                "bet_size_s": "0.10",
                                "total_bet_s": "2.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 2,
                                "basic_bet": 20,
                                "total_bet": 40000,
                                "id": 12,
                                "bet_size_s": "0.10",
                                "total_bet_s": "4.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 3,
                                "basic_bet": 20,
                                "total_bet": 60000,
                                "id": 13,
                                "bet_size_s": "0.10",
                                "total_bet_s": "6.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 4,
                                "basic_bet": 20,
                                "total_bet": 80000,
                                "id": 14,
                                "bet_size_s": "0.10",
                                "total_bet_s": "8.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 5,
                                "basic_bet": 20,
                                "total_bet": 100000,
                                "id": 15,
                                "bet_size_s": "0.10",
                                "total_bet_s": "10.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 6,
                                "basic_bet": 20,
                                "total_bet": 120000,
                                "id": 16,
                                "bet_size_s": "0.10",
                                "total_bet_s": "12.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 7,
                                "basic_bet": 20,
                                "total_bet": 140000,
                                "id": 17,
                                "bet_size_s": "0.10",
                                "total_bet_s": "14.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 8,
                                "basic_bet": 20,
                                "total_bet": 160000,
                                "id": 18,
                                "bet_size_s": "0.10",
                                "total_bet_s": "16.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 9,
                                "basic_bet": 20,
                                "total_bet": 180000,
                                "id": 19,
                                "bet_size_s": "0.10",
                                "total_bet_s": "18.00"
                            },
                            {
                                "bet_size": 1000,
                                "bet_multiple": 10,
                                "basic_bet": 20,
                                "total_bet": 200000,
                                "id": 20,
                                "bet_size_s": "0.10",
                                "total_bet_s": "20.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 1,
                                "basic_bet": 20,
                                "total_bet": 100000,
                                "id": 21,
                                "bet_size_s": "0.50",
                                "total_bet_s": "10.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 2,
                                "basic_bet": 20,
                                "total_bet": 200000,
                                "id": 22,
                                "bet_size_s": "0.50",
                                "total_bet_s": "20.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 3,
                                "basic_bet": 20,
                                "total_bet": 300000,
                                "id": 23,
                                "bet_size_s": "0.50",
                                "total_bet_s": "30.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 4,
                                "basic_bet": 20,
                                "total_bet": 400000,
                                "id": 24,
                                "bet_size_s": "0.50",
                                "total_bet_s": "40.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 5,
                                "basic_bet": 20,
                                "total_bet": 500000,
                                "id": 25,
                                "bet_size_s": "0.50",
                                "total_bet_s": "50.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 6,
                                "basic_bet": 20,
                                "total_bet": 600000,
                                "id": 26,
                                "bet_size_s": "0.50",
                                "total_bet_s": "60.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 7,
                                "basic_bet": 20,
                                "total_bet": 700000,
                                "id": 27,
                                "bet_size_s": "0.50",
                                "total_bet_s": "70.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 8,
                                "basic_bet": 20,
                                "total_bet": 800000,
                                "id": 28,
                                "bet_size_s": "0.50",
                                "total_bet_s": "80.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 9,
                                "basic_bet": 20,
                                "total_bet": 900000,
                                "id": 29,
                                "bet_size_s": "0.50",
                                "total_bet_s": "90.00"
                            },
                            {
                                "bet_size": 5000,
                                "bet_multiple": 10,
                                "basic_bet": 20,
                                "total_bet": 1000000,
                                "id": 30,
                                "bet_size_s": "0.50",
                                "total_bet_s": "100.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 1,
                                "basic_bet": 20,
                                "total_bet": 500000,
                                "id": 31,
                                "bet_size_s": "2.50",
                                "total_bet_s": "50.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 2,
                                "basic_bet": 20,
                                "total_bet": 1000000,
                                "id": 32,
                                "bet_size_s": "2.50",
                                "total_bet_s": "100.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 3,
                                "basic_bet": 20,
                                "total_bet": 1500000,
                                "id": 33,
                                "bet_size_s": "2.50",
                                "total_bet_s": "150.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 4,
                                "basic_bet": 20,
                                "total_bet": 2000000,
                                "id": 34,
                                "bet_size_s": "2.50",
                                "total_bet_s": "200.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 5,
                                "basic_bet": 20,
                                "total_bet": 2500000,
                                "id": 35,
                                "bet_size_s": "2.50",
                                "total_bet_s": "250.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 6,
                                "basic_bet": 20,
                                "total_bet": 3000000,
                                "id": 36,
                                "bet_size_s": "2.50",
                                "total_bet_s": "300.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 7,
                                "basic_bet": 20,
                                "total_bet": 3500000,
                                "id": 37,
                                "bet_size_s": "2.50",
                                "total_bet_s": "350.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 8,
                                "basic_bet": 20,
                                "total_bet": 4000000,
                                "id": 38,
                                "bet_size_s": "2.50",
                                "total_bet_s": "400.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 9,
                                "basic_bet": 20,
                                "total_bet": 4500000,
                                "id": 39,
                                "bet_size_s": "2.50",
                                "total_bet_s": "450.00"
                            },
                            {
                                "bet_size": 25000,
                                "bet_multiple": 10,
                                "basic_bet": 20,
                                "total_bet": 5000000,
                                "id": 40,
                                "bet_size_s": "2.50",
                                "total_bet_s": "500.00"
                            }
                        ],
                        "default_id": 13,
                        "add_sub_combination": [
                            1,
                            2,
                            3,
                            5,
                            10,
                            13,
                            15,
                            20,
                            25,
                            30,
                            35,
                            40
                        ]
                    },
                    "req": {}
                }

            } else if (route == Routes.req_heartbeat) {
                info = {}

            } else if (route == Routes.req_bet) {
                info = {
                    "error_code": 0,
                    "data": {
                        "result": {
                            "round_list": [
                                {
                                    "item_type_list": [
                                        7,
                                        6,
                                        8,
                                        3,
                                        7,
                                        10,
                                        8,
                                        48,
                                        48,
                                        7,
                                        11,
                                        10,
                                        8,
                                        10,
                                        8,
                                        5,
                                        6,
                                        48,
                                        3,
                                        3,
                                        2,
                                        5,
                                        12,
                                        48,
                                        12,
                                        2,
                                        13,
                                        48,
                                        13,
                                        8,
                                        3,
                                        13,
                                        4,
                                        13,
                                        6,
                                        8
                                    ],
                                    "round_rate": 16,
                                    "round": 1,
                                    "multi_time": 1,
                                    "prize_list": [
                                        {
                                            "win_pos_list": [
                                                2,
                                                6,
                                                12,
                                                14
                                            ],
                                            "count": 2,
                                            "level": 3,
                                            "item_type": 8,
                                            "rate": 6,
                                            "win": 18000,
                                            "win_s": "1.80"
                                        },
                                        {
                                            "win_pos_list": [
                                                5,
                                                11,
                                                13
                                            ],
                                            "count": 1,
                                            "level": 3,
                                            "item_type": 10,
                                            "rate": 4,
                                            "win": 12000,
                                            "win_s": "1.20"
                                        }
                                    ],
                                    "multi_list": [1, 2, 3, 5],
                                    "next_list": null,
                                    "list": null,
                                    "win_pos_list": [
                                        2,
                                        5,
                                        6,
                                        11,
                                        12,
                                        13,
                                        14
                                    ],
                                    "dyadic_list": [
                                        {
                                            "list": [
                                                11,
                                                3
                                            ]
                                        },
                                        {
                                            "list": [
                                                9,
                                                48,
                                                48,
                                                48
                                            ]
                                        },
                                        {
                                            "list": [
                                                9,
                                                4,
                                                48
                                            ]
                                        },
                                        {
                                            "list": null
                                        },
                                        {
                                            "list": null
                                        },
                                        {
                                            "list": null
                                        }
                                    ],
                                    "gold_change_list": null,
                                    "sliver_change_list": null,
                                    "wild_reduce_list": null,
                                    "gold_pos_list": null,
                                    "sliver_pos_list": null,
                                    "multi_wild_pos_list": null,
                                    "round_rate_origin": 16,
                                    "col_symbol_list": [
                                        {
                                            "list": [
                                                7,
                                                6,
                                                8,
                                                3,
                                                7,
                                                10
                                            ]
                                        },
                                        {
                                            "list": [
                                                8,
                                                48,
                                                48,
                                                7,
                                                11,
                                                10
                                            ]
                                        },
                                        {
                                            "list": [
                                                8,
                                                10,
                                                8,
                                                5,
                                                6,
                                                48
                                            ]
                                        },
                                        {
                                            "list": [
                                                3,
                                                3,
                                                2,
                                                5,
                                                12,
                                                48
                                            ]
                                        },
                                        {
                                            "list": [
                                                12,
                                                2,
                                                13,
                                                48,
                                                13,
                                                8
                                            ]
                                        },
                                        {
                                            "list": [
                                                3,
                                                13,
                                                4,
                                                13,
                                                6,
                                                8
                                            ]
                                        }
                                    ],
                                    "win_symbol_point": null,
                                    "free_play": 0,
                                    "round_id": "8306244772",
                                    "player_win_lose": -12000,
                                    "player_win_lose_s": "-1.20",
                                    "balance_s": "9901.60",
                                    "win_s": "4.80",
                                    "balance": 99016000,
                                    "win": 48000
                                },
                                {
                                    "item_type_list": [
                                        11,
                                        3,
                                        7,
                                        6,
                                        3,
                                        7,
                                        9,
                                        48,
                                        5,
                                        48,
                                        7,
                                        11,
                                        9,
                                        4,
                                        48,
                                        5,
                                        6,
                                        48,
                                        3,
                                        3,
                                        2,
                                        5,
                                        12,
                                        48,
                                        12,
                                        2,
                                        13,
                                        48,
                                        13,
                                        8,
                                        3,
                                        13,
                                        4,
                                        13,
                                        6,
                                        8
                                    ],
                                    "round_rate": 0,
                                    "round": 2,
                                    "multi_time": 2,
                                    "prize_list": [],
                                    "multi_list": [1, 2, 3, 5],
                                    "next_list": null,
                                    "list": null,
                                    "win_pos_list": null,
                                    "dyadic_list": null,
                                    "gold_change_list": null,
                                    "sliver_change_list": null,
                                    "wild_reduce_list": null,
                                    "gold_pos_list": null,
                                    "sliver_pos_list": null,
                                    "multi_wild_pos_list": null,
                                    "round_rate_origin": 0,
                                    "col_symbol_list": [
                                        {
                                            "list": [
                                                11,
                                                3,
                                                7,
                                                6,
                                                3,
                                                7
                                            ]
                                        },
                                        {
                                            "list": [
                                                9,
                                                48,
                                                5,
                                                48,
                                                7,
                                                11
                                            ]
                                        },
                                        {
                                            "list": [
                                                9,
                                                4,
                                                48,
                                                5,
                                                6,
                                                48
                                            ]
                                        },
                                        {
                                            "list": [
                                                3,
                                                3,
                                                2,
                                                5,
                                                12,
                                                48
                                            ]
                                        },
                                        {
                                            "list": [
                                                12,
                                                2,
                                                13,
                                                48,
                                                13,
                                                8
                                            ]
                                        },
                                        {
                                            "list": [
                                                3,
                                                13,
                                                4,
                                                13,
                                                6,
                                                8
                                            ]
                                        }
                                    ],
                                    "win_symbol_point": null,
                                    "free_play": 0,
                                    "round_id": "3063904432",
                                    "player_win_lose": 0,
                                    "player_win_lose_s": "0.00",
                                    "balance_s": "9901.60",
                                    "win_s": "0.00",
                                    "balance": 99016000,
                                    "win": 0
                                }
                            ],
                            "rate": 16,
                            "scatter_count": 0,
                            "free_play": 0,
                            "is_end_free": false
                        },
                        "round_no": "0865062664",
                        "order_id": "15-1705562726-XVHPB0X4",
                        "balance": 99016000,
                        "balance_before_score": 98968000,
                        "bet": 0,
                        "prize": 48000,
                        "player_win_lose": -12000,
                        "free": false,
                        "free_total_times": 0,
                        "free_remain_times": 0,
                        "free_game_total_win": 0,
                        "dbg": null
                    },
                    "req": {
                        "token": "7955978BA6DC421C9473000B1E77C0F9",
                        "id": 13,
                        "buy_free": false,
                        "idempotent": "1705562730875"
                    }
                }

            } else if (route == Routes.req_history) {

                info = {
                    "error_code": 0,
                    "data": {
                        "list": [
                            {
                                "create_timestamp": 1705455654907,
                                "order_id": "11-1705455654-WADXVA95",
                                "round_id": "6855471320",
                                "bet": 60000,
                                "win": -60000,
                                "free_times": 0,
                                "win_s": "-6.00",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 0,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455642048,
                                "order_id": "11-1705455642-2EVYFDV1",
                                "round_id": "5131346621",
                                "bet": 60000,
                                "win": -54000,
                                "free_times": 0,
                                "win_s": "-5.40",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455636041,
                                "order_id": "11-1705455636-H9J13TMM",
                                "round_id": "5192310288",
                                "bet": 60000,
                                "win": -36000,
                                "free_times": 0,
                                "win_s": "-3.60",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455630379,
                                "order_id": "11-1705455630-H39EUJJZ",
                                "round_id": "5429264787",
                                "bet": 60000,
                                "win": -30000,
                                "free_times": 0,
                                "win_s": "-3.00",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455622558,
                                "order_id": "11-1705455622-U2FMHMXQ",
                                "round_id": "4712919652",
                                "bet": 60000,
                                "win": -18000,
                                "free_times": 0,
                                "win_s": "-1.80",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 2,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455614158,
                                "order_id": "11-1705455614-K4C2H8N9",
                                "round_id": "7462959710",
                                "bet": 60000,
                                "win": -42000,
                                "free_times": 0,
                                "win_s": "-4.20",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455607725,
                                "order_id": "11-1705455607-H61EHJN2",
                                "round_id": "8757908153",
                                "bet": 60000,
                                "win": -57000,
                                "free_times": 0,
                                "win_s": "-5.70",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455562229,
                                "order_id": "11-1705455562-H455UB3A",
                                "round_id": "9756469093",
                                "bet": 60000,
                                "win": -3000,
                                "free_times": 0,
                                "win_s": "-0.30",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 2,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455475127,
                                "order_id": "11-1705455475-EUP0HRZ9",
                                "round_id": "5018025886",
                                "bet": 60000,
                                "win": -6000,
                                "free_times": 12,
                                "win_s": "-0.60",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            },
                            {
                                "create_timestamp": 1705455355016,
                                "order_id": "11-1705455354-MY92J6X6",
                                "round_id": "1326660820",
                                "bet": 60000,
                                "win": -30000,
                                "free_times": 0,
                                "win_s": "-3.00",
                                "bet_s": "6.00",
                                "normal_round_no": "",
                                "free_round_no": "",
                                "free": false,
                                "normal_round_times": 1,
                                "free_round_times": 0
                            }
                        ],
                        "count": 10,
                        "bet": 600000,
                        "win": -336000,
                        "id": 0,
                        "bet_s": "60.00",
                        "win_s": "-33.60"
                    },
                    "req": {
                        "token": "DFECD631A01B49FD88E5A91AB9F655D4",
                        "start_timestamp": 1705420801000,
                        "end_timestamp": 1705455676918,
                        "limit": 20,
                        "page": 0,
                        "id": 0,
                        "offset": 0
                    }
                }


            } else if (route == Routes.req_hisdetail) {

                info = {
                    "error_code": 0,
                    "data": {
                        "list": [
                            {
                                "create_timestamp": 1705455355016,
                                "order_id": "11-1705455354-MY92J6X6",
                                "round_id": "1326660820",
                                "create_time": "2024-01-17 09:35:55",
                                "result": {
                                    "round_list": [
                                        {
                                            "item_type_list": [
                                                11,
                                                3,
                                                7,
                                                6,
                                                3,
                                                7,
                                                9,
                                                48,
                                                5,
                                                48,
                                                7,
                                                11,
                                                9,
                                                4,
                                                48,
                                                5,
                                                6,
                                                48,
                                                3,
                                                3,
                                                2,
                                                5,
                                                5,
                                                48,
                                                12,
                                                2,
                                                13,
                                                48,
                                                13,
                                                8,
                                                3,
                                                13,
                                                4,
                                                13,
                                                6,
                                                8
                                            ],
                                            "round_rate": 10,
                                            "round": 1,
                                            "multi_time": 1,
                                            "prize_list": [
                                                {
                                                    "win_pos_list": [
                                                        0,
                                                        4,
                                                        6,
                                                        11
                                                    ],
                                                    "count": 2,
                                                    "level": 3,
                                                    "item_type": 6,
                                                    "rate": 5,
                                                    "win": 30000,
                                                    "win_s": "3.00"
                                                }
                                            ],
                                            "next_list": [
                                                4,
                                                9,
                                                8,
                                                9,
                                                2
                                            ],
                                            "list": null,
                                            "win_pos_list": [
                                                0,
                                                4,
                                                6,
                                                11
                                            ],
                                            "dyadic_list": [
                                                {
                                                    "list": [
                                                        4,
                                                        9
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        10,
                                                        9,
                                                        6
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        8,
                                                        10
                                                    ]
                                                },
                                                {
                                                    "list": null
                                                },
                                                {
                                                    "list": null
                                                }
                                            ],
                                            "round_id": "1326660820",
                                            "gold_change_list": null,
                                            "col_symbol_list": [
                                                {
                                                    "list": [
                                                        11,
                                                        3,
                                                        7,
                                                        6,
                                                        3,
                                                        7
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        9,
                                                        48,
                                                        5,
                                                        48,
                                                        7,
                                                        11
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        9,
                                                        4,
                                                        48,
                                                        5,
                                                        6,
                                                        48
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        3,
                                                        3,
                                                        2,
                                                        5,
                                                        5,
                                                        48
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        12,
                                                        2,
                                                        13,
                                                        48,
                                                        13,
                                                        8
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        3,
                                                        13,
                                                        4,
                                                        13,
                                                        6,
                                                        8
                                                    ]
                                                }
                                            ],
                                            "win_symbol_point": null,
                                            "origin_round_rate": 10,
                                            "free_play": 0,
                                            "balance": 99970000,
                                            "balance_s": "9997.00",
                                            "win_s": "3.00",
                                            "win": 30000,
                                            "player_win_lose_s": ""
                                        },
                                        {
                                            "item_type_list": [
                                                11,
                                                3,
                                                7,
                                                6,
                                                3,
                                                7,
                                                9,
                                                48,
                                                5,
                                                48,
                                                7,
                                                11,
                                                9,
                                                4,
                                                48,
                                                5,
                                                6,
                                                48,
                                                3,
                                                3,
                                                2,
                                                5,
                                                5,
                                                48,
                                                12,
                                                2,
                                                13,
                                                48,
                                                13,
                                                8,
                                                3,
                                                13,
                                                4,
                                                13,
                                                6,
                                                8
                                            ],
                                            "round_rate": 0,
                                            "round": 2,
                                            "multi_time": 2,
                                            "prize_list": null,
                                            "next_list": [
                                                9,
                                                6,
                                                10,
                                                9,
                                                2
                                            ],
                                            "list": null,
                                            "win_pos_list": null,
                                            "dyadic_list": null,
                                            "round_id": "2723449181",
                                            "gold_change_list": null,
                                            "col_symbol_list": [
                                                {
                                                    "list": [
                                                        11,
                                                        3,
                                                        7,
                                                        6,
                                                        3,
                                                        7
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        9,
                                                        48,
                                                        5,
                                                        48,
                                                        7,
                                                        11
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        9,
                                                        4,
                                                        48,
                                                        5,
                                                        6,
                                                        48
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        3,
                                                        3,
                                                        2,
                                                        5,
                                                        5,
                                                        48
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        12,
                                                        2,
                                                        13,
                                                        48,
                                                        13,
                                                        8
                                                    ]
                                                },
                                                {
                                                    "list": [
                                                        3,
                                                        13,
                                                        4,
                                                        13,
                                                        6,
                                                        8
                                                    ]
                                                }
                                            ],
                                            "win_symbol_point": null,
                                            "origin_round_rate": 0,
                                            "free_play": 0,
                                            "balance": 99970000,
                                            "balance_s": "9997.00",
                                            "win_s": "0.00",
                                            "win": 0,
                                            "player_win_lose_s": ""
                                        }
                                    ],
                                    "rate": 10,
                                    "scatter_count": 0,
                                    "free_play": 0,
                                    "scatter_symbol_point": null,
                                    "origin_rate": 10,
                                    "is_end_free": false
                                },
                                "round_list": [
                                    {
                                        "round_no": "1326660820",
                                        "bet": 60000,
                                        "prize": 30000,
                                        "player_win_lose": -30000,
                                        "balance": 99970000,
                                        "round": 1,
                                        "bet_size": 300,
                                        "bet_multiple": 10,
                                        "basic_bet": 20,
                                        "multi_time": 1,
                                        "item_type_list": [
                                            11,
                                            3,
                                            7,
                                            6,
                                            3,
                                            7,
                                            9,
                                            48,
                                            5,
                                            48,
                                            7,
                                            11,
                                            9,
                                            4,
                                            48,
                                            5,
                                            6,
                                            48,
                                            3,
                                            3,
                                            2,
                                            5,
                                            5,
                                            48,
                                            12,
                                            2,
                                            13,
                                            48,
                                            13,
                                            8,
                                            3,
                                            13,
                                            4,
                                            13,
                                            6,
                                            8
                                        ],
                                        "prize_list": [
                                            {
                                                "win_pos_list": [
                                                    0,
                                                    4,
                                                    6,
                                                    11
                                                ],
                                                "count": 2,
                                                "level": 3,
                                                "item_type": 6,
                                                "rate": 5,
                                                "win": 30000,
                                                "win_s": "3.00"
                                            }
                                        ],
                                        "bet_s": "6.00",
                                        "prize_s": "3.00",
                                        "player_win_lose_s": "-3.00",
                                        "balance_s": "9997.00",
                                        "bet_size_s": "0.03"
                                    },
                                    {
                                        "round_no": "2723449181",
                                        "bet": 0,
                                        "prize": 0,
                                        "player_win_lose": 0,
                                        "balance": 99970000,
                                        "round": 2,
                                        "bet_size": 300,
                                        "bet_multiple": 10,
                                        "basic_bet": 20,
                                        "multi_time": 2,
                                        "item_type_list": [
                                            11,
                                            3,
                                            7,
                                            6,
                                            3,
                                            7,
                                            9,
                                            48,
                                            5,
                                            48,
                                            7,
                                            11,
                                            9,
                                            4,
                                            48,
                                            5,
                                            6,
                                            48,
                                            3,
                                            3,
                                            2,
                                            5,
                                            5,
                                            48,
                                            12,
                                            2,
                                            13,
                                            48,
                                            13,
                                            8,
                                            3,
                                            13,
                                            4,
                                            13,
                                            6,
                                            8
                                        ],
                                        "prize_list": null,
                                        "bet_s": "0.00",
                                        "prize_s": "0.00",
                                        "player_win_lose_s": "0.00",
                                        "balance_s": "9997.00",
                                        "bet_size_s": "0.03"
                                    }
                                ],
                                "balance": 99970000,
                                "balance_before_score": 100000000,
                                "bet": 60000,
                                "prize": 30000,
                                "player_win_lose": -30000,
                                "free": false,
                                "free_total_times": 0,
                                "free_remain_times": 0,
                                "free_game_total_win": 18446744073709521616,
                                "bet_size": 300,
                                "basic_bet": 20,
                                "bet_multiple": 10
                            }
                        ]
                    },
                    "req": {
                        "token": "DFECD631A01B49FD88E5A91AB9F655D4",
                        "order_id": "11-1705455354-MY92J6X6"
                    }
                }


            }


            if (callback) { callback(true, info); }
            EventCenter.getInstance().fire(route, info);

            return
        }














        HttpUtil.callPost(this._domain + "/" + route, dataStr, (iCode: EHttpResult, data: any) => {
            if (iCode !== EHttpResult.Succ) {
                if (callback) { callback(false, iCode); }
                logger.red("ERROR_TABLE: ", route, iCode);
            } else {
                let info = JSON.parse(data)

                if (!this._hidePrints[route]) {
                    // logger.green("[RESP]", addr, JSON.stringify(info, null, 2));
                    logger.blue("[===== RESP start ====]", route);
                    warn(info)
                    logger.blue("[====== RESP end ======]", route);
                    // StringUtil.printLn(info);
                }
                if (info.error_code !== null && info.error_code !== undefined && info.error_code !== 0) {
                    logger.red("ERROR_CODE: ", info.error_code, route);
                    //ToastHelper.tip(info.error_msg);
                    logger.red(info.error_msg);
                    if (callback) { callback(false, info); }
                } else {
                    if (callback) { callback(true, info); }
                    EventCenter.getInstance().fire(route, info);
                }
            }
        });
    }
}