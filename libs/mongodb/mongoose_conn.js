
const mongoose = require('mongoose')
const config = require('../../config')

// 連接
mongoose.connect(config.mgdb_url, {
    useNewUrlParser: true
});

// 連接成功
mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to ', config.mgdb_url);
})

// 連接異常
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
})

// 斷開連接
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
})

module.exports = mongoose
