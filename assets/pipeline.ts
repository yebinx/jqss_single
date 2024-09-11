import { assetManager } from "cc";
import { DEV } from "cc/env";

export class Pipeline {
    private static defaultLang = "zh-Hans-CN";  // 默认语言，文件夹名字
    private static targetLang = "vi-VN"; // 当前使用语言，文件夹名字 en zh

    static init() {
        this.setLang();
        this.addPipeline();
    }

    // 更新使用语言
    private static setLang() {
        // if (DEV) {
        let lang = this.ParserUrlLang()
        if (lang) {
            lang = this.getLang(lang)
        } else {
            lang = this.defaultLang
        }
        window['lang'] = lang;
        this.targetLang = window["lang"];

        console.log("lang = ", lang)
        return;
        // }

        // if (window["lang"]) {
        //     this.targetLang = window["lang"];
        //     // console.log("targetLang = ",this.targetLang)
        // }
    }

    // 获取url的lang    
    private static ParserUrlLang(): string {
        let stringParm = window.location.href.split("?");
        if (stringParm.length != 2) {
            // console.warn("href error " + window.location.href);
            return "";
        }
        let szParm = stringParm[1].split("&"); // 解析所有参数
        for (let i = 0; i < szParm.length; i++) {
            let kv = szParm[i].split("=");
            if (kv[0].toLowerCase() == "lang") { // 找到lang返回
                return kv[1];
            }
        }
        console.warn("parser lang error");
        return "";
    }


    private static getLang(lang: string) {
        switch (lang.toLocaleLowerCase()) {
            case "zh":
            case "zh-hans":
                lang = "zh-Hans-CN";
                break;
            case "vi":
                lang = "vi-VN";
                break;
            case "en":
            case "en-us":
            case "en-US":
                lang = "en-US";
                break;
            default:
                lang = "zh-Hans-CN";
                break;
        }
        return lang;
    }

    private static addPipeline() {
        assetManager.transformPipeline.insert((task) => {
            task.output = task.input;
            // console.log("task.input",task.input)
            if (this.targetLang == this.defaultLang) {
                return;
            }
            // console.log("taks input list = ",task.input)

            for (let i = 0; i < task.input.length; i++) {
                const item = task.input[i];
                // console.log("pipe item",item)
                if (item.config == null) {
                    continue;
                }

                let bundle = assetManager.getBundle(item.config.name);
                if (!bundle) {
                    console.error("重定向资源错误", item.config.name, item.uuid);
                    continue;
                }

                let assertInfo = bundle.getAssetInfo(item.uuid);
                if (!assertInfo) {
                    // console.log("not assertInfo",item.uuid)
                    continue;
                }

                if (!assertInfo["path"]) {  //被打成合集了
                    console.log("not assertInfo path", item.uuid, " assert => ", assertInfo)
                    continue;
                }

                // console.log("assertInfopath",assertInfo["path"])


                if (assertInfo["path"].indexOf("zh-Hans-CN") == -1) {
                    // console.log("not assertInfo path zh",item.uuid)
                    continue;
                }

                let replaceAsserInfo = bundle.getInfoWithPath(assertInfo["path"].replace(this.defaultLang, this.targetLang), item.info.ctor ? item.info.ctor : null);

                // console.log("replaceAsserInfo",replaceAsserInfo)
                if (replaceAsserInfo != null) {
                    // console.log("replaceAsserInfo name ",replaceAsserInfo.path)
                    // if (DEV) {
                    console.log("重定向资源", "默认", item.info.path, "  ", "替换", replaceAsserInfo.path);
                    // console.log("重定向资源Url", "默认", item.info.uuid, "  ", "替换", replaceAsserInfo.path);
                    // }

                    item.overrideUuid = replaceAsserInfo.uuid;
                    item.config = bundle["config"];
                    item.info = replaceAsserInfo;
                    item.ext = item.isNative ? item.ext : (replaceAsserInfo?.extension || ".json");
                }
            }
        }, 2);

        // if (DEV) {
        assetManager.transformPipeline.append((task) => {
            task.output = task.input;

            if (this.targetLang == this.defaultLang) {
                return;
            }

            for (let i = 0; i < task.input.length; i++) {
                const item = task.input[i];
                if (item.config == null) {
                    continue;
                }

                if (item.overrideUuid == "") {
                    continue;
                }

                //TODO shared的重定向没打印出来，但是发布的时候正常
                let assertType = item.info.ctor ? item.info.ctor.name : "";
                console.log("重定向", assertType, "数据", item.config.base + item.info.path, item.info.uuid);
            }
        });
        // }
    }
}

Pipeline.init();