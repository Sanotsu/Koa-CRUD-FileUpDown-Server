
//數據庫相關配置和常用操作封裝

const mysql = require('mysql');
//自己封裝的，可await使用mysql query的小東西
const co = require('../mysql/mysql_query_promise');
const config = require('../../config');

let conn = mysql.createPool({
    host: config.db_host,
    port: config.db_port,
    user: config.db_user,
    password: config.db_password,
    database: config.db_name,
    timezone: config.TIME_ZONE,
    multipleStatements: true
});

let db = co(conn);
module.exports = db;

//通過ID查詢某條數據，指定表名，id和查詢返回的欄位
db.getById = async (table, id, fields = "*") => {

    //這種數據庫操作，如果出錯，就是服務器內部的錯誤，拋到最外層會攔截，如果往下執行了，那就沒有出錯

    let rows = await db.query(`SELECT ${fields} FROM ${table} WHERE id=?`, [id]);

    //如果查詢無結果，需要拋出一個錯誤或者提醒，不應該直接成功
    if (rows.length === 0) {
        throw { code: 2345, msg: 'no data' };
    } else {
        return rows[0];
    }
}

//通過ID刪除，指定表名和id
db.delById = async (table, id) => {
    await db.query(`DELETE FROM ${table} WHERE id=?`, [id]);
}

//單個查詢條件 精確/模糊查詢
//參數分別為 需要查詢的table，查詢類型（精確/模糊），單個查詢條件欄位，查詢的值，查詢返回結果的欄位
db.singleConditionQuery = async (table, queryType, condition, conditionValue, fields = '*') => {

    let rows = ''
    try {
        if (queryType.toLowerCase() === "exact") {
            rows = await db.query(`SELECT ${fields} FROM ${table} WHERE ${condition}=?`, [conditionValue]);
        } else if (queryType.toLowerCase() === "fuzzy") {
            rows = await db.query(`SELECT ${fields} FROM ${table} WHERE ${condition} like ?`, ["%" + conditionValue + "%"]);
        } else {
            throw { code: 2345, msg: 'wrong query type' };
        }

        //如果查詢無結果，需要拋出一個錯誤或者提醒，不應該直接成功
        if (rows.length === 0) {

            throw { code: 2345, msg: 'no data' };
        } else {
            return rows;
        }
    } catch (e) {
        console.log(e)
    }
}

db.queryAll = async (table, fields = '*') => {

    let rows = await db.query(`SELECT ${fields} FROM ${table} ORDER BY id ASC`);

    if (rows.length === 0) {
        throw { code: 2345, msg: 'no data' };
    } else {
        return rows;
    }
}