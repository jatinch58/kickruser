const { model, Schema } = require("mongoose");
const product = require("./products");
const user = require("./user");
const cartSchema = new Schema({
  cartBy: {
    type: Schema.Types.ObjectId,
    ref: user,
    required: true,
  },
  cart: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: product,
        required: true,
      },
      quantity: {
        type: Number,
        default: 0,
      },
    },
  ],
});
module.exports = model("cart", cartSchema);
