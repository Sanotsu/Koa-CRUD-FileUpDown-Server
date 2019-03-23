const router = require('koa-router')()
const fs = require('fs')

const File = require('../../../models/File_Model')
const FsFiles = require('../../../models/GridStoreModel/FsFilesModel')
const MyFiles = require('../../../models/GridFSBucketModel/MyFilesModel')

const mongoose = require('../../../libs/mongodb/mongoose_conn')

//uptogfs 需要
let GridFs = require('gridfs-stream');
let mongoDriver = mongoose.mongo;

//uptogfsb 和 uptogfs 都需要
let conn = mongoose.connection;

/****************************************************************************************************
 * 以下3個路由
 * queryfile：直接查詢File collection存放的文件
 * up：將文件直接上傳到File collection中
 * down：從file colleciton中下載文件
 * 
 * 此處的實現，是直接將文件放到了collection中，和一般的數據存放一樣
 * 
 *****************************************************************************************************/
router.post('/queryfile', async (ctx) => {

    let data = await File.find({});

    let result = { 'Action': 'QueryFile', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)
})

//將文件直接上傳到mongodb的collection中
router.post('/up', async (ctx) => {

    const file = ctx.request.files.Filename;

    if (!file) {
        console.log('no file')
        let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': 'Bad' };
        ctx.body = (JSON.stringify(result));
    } else {

        // 获取上传文件,存到實體位置
        const reader = fs.createReadStream(file.path);	// 创建可读流
        const upStream = fs.createWriteStream(`upload-mgdb/${file.name}`);
        reader.pipe(upStream);	// 可读流通过管道写入可写流

        //整理相關數據，存到數據庫
        let file_data = fs.readFileSync(file.path);
        let file_type = file.type;
        let file_name = file.name;
        let file_size = file.size;

        let new_data = new File({
            filetype: file_type,
            filename: file_name,
            length: file_size,
            filedata: file_data,
            createdDate: new Date(),
            updatedDate: new Date()
        });
        try {
            await new_data.save();

            let result = { 'Action': 'UploadFile', 'IsSuccess': true, 'Message': 'OK' };
            ctx.body = (JSON.stringify(result));
        } catch (err) {
            console.log(err.message)
            let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': err.message };
            ctx.body = (JSON.stringify(result));
        }
    }
})

router.post('/down', async (ctx, next) => {

    let { name } = ctx.request.body;

    let data = await File.find({ "filename": name });

    ctx.body = (data[0].filedata);
})

/*****************************************************************************************************
 * 以下3個路由
 * queryfilegfs：查看mongodb中GridStore存放的文件（其實現在也不叫這個名字了）
 * uptogfs：將文件通過使用gridfs-stream庫相關方法，上傳到mongodb的filesystem
 * downgfs：通過使用gridfs-stream庫相關方法，把mongodb中的文件下載下來
 * 
 * 此處是沿用 ponpon 等使用gridfs-stream庫實現文件上傳下載到mongodb，且不是直接存到colletion
 * 但是我在使用中看到該庫提供的方法已經過時，各種警告，在看源代碼時已經4年沒有更新，
 * 使用的對象GridStore以及相關方法都將被棄用，
 * 
 * 所以不建議後續使用此庫進行文件操作
 * 
 *****************************************************************************************************/

router.post('/queryfilegfs', async (ctx) => {

    let data = await FsFiles.find({});

    let result = { 'Action': 'QueryFile', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)

})

/**
 * 使用gridfs-steam會有如下警告，且已經是4年前就停止維護了
 * (node:13012) DeprecationWarning: GridStore is deprecated, and will be removed in a future version. Please use GridFSBucket instead
 * (node:13012) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
 * (node:13012) DeprecationWarning: collection.save is deprecated. Use insertOne, insertMany, updateOne, or updateMany instead.
 */

//將文件直接上傳到mongodb的collection中
router.post('/uptogfs', async (ctx) => {

    const file = ctx.request.files.Filename;

    if (!file) {
        console.log('no file');
        let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': 'Bad' };
        ctx.body = (JSON.stringify(result));
    } else {

        // 获取上传文件,存到實體位置
        const reader = fs.createReadStream(file.path);	// 创建可读流
        const upStream = fs.createWriteStream(`upload-mgdb/${file.name}`);
        reader.pipe(upStream);	// 可读流通过管道写入可写流

        //將文件存到mongodb的GridStore 
        let gfs = GridFs(conn.db, mongoDriver);

        function saveFile(gfs, file) {
            return new Promise((resolve, reject) => {
                fs.createReadStream(file.filepath)
                    .pipe(gfs.createWriteStream({ filename: file.filename }))
                    .on('error', function (err) { reject(err); })
                    .on('close', function (file) { resolve(file); });
            });
        }

        await saveFile(gfs, {
            filepath: file.path,
            filename: file.name,
            filetype: file.type
        });

        let result = { 'Action': 'QueryFile', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': 1 };
        ctx.body = JSON.stringify(result)
    }
})

router.post('/downgfs', async (ctx, next) => {

    let { name } = ctx.request.body;

    let gfs = GridFs(conn.db, mongoDriver);
    let data = await gfs.files.find({ "filename": name }).toArray();
    let readstream = gfs.createReadStream({
        filename: data[0].filename
    });

    ctx.body = readstream
})

/********************************************************************************************
 * 以下3個路由
 * queryfilegfsb：查詢mongodb中GridFSBucket存放的文件
 * uptogfsb： 通過mongodb原生驅動類上傳文件到mongodb的GridFSBucket
 * downgfsb：通過mongodb原生驅動類下載mongodb GridFSBucket的文件
 * 
 * 因為 gridfs-stream 庫提供的方法已經過時，直接將文件存到collection與放到GridFSBucket還有不同，
 * 所以查看資料找到目前的常用實現，不需要第三方庫，只需要mongoose或mongodb驅動庫即可，
 * 操作及實現也不難，推薦使用。
 * 
 *********************************************************************************************/


router.post('/queryfilegfsb', async (ctx) => {

    let data = await MyFiles.find({});

    let result = { 'Action': 'QueryFile', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)
})

router.post('/uptogfsb', async (ctx) => {

    const file = ctx.request.files.Filename;

    if (!file) {
        console.log('no file');
        let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': 'Bad' };
        ctx.body = (JSON.stringify(result));
    } else {
        // 获取上传文件,存到實體位置
        const reader = fs.createReadStream(file.path);	// 创建可读流
        const upStream = fs.createWriteStream(`upload-mgdb/${file.name}`);
        reader.pipe(upStream);	// 可读流通过管道写入可写流

        //將文件存到mongodb的 GridFSBucket  
        function saveFile(bucket, file) {
            return new Promise((resolve, reject) => {
                fs.createReadStream(file.filepath)
                    .pipe(bucket.openUploadStream(file.filename, { contentType: file.filetype }))
                    .on('error', function (err) { reject(err); })
                    .on('finish', function (file) { resolve(file); });
            });
        }

        let opts = {
            bucketName: "MyFiles"
        };
        const bucket = new mongoose.mongo.GridFSBucket(conn.db, opts);
        await saveFile(bucket, {
            filepath: file.path,
            filename: file.name,
            filetype: file.type
        });

        let result = { 'Action': 'QueryFile', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': 1 };
        ctx.body = JSON.stringify(result)
    }
})

router.post('/downgfsb', async (ctx, next) => {

    let { name } = ctx.request.body;

    let opts = {
        bucketName: "MyFiles"
    };
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, opts);
    let data = await bucket.openDownloadStreamByName(name);

    ctx.body = data
})

module.exports = router