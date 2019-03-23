const mongoose = require('../libs/mongodb/mongoose_conn')

const Schema = mongoose.Schema

const EmployeeSchema = new Schema({
    name: String,
    age: Number,
    mail: String,
    sex: String,
    empDate: { type: Date, default: Date.now }
}, { collection: 'employee' }) 

module.exports = mongoose.model('Employee', EmployeeSchema)

//以下同理
// let Employee = mongoose.model('Employee', UserSchema);
// module.exports = Employee;