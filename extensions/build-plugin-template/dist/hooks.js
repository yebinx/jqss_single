"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const PACKAGE_NAME = 'build-plugin-template';
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgOptions = options.packages[PACKAGE_NAME];
        if (pkgOptions === null || pkgOptions === void 0 ? void 0 : pkgOptions.webTestOption) {
            console.debug('webTestOption', true);
        }
        // Todo some thing
        // console.debug('get settings test', result.settings);
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // console.log('webTestOption', 'onAfterCompressSettings');
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // change the uuid to test
        // const uuidTestMap = {
        //     image: '57520716-48c8-4a19-8acf-41c9f8777fb0',
        // };
        // for (const name of Object.keys(uuidTestMap)) {
        //     const uuid = uuidTestMap[name];
        //     console.debug(`containsAsset of ${name}`, result.containsAsset(uuid));
        //     console.debug(`getAssetPathInfo of ${name}`, result.getAssetPathInfo(uuid));
        //     console.debug(`getRawAssetPaths of ${name}`, result.getRawAssetPaths(uuid));
        //     console.debug(`getJsonPathInfo of ${name}`, result.getJsonPathInfo(uuid));
        // }
        let compressImage = () => {
            return new Promise((resolve, reject) => {
                let uuids = ["ad40b390-c543-46f0-ad90-e458894c5214", "5588c980-6aa0-4ac4-b899-08966f8a14cd", "88c627e0-f54e-45c1-8a76-bcf7f42948bc"];
                let needCompress = [];
                uuids.forEach((uuid) => {
                    log("bbb", options, result.getAssetPathInfo(uuid));
                    result.getAssetPathInfo(uuid).forEach((info) => {
                        info.raw.forEach((p) => {
                            needCompress.push(p);
                        });
                    });
                });
                let path = __dirname.replace('extensions\\build-plugin-template\\dist', "extensions\\build-plugin-template\\tools\\compress");
                log("common: ", `node ${path} ${needCompress.join(",")}`);
                (0, child_process_1.exec)(`node ${path} ${needCompress.join(",")}`, (...arg) => {
                    log(...arg);
                    resolve();
                });
            });
        };
        // test onError hook
        // throw new Error('Test onError');
        let work = () => {
            return new Promise((resolve, reject) => {
                let path = __dirname.replace('extensions\\build-plugin-template\\dist', "build\\web-mobile\\index.html");
                fs_1.default.readFile(path, 'utf8', (err, data) => {
                    if (err) {
                        log(err);
                        return;
                    }
                    let time = new Date().toLocaleDateString() + "  " + new Date().toLocaleTimeString();
                    data = data.replace(`console.log("gameVersion: " + "gameVersion");`, `console.log("gameVersion: " + "${time}");`);
                    fs_1.default.writeFileSync(path, data);
                    let exePath = __dirname.replace('\\dist', "\\tools\\encryptedPictures");
                    let buildPath = __dirname.replace('extensions\\build-plugin-template\\dist', "build\\web-mobile");
                    (0, child_process_1.exec)("node " + exePath, () => {
                        resolve();
                    });
                });
            });
        };
        // yield compressImage();
        yield work();
    });
};
exports.onAfterBuild = onAfterBuild;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
    });
};
exports.unload = unload;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // console.warn(`${PACKAGE_NAME} run onError`);
    });
};
exports.onError = onError;
const onBeforeMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`onBeforeMake: root: ${root}, options: ${options}`);
    });
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log(`onAfterMake: root: ${root}, options: ${options}`);
    });
};
exports.onAfterMake = onAfterMake;
