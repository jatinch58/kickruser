const { model, Schema } = require("mongoose");
const category = require("./category");
const subCategorySchema = new Schema(
  {
    subCategoryName: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: category,
    },
    iconUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = model("subcategory", subCategorySchema);
