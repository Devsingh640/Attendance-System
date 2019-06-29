const mongoose = require("mongoose");

const ATTSchema = mongoose.Schema({
	
 timeplz: { type: Date, default: Date.now },
  author: {
   id: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User"
   },
   username: String
 }
});

module.exports = mongoose.model("Atti", ATTSchema);