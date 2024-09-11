import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminOptipng from 'imagemin-optipng';
import path, { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

let goto = () => {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    
    const p = __dirname.replace("extensions\\build-plugin-template\\tools", "build\\web-mobile");
    
    let dirList = [];
    
    let getList = (folderPath) => {
        dirList.push(folderPath);
        let files = fs.readdirSync(folderPath);
        files.forEach(file => {
            let filePath = path.join(folderPath, file);
            let stats = fs.statSync(filePath);
            if (stats.isFile()) {
                // let type = path.extname(filePath)
                // if (type == ".png" || type == ".jpg") {
                //     fileList.push(file.replace(".png", "").replace(".jpg", ""));
                // }
            } else {
                getList(filePath);
            }
        });
    }
    
    try {
        fs.unlinkSync(path.join(dirname(fileURLToPath(import.meta.url)), "log.txt"));
    } catch (error) { }
    
    function log(...arg) {
        let file = path.join(dirname(fileURLToPath(import.meta.url)), "log.txt");
        let isExist = fs.existsSync(file);
        let str = isExist ? fs.readFileSync(file, 'utf-8') : '';
        fs.writeFileSync(file, str + "\n" + JSON.stringify(arg));
    }
    
    getList(p);
    
    // log(process.argv[2])
    // let arr = process.argv[2].split(',');
    // // let arr = ["freespin_bg_03.png"]
    // arr.forEach(async (p) => {
    //     await imagemin([p], {
    //         destination: path.dirname(p),
    //         plugins: [
    //             imageminOptipng({
    //                 bitDepthReduction: true, //位深度缩减
    //                 colorTypeReduction: true,//颜色类型减少
    //                 optimizationLevel: 7,//优化级别 0-7 7最大
    //                 paletteReduction: true,//调色板缩减
    //             }),
    //             // imageminPngquant({ quality: [1, 1], speed: 1, dithering: 1 })
    //         ]
    //     });
    // });
    let compress = async () => {
        while (dirList.length > 0) {
            let dir = dirList.pop();
            imagemin([dir + "/*.png"], {
                destination: dir,
                plugins: [
                    imageminOptipng({
                        bitDepthReduction: true, //位深度缩减
                        colorTypeReduction: true,//颜色类型减少
                        optimizationLevel: 7,//优化级别 0-7 7最大
                        paletteReduction: true,//调色板缩减
                    }),
                    // imageminPngquant({ quality: [0.6, 1], speed: 1 })
                ]
            });
        }
    }
    compress();
}

goto();