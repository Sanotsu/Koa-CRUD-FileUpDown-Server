const mongoose = require('../libs/mongodb/mongoose_conn')

const Schema = mongoose.Schema

const LoginSchema = new Schema({
    acc: String,
    pwd: String
}, { collection: 'login' })

module.exports = mongoose.model('Login', LoginSchema)


