const router = require('koa-router')()

router.post('/login', async (ctx, next) => {
    let { acc, pwd } = ctx.request.body;

    let userdata = await ctx.db.query("SELECT * FROM login where acc=?", [acc]);

    if (userdata[0].pwd === pwd) {
        let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': 1 };

        ctx.body = JSON.stringify(result);
    } else {
        let err_result = { 'Action': 'QueryEmployee', 'IsSuccess': false, 'Message': 'OK', 'ResponseData': 0 };
        ctx.body = JSON.stringify(err_result);
    }
})

module.exports = router