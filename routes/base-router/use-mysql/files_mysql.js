const router = require('koa-router')()
const fs = require('fs')

router.post('/up', async (ctx, next) => {

    const file = ctx.request.files.Filename;
    if (!file) {
        console.log('no file')
    } else {

        // 获取上传文件,存到實體位置
        const reader = fs.createReadStream(file.path);	// 创建可读流
        const upStream = fs.createWriteStream(`upload/${file.name}`);
        reader.pipe(upStream);	// 可读流通过管道写入可写流

        //整理相關數據，存到數據庫
        let file_data = fs.readFileSync(file.path);
        let file_type = file.type;
        let file_name = file.name;
        let file_size = file.size;
        let updateParams = [file_type, file_data, file_size, new Date(), file_name];
        let insertParams = [file_type, file_name, file_data, file_size, new Date(), new Date()];

        //找到編號之後賦值其他參數
        let sql = 'INSERT INTO  files( '
            + 'filetype,filename,filedata,length,updatedAt,createdAt)'
            + ' VALUE(?,?,?,?,?,?) ';

        let checkdata = await ctx.db.query("SELECT * FROM files WHERE filename =? ", [file_name])

        //如果有，就更新
        if (checkdata.length !== 0) {
            await ctx.db.query('UPDATE files SET filetype=?,filedata =?,length=?,updatedAt =? WHERE filename=?', updateParams)

        } else {
            //如果沒有，就新增
            await ctx.db.query(sql, insertParams)
        }
    }
    let result = { 'Action': 'UploadFile', 'IsSuccess': 'True', 'Message': 'OK' };
    ctx.body = (JSON.stringify(result));
})


router.post('/queryfile', async (ctx, next) => {
    let filedata = await ctx.db.query("SELECT * FROM files where 1=1");

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': filedata };
    ctx.body = JSON.stringify(result);
})

router.post('/down', async (ctx, next) => {
    let { name } = ctx.request.body;
    let file = await ctx.db.singleConditionQuery('files', 'exact', 'filename', name)
    ctx.body = (file[0].filedata);
})

module.exports = router