
const combineRouters = require('koa-combine-routers')

// const emp_mysql = require('./use-mysql/emp_mysql')
// const login = require('./use-mysql/login')
// const file_mysql = require('./use-mysql/files_mysql')

const emp_mongo = require('./use-mongodb/emp_mongo')
const files_mongo = require('./use-mongodb/files_mongo')

const router = combineRouters([
    //emp_mysql,
    //login,
    //file_mysql,
    emp_mongo,
    files_mongo
])

module.exports = router;