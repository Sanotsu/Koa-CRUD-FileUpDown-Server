const mongoose = require('../../libs/mongodb/mongoose_conn')

const Schema = mongoose.Schema

const MyFilesSchema = new Schema({
    filename: Object
}, { collection: 'MyFiles.files' })

module.exports = mongoose.model('MyFiles', MyFilesSchema)

