const Transaction = require("../models/Transaction");
const Category = require("../models/Category");/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private (authenticated user)
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, category, amount, paymentMethod, description, date, receiptImage } = req.body;

    // Validation: type should be income or expense
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Validation: check category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create new transaction
    const transaction = new Transaction({
      type,
      category,
      amount,
      paymentMethod,
      description,
      date,
      receiptImage,
      user: req.user?._id, // comes from auth middleware (JWT session)
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
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