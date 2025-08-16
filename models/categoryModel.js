const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["income", "expense"],
    required: true,
  }
});

// 🔑 Unique index on lowercase(name) + type
CategorySchema.index({ name: 1, type: 1 }, { unique: true });

// Always store lowercase version
CategorySchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.trim().toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
