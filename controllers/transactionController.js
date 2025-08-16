const Transaction = require("../models/TransactionModel");
const Category = require("../models/categoryModel");/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private (authenticated user)
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, categoryName, amount, paymentMethod, description, date } = req.body;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // 🔑 Always normalize name
    const normalizedName = categoryName.trim().toLowerCase();

    // Find category
    let category = await Category.findOne({ name: normalizedName, type });

    if (!category) {
      category = await Category.create({ name: normalizedName, type });
    }

    let receiptImage = null;
    if (req.file) {
      receiptImage = req.file.path; // secure_url from Cloudinary
    }

    const transaction = await Transaction.create({
      type,
      category: category._id,
      amount,
      paymentMethod,
      description,
      date,
      receiptImage,
      user: req.user?._id,
    });

    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
      category,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category already exists for this type" });
    }
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



exports.editCategory = async (req, res) => {
  try {
    const { id } = req.params; // category id from URL
    const { name, type } = req.body;

    // Validate inputs
    if (!name && !type) {
      return res.status(400).json({ message: "At least one field (name or type) must be provided" });
    }

    // Validate type if provided
    if (type && !["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Check if category exists
    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check duplicate (only if name/type are changing)
    if (name || type) {
      const duplicate = await Category.findOne({
        _id: { $ne: id }, // exclude current category
        name: name ? name.trim().toLowerCase() : category.name.toLowerCase(),
        type: type ? type.toLowerCase() : category.type,
      });

      if (duplicate) {
        return res.status(400).json({ message: "Category with same name and type already exists" });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (type) category.type = type.toLowerCase();

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category deleted successfully",
      deletedCategory,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
