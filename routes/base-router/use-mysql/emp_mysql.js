
const router = require('koa-router')()
let getFormatDate = require('../../../libs/common/dateFormat').getFormatDate();

router.post('/querydata', async (ctx, next) => {
    
    let { name } = ctx.request.body;
    let data = await ctx.db.singleConditionQuery('employee', 'fuzzy', 'name', name);

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)
})

router.post('/insertdata', async (ctx, next) => {

    let { name, age, sex, empDate, mail } = ctx.request.body;
    let pa_na = name;

    empDate = getFormatDate(new Date(empDate));

    await ctx.db.query("INSERT INTO employee (name, age, sex, empDate, mail) VALUES(?,?,?,?,?)", [
        name, age, sex, empDate, mail]);

    let result = { 'Action': 'InsertEmployee', 'IsSuccess': true, 'Message': 'Insert ' + pa_na + ' Success!' };

    ctx.body = JSON.stringify(result)

})

router.post('/updatedata', async (ctx, next) => {

    let { age, mail, name } = ctx.request.body;
    let pa_na = name;
    let data = await ctx.db.query("UPDATE employee SET age=?,mail=? WHERE NAME=?", [
        age, mail, name
    ]);
    let result = { 'Action': 'UpdateEmployee', 'IsSuccess': true, 'Message': 'Update ' + pa_na + ' Success!' };

    ctx.body = JSON.stringify(result)
})

router.post('/deletedata', async (ctx, next) => {

    let { name } = ctx.request.body;
    let pa_na = name;
    await ctx.db.query("DELETE FROM employee WHERE NAME=?", [name]);

    let result = { 'Action': 'DeleteEmployee', 'IsSuccess': true, 'Message': 'Delete ' + pa_na + ' Success!' };

    ctx.body = JSON.stringify(result)
})


router.post('/callsptest', async (ctx, next) => {
    let { age, sex } = ctx.request.body;

    let data = await ctx.db.query("call select_emp_by_sex_and_age(?, ?)", [sex, age]);

    let result = { 'Action': 'QueryEmployeeBySp', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)
})


module.exports = router