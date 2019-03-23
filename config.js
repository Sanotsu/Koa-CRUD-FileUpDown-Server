const path = require('path');

//server的一些參數配置
module.exports = {
    //數據庫相關參數
    db_host: 'localhost',
    db_port: 3306,
    db_user: 'swm',
    db_password: 'root',
    db_name: 'db_crud_test',
    TIME_ZONE: 'CCT',
    //TIME_ZONE:'CCT'中國標準時區，UTC 世界协调时间

    //靜態資源路徑
    path_static: path.join(__dirname, './static'),

    //mongodb的連接地址
    mgdb_url: 'mongodb://localhost:27017/test',
};