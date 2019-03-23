const mongoose = require('../../libs/mongodb/mongoose_conn')

const Schema = mongoose.Schema

const FsFilesSchema = new Schema({
    filename: Object
}, { collection: 'fs.files' }) 

module.exports = mongoose.model('FsFiles', FsFilesSchema)

