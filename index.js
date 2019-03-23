const Koa = require('koa')
const koaBody = require('koa-body');
const static = require('koa-static');
let cors = require('koa2-cors');
let websockify = require('koa-websocket');
const { path_static } = require('./config');

const app = new Koa()

//在koa框架的context上添加websocket
let socket = websockify(app);

app.listen(2018);
console.log('run on 2018……')

//設定數據庫到context上
// try {
//     app.context.db = require('./libs/mysql/database');
// } catch (error) {
//     console.log("db err", error)
// }

//設定數據庫到context上
try {
    app.context.db = require('./libs/mysql/database');
    app.context.modb = require('./libs/mongodb/mongoose_conn')
} catch (error) {
    console.log("db err", error)
}

//設置跨域請求ok
app.use(cors());

//靜態資源文件(比如前臺可以直接get到的視頻，圖片，css，js等等的存放位置)
app.use(static(path_static));

//解析post等請求的參數
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 200 * 1024 * 1024	// 设置上传文件大小最大限制，默认2M
    }
}));

//錯誤捕獲
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (e) {
        //假定有一個錯誤對照表，code是多少，對應返回信息是多少
        //例如一般的錯誤，2345，傳回去兩個參數ok和 err
        if (e.code === 2345) {
            ctx.body = { ok: false, err: e.msg, ResponseData: '' };
        }
        else {
            ctx.body = { ok: false, err: 'internal app error' };
        }
        console.log("app show err:", e);
    }
})

//直接使用router示例
// const login = require('./routes/login')
// app.use(login.routes(), login.allowedMethods())

//使用koa-combine-routers之后，在有非常多的路由時使用更簡單（此處是koa原本的處理http的路由）
const ro = require('./routes/base-router/index')
app.use(ro())

//此處是ws請求的路由
const wsr = require('./routes/ws-router/wsRouter')
app.ws.use(wsr.routes()).use(wsr.allowedMethods());


/**
 * 說明
 * 
 *  http請求，對於mysql和mongodb之數據的增刪改查，文件上傳下載
 *      在後端切換數據庫只需要修改 /router/base-router/index.js中 引入和使用的router文件
 *      默認是連接的mongodb，需手動修改去處理到mysql的數據
 * 
 *  websocket請求，只有對mysql數據的增刪改查，文件上傳下載進行操作
 *  
 * 
 */
