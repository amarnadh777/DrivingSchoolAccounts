const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["income", "expense"], // income OR expense
      required: true,
    },
        category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // reference Category model
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "upi", "card"],
      default: "cash",
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // if you want to track who added it
    },
    receiptImage: {
      type: String, // URL if uploaded (Cloudinary/S3)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
