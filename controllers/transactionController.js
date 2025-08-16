const Transaction = require("../models/TransactionModel");
const Category = require("../models/categoryModel");/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private (authenticated user)
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, categoryName, amount, paymentMethod, description, date } = req.body;

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

    // ✅ 3. Get secure URL from Cloudinary upload
    let receiptImage = null;
    if (req.file) {
      receiptImage = req.file.path; // 👈 secure_url from Cloudinary
    }

    // ✅ 4. Create transaction
    const transaction = new Transaction({
      type,
      category: category._id,
      amount,
      paymentMethod,
      description,
      date,
      receiptImage, // 👈 stored as secure_url
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



exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: income | expense

    let query = {};
    if (type && ["income", "expense"].includes(type)) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    // Validate inputs
    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Check if category already exists
    let existingCategory = await Category.findOne({
      name: name.trim().toLowerCase(),
      type: type.toLowerCase(),
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create category
    const category = new Category({
      name: name.trim(),
      type: type.toLowerCase(),
    });

    await category.save();

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
