const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    username : String,
    email: String, 
    password: String,
    age: Number,
    verified: {type:Boolean, default:false},
    otp: String,
    otpExpiry: Date
});

module.exports = mongoose.model('user', userSchema) // users model is exported

