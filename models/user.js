var mongoose              = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema            = new mongoose.Schema({
	  username:         { type: String, unique: true, required: true },
    password:         String,
    first_name:       String,
    middle_name:      String,
    last_name:        String,
    gender:           String,
    email:            { type: String, unique: true, required: true },
  	mobile_number:    { type: String, unique: true, required: true },
  	Landline_number:  { type: String, unique: true, required: true },

   type:{type:String,default:"user"},
    attendance:[
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Atti"
              }
            ],

	  dailys:[
              {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Daily"
              }
            ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(passportLocalMongoose);  
module.exports = mongoose.model("User", UserSchema);
 