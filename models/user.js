const { model, Schema } = require("mongoose");
const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    dob: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = model("user", userSchema);
