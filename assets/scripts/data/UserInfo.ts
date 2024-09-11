import { TRound } from "../interface/result";

export default class UserInfo{
    public player_info;
    public game_info;
    public list?: { item_type_list: number[] }[];
    public lastRound?: { free_play: number, origin_rate: number, rate: number, round_list?: TRound[], is_end_free?: boolean };
    constructor(){
        this.player_info={
            "id": 4598,
            "balance": 100000000,
            "account": "try_hkEpOe7PdBscqJsr",
            "nickname": "试玩ImJIH50MoT",
            "type": 0,
            "mute": 0
        }

        this.game_info={
            "id": 4271,
            "free_play_times": 0,
            "last_time_bet": 60000,
            "last_time_bet_id": 10,
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
        }

        this.list=[
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
                    102,
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
        ];

        this.lastRound = null;
    }
}