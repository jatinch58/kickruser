const { model, Schema } = require("mongoose");
const user = require("./user");
const category = require("./category");
const subCategory = require("./subCategory");
const productSchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    productOfferPrice: {
      type: Number,
      required: true,
    },
    productMainImgUrl: {
      type: String,
      required: true,
    },
    productImgUrl: [
      {
        type: String,
      },
    ],
    productCategory: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: category,
    },
    productSubCategory: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: subCategory,
    },
    productStock: {
      type: Boolean,
      required: true,
    },
    productDescription: {
      type: String,
      required: true,
    },
    demolink: {
      type: String,
    },
    productReview: [
      {
        review: {
          type: Number,
        },
        reviewBy: {
          type: Schema.Types.ObjectId,
          ref: user,
        },
        comment: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
module.exports = model("product", productSchema);
