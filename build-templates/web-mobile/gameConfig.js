
function getLang(){
    let urlParams = new URLSearchParams(window.location.search);
    let lang = "en";
    if (urlParams){
        lang = urlParams.get("lang");
    }
    lang = lang ? lang.toLocaleLowerCase() : "en";
    switch (lang) {
        case "zh":
        case "zh-hans":
        case "zh-Hans-CN":
          lang = "zh";
          break;
        case "en":
        case "en-us":
        case "en-US":
          lang = "en";
          break;
        case "vi":
        case "vi-vn":
        case "vi-VN":
          lang = "vi"
          break;
        default:
          lang = "zh";
          break;
    }
    return lang;
} 

let curLang = getLang()
window["lang"] = curLang
