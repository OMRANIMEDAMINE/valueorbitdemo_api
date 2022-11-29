const mongoose = require("mongoose");

require("dotenv/config");

 
 
// LOCAL db.js
// const mongoLocalUri = "mongodb+srv://omrani:rocame460@cluster0.kfxvl.mongodb.net/ValueOrbitDB_api1"
const mongoLocalUri = process.env.DB_CONNECTION
 




try {
  // Connect to the MongoDB cluster
  mongoose.connect(
    mongoLocalUri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(" Mongoose is connected"),
  );
} catch (e) {
  console.log("could not connect");
}

/* mongoose.connect(`process.env.DB_CONNECTION`, () => {
  console.log("connect to database ");
}); */

module.exports = mongoose;