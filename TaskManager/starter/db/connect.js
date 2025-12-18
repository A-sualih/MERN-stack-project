const mongoose = require("mongoose");

const connectDB=(url)=>{
  return mongoose.connect(url)
}


//   1:06 minure
module.exports=connectDB;