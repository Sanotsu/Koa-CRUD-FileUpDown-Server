const router = require('koa-router')()

const Employee = require('../../../models/Emps_Model')
const Login = require('../../../models/Login_Model')

router.post('/login', async (ctx) => {

    let { acc, pwd } = ctx.request.body;

    let data = await Login.countDocuments({ acc: acc, pwd: pwd });

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result);

})

router.post('/insertdata', async (ctx) => {

    let { name, age, sex, empDate, mail } = ctx.request.body;

    let new_data = new Employee({
        name: name,
        age: age,
        mail: mail,
        sex: sex,
        empDate: empDate
    });
    await new_data.save();
    let result = { 'Action': 'InsertEmployee', 'IsSuccess': true, 'Message': 'Insert ' + name + ' Success!' };
    ctx.body = (JSON.stringify(result));
})

router.post('/querydata', async (ctx) => {

    let { name } = ctx.request.body;

    let data = await Employee.find(!name ? {} : { name: name });

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
    ctx.body = JSON.stringify(result)
})

router.post('/updatedata', async (ctx) => {

    let { age, mail, name } = ctx.request.body;

    let updataFun = {
        'age': age,
        'mail': mail
    };
    await Employee.updateMany({ name: name }, updataFun)

    let result = { 'Action': 'UpdateEmployee', 'IsSuccess': true, 'Message': 'Update ' + name + ' Success!' };
    ctx.body = JSON.stringify(result)
})

router.post('/deletedata', async (ctx) => {

    let { name } = ctx.request.body;

    await Employee.deleteMany({ name: name })

    let result = { 'Action': 'DeleteEmployee', 'IsSuccess': true, 'Message': 'Delete ' + name + ' Success!' };
    ctx.body = JSON.stringify(result)
})

router.post('/callsptest', async (ctx) => {

    let result = { 'Action': 'callsptest', 'IsSuccess': false, 'Message': 'no mongodb sp handler', 'ResponseData': '' };
    ctx.body = JSON.stringify(result)
})

module.exports = router