const router = require('koa-router')()
const fs = require('fs')
let getFormatDate = require('../../libs/common/dateFormat').getFormatDate();


router.get('/wsquerydata', async (ctx) => {

    ctx.websocket.on('message', async (message) => {
        let { name } = JSON.parse(message);
        let queryType = '';
        if (name === '') {
            queryType = 'fuzzy'
        } else {
            queryType = 'exact'
        }
        let data = await ctx.db.singleConditionQuery('employee', queryType, 'name', name);
        ctx.websocket.send(JSON.stringify({ 'data': data }));
    });
});

router.get('/wsupdatedata', async (ctx, next) => {

    ctx.websocket.on('message', async (msg) => {

        let { age, mail, name } = JSON.parse(msg);
        let pa_na = name;
        let data = await ctx.db.query("UPDATE employee SET age=?,mail=? WHERE NAME=?", [
            age, mail, name
        ]);
        let result = { 'Action': 'UpdateEmployee', 'IsSuccess': true, 'Message': 'Update ' + pa_na + ' Success!' };

        ctx.websocket.send(JSON.stringify(result))

    })

})

router.get('/wsinsertdata', async (ctx, next) => {

    ctx.websocket.on('message', async (msg) => {

        let { age, mail, name, empDate, sex } = JSON.parse(msg);
        let pa_na = name;

        empDate = getFormatDate(new Date(empDate));

        await ctx.db.query("INSERT INTO employee (name, age, sex, empDate, mail) VALUES(?,?,?,?,?)", [
            name, age, sex, empDate, mail]);

        let result = { 'Action': 'InsertEmployee', 'IsSuccess': true, 'Message': 'Insert ' + pa_na + ' Success!' };
        ctx.websocket.send(JSON.stringify(result))
    })
})


router.get('/wsdeletedata', async (ctx, next) => {

    ctx.websocket.on('message', async (msg) => {

        let { name } = JSON.parse(msg);
        let pa_na = name;

        await ctx.db.query("DELETE FROM employee WHERE NAME=?", [name]);

        let result = { 'Action': 'DeleteEmployee', 'IsSuccess': true, 'Message': 'Delete ' + pa_na + ' Success!' };
        ctx.websocket.send(JSON.stringify(result))
    })
})

router.get('/wsupload', async (ctx, next) => {
    let filename = ''
    let buf;
    let fileinfo;

    ctx.websocket.on('message', async (msg) => {

        if (typeof (msg) === 'string') {
            fileinfo = JSON.parse(msg);
            filename = fileinfo.name;
        } else if (typeof (msg) === 'object') {
            buf = (Buffer.from(msg));
            if (filename.length > 0 && buf.length > 0) {
                try {
                    fs.writeFileSync(`upload-ws/${filename}`, buf, 'binary');

                    //整理相關數據，存到數據庫
                    let file_data = buf;
                    let file_type = fileinfo.type;
                    let file_name = fileinfo.name;
                    let file_size = fileinfo.size;
                    let updateParams = [file_type, file_data, file_size, new Date(), file_name];
                    let insertParams = [file_type, file_name, file_data, file_size, new Date(), new Date()];

                    //找到編號之後賦值其他參數
                    let sql = 'INSERT INTO  files( '
                        + 'filetype,filename,filedata,length,updatedAt,createdAt)'
                        + ' VALUE(?,?,?,?,?,?) ';
                    let checkdata = await ctx.db.query("SELECT * FROM files WHERE filename =? ", [file_name])

                    //如果有，就更新
                    if (checkdata.length !== 0) {
                        await ctx.db.query('UPDATE files SET filetype=?,filedata =?,length=?,updatedAt =? WHERE filename=?',
                            updateParams)
                    } else {
                        //如果沒有，就新增
                        await ctx.db.query(sql, insertParams)
                    }
                    let result = { 'Action': 'UploadFile', 'IsSuccess': true, 'Message': file_name + '文件上傳成功' };
                    ctx.websocket.send(JSON.stringify(result))
                } catch (e) {
                    console.log("ws file upload error: ", e)
                }
            } else {
                let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': file_name + '上傳失敗' };
                ctx.websocket.send(JSON.stringify(result))
            }
        }
    })
})


router.get('/wsqueryfile', async (ctx, next) => {

    let filedata = await ctx.db.query("SELECT * FROM files where 1=1");

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': filedata };

    ctx.websocket.send(JSON.stringify(result));

})

router.get('/wsdownlaod', async (ctx, next) => {
    ctx.websocket.on('message', async (msg) => {
        let name = JSON.parse(msg);

        let file = await ctx.db.singleConditionQuery('files', 'exact', 'filename', name)
        ctx.websocket.send(JSON.stringify({ 'filedata': file[0].filedata }));
    })
})

router.get('/wscallsptest', async (ctx, next) => {
    ctx.websocket.on('message', async (msg) => {
        let { age, sex } = JSON.parse(msg);

        let data = await ctx.db.query("call select_emp_by_sex_and_age(?, ?)", [sex, age]);

        let result = { 'Action': 'QueryEmployeeBySp', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
        ctx.websocket.send(JSON.stringify(result))
    })
})


module.exports = router