var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema            = new mongoose.Schema({
	username: { type: String, unique: true, required: true },
    password: String,
    first_name: String,
    middle_name:String,
    last_name: String,
    gender: String,
    email: String,
	mobile_number: String,
	Landline_number: String
});

UserSchema.plugin(passportLocalMongoose);  
module.exports = mongoose.model("User", UserSchema);
