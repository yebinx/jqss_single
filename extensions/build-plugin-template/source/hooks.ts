import { exec } from 'child_process';
import { IBuildTaskOption, BuildHook, IBuildResult } from '../@types';
import fs from "fs";

interface IOptions {
    remoteAddress: string;
    enterCocos: string;
    selectTest: string;
    objectTest: {
        number: number;
        string: string;
        boolean: boolean
    },
    arrayTest: [number, string, boolean];
}

const PACKAGE_NAME = 'build-plugin-template';

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    // console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    // log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions?.webTestOption) {
        console.debug('webTestOption', true);
    }
    // Todo some thing
    // console.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    // console.log('webTestOption', 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
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
        return new Promise<void>((resolve, reject) => {
            let uuids = ["ad40b390-c543-46f0-ad90-e458894c5214", "5588c980-6aa0-4ac4-b899-08966f8a14cd", "88c627e0-f54e-45c1-8a76-bcf7f42948bc"];
            let needCompress = [];
            uuids.forEach((uuid)=>{
                log("bbb", options, result.getAssetPathInfo(uuid))
                result.getAssetPathInfo(uuid).forEach((info)=>{
                    info.raw.forEach((p)=>{
                        needCompress.push(p);
                    })
                })
            })
            let path = __dirname.replace('extensions\\build-plugin-template\\dist', "extensions\\build-plugin-template\\tools\\compress");
            log("common: ", `node ${path} ${needCompress.join(",")}`)
            exec(`node ${path} ${needCompress.join(",")}`, (...arg) => {
                log(...arg)
                resolve();
            })
        })
    }
    
    // test onError hook
    // throw new Error('Test onError');
    let work = () => {
        return new Promise<void>((resolve, reject) => {
            let path = __dirname.replace('extensions\\build-plugin-template\\dist', "build\\web-mobile\\index.html");
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    log(err);
                    return;
                }
                let time = new Date().toLocaleDateString() + "  " + new Date().toLocaleTimeString();
                data = data.replace(`console.log("gameVersion: " + "gameVersion");`, `console.log("gameVersion: " + "${time}");`)
                fs.writeFileSync(path, data);
                let exePath = __dirname.replace('\\dist', "\\tools\\encryptedPictures");
                let buildPath = __dirname.replace('extensions\\build-plugin-template\\dist', "build\\web-mobile");
                exec("node " + exePath, () => {
                    resolve();
                })
            });
        })
    }

    // await compressImage();
    await work();
};

export const unload: BuildHook.unload = async function () {
    // console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    // console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    // console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    // console.log(`onAfterMake: root: ${root}, options: ${options}`);
};
