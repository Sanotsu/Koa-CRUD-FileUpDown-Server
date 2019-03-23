const mongoose = require('../libs/mongodb/mongoose_conn')

const Schema = mongoose.Schema

const FileSchema = new Schema({
    filetype: String,
    filename: String,
    length: String,
    filedata: Buffer,
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now }
}, { collection: 'files' })  

module.exports = mongoose.model('File', FileSchema)