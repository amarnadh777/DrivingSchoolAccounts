const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["income", "expense"], // Categories are tied to either income or expense
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
