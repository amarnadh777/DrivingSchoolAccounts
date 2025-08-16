const Transaction = require("../models/TransactionModel");
const Category = require("../models/categoryModel");/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private (authenticated user)
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, categoryName, amount, paymentMethod, description, date, receiptImage } = req.body;

    // ✅ 1. Validate type
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // ✅ 2. Find or create category by name
    let category = await Category.findOne({ name: categoryName.trim().toLowerCase(), type });

    if (!category) {
      category = new Category({
        name: categoryName.trim(),
        type,
      });
      await category.save();
    }

    // ✅ 3. Create transaction
    const transaction = new Transaction({
      type,
      category: category._id,
      amount,
      paymentMethod,
      description,
      date,
      receiptImage,
      user: req.user?._id, // from auth middleware
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
      category, // return category so UI can cache/update
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Find transaction
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check ownership
    // if (transaction.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "Not authorized to delete this transaction" });
    // }

    await transaction.deleteOne();

    res.status(200).json({
      message: "Transaction deleted successfully",
      transactionId: id,
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};