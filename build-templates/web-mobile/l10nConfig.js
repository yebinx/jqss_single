//nameConfig使用请参照index.ejs

let urlParams = new URLSearchParams(window.location.search);
function getLang(){
    let lang = "en";
    if (urlParams){
        lang = urlParams.get("lang");
    }
    lang = lang ? lang.toLocaleLowerCase() : "en";
    switch (lang) {
        case "zh":
        case "zh-hans":
        case "zh-hans-cn":
        case "zh-Hans-CN":
            lang = "zh";
            break;
        case "en":
        case "en-us":
        case "en-US":
            lang = "en";
            break;
        case "vi":
        case "vi-VN":
        case "vi-vn":
            lang = "vi";
            break;
        default:
            lang = "zh";
            break;
    }
    return lang;
} 

let lang = getLang()
function setTitle(leng){
    switch (leng){
        case "en":
            return nameConfig.enName
        case "vi":
            return nameConfig.viName
    default:
        return nameConfig.zhName;
    }       
}

document.title = setTitle(lang)
window["lang"] = lang
let cocoslang = "en-US";
if (urlParams){
    cocoslang = urlParams.get("lang");
}
cocoslang = cocoslang ? cocoslang.toLocaleLowerCase() : "en-US"
switch (cocoslang) {
    case "zh-hans":
    case "zh":
    case "zh-Hans-CN":
        cocoslang = "zh-Hans-CN";
        break;
    case "en":
    case "en-us":
    case "en-US":
        cocoslang = "en-US";
        break;
    case "vi":
    case "vi-VN":
    case "vi-vn":
        cocoslang = "vi-VN"
        break;
    default:
        cocoslang = "zh-Hans-CN"
        break;
}

localStorage.setItem("localization-editor/language", cocoslang)