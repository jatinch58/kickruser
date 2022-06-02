const { model, Schema } = require("mongoose");
const subCategorySchema = new Schema(
  {
    subCategoryName: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
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
