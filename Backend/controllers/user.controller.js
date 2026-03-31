import UserModel from "../models/User.model.js";

// @desc    Get logged-in user's profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfileController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/user/all
// @access  Private/Admin
export const getAllUsersController = async (req, res) => {
  try {
    // 🔥 Admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Access denied. Admin only.",
      });
    }

    const users = await UserModel.find().select("-password");

    return res.status(200).json({
      success: true,
      error: false,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete a user
// @route   DELETE /api/user/:id
// @access  Private/Admin
export const deleteUserController = async (req, res) => {
  try {
    // 🔥 Admin only
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Access denied. Admin only.",
      });
    }

    const user = await UserModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update a user
// @route   PUT /api/user/:id
// @access  Private/Admin or Self
export const updateUserController = async (req, res) => {
  try {
    const userId = req.params.id;

    // 🔥 Allow only admin OR self
    if (req.user.role !== "admin" && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Unauthorized",
      });
    }

    const updateFields = { ...req.body };

    // 🔥 Normal user cannot change role/status
    if (req.user.role !== "admin") {
      delete updateFields.role;
      delete updateFields.status;
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: "Server error",
      error: error.message,
    });
  }
};
