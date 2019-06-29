var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var AdminSchema           = new mongoose.Schema({

        username: { type: String, unique: true, required: true },
        password: String,
        first_name: String,
        middle_name:String,
        last_name: String,
        gender: String,
        email: { type: String, unique: true, required: true },
        mobile_number: { type: String, unique: true, required: true },
        Landline_number: { type: String, unique: true, required: true },
        type:{type:String,default:"admin"},
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    });
AdminSchema.plugin(passportLocalMongoose);  
module.exports = mongoose.model("Admin", AdminSchema);
