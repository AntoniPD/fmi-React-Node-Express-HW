const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  cooker: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel" },
  title: { type: String, maxlength: 80 },
  shortDescription: { type: String, maxlength: 256 },
  cookTime: { type: Number },
  products: { type: JSON, required: true },
  imageUrl: {
    type: String,
    required: true,
  },
  longDescription: { type: String, maxlength: 2048 },
  tags: { type: JSON },
  dateOfRegister: { type: Date, default: Date.now },
  dateOfUpdate: { type: Date, default: Date.now },
});

RecipeModel = mongoose.model("RecipeModel", recipeSchema, "recipe");

module.exports = RecipeModel;
