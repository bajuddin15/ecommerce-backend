const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then((res) => {
      console.log(`MongoDB connected successfully`);
    })
    .catch((err) => {
      console.log({ message: err.message });
      process.exit(1);
    });
};

module.exports = connectDB;
