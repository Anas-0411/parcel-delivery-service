import ParcelModel from "../models/Parcel.model.js";

// @desc    Create a new parcel
// @route   POST /api/v1/parcel/create
// @access  Private

export const createParcelController = async (req, res) => {
  try {
    const parcel = await ParcelModel.create({
      ...req.body,
      status: "pending", // always start from pending
    });

    res.status(201).json({
      success: true,
      message: "Parcel created successfully",
      data: parcel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all parcels
// @route   GET /api/v1/parcel
// @access  Private/Admin

export const getAllParcelsController = async (req, res) => {
  try {
    const parcels = await ParcelModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: parcels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get parcel by ID
// @route   GET /api/v1/parcel/:id
// @access  Private

export const getParcelByIdController = async (req, res) => {
  try {
    const parcel = await ParcelModel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my parcels
// @route   GET /api/v1/parcel/my
// @access  Private

export const getUserParcelsController = async (req, res) => {
  try {
    const email = req.user.email;

    const parcels = await ParcelModel.find({
      $or: [{ senderEmail: email }, { recipientEmail: email }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: parcels,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update parcel
// @route   PUT /api/v1/parcel/:id
// @access  Private

export const updateParcelController = async (req, res) => {
  try {
    const parcel = await ParcelModel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Only sender or admin can update
    if (
      req.user.role !== "admin" &&
      parcel.senderEmail !== req.user.email
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    // Prevent status change from here
    delete req.body.status;

    const updatedParcel = await ParcelModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Parcel updated",
      data: updatedParcel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateParcelStatusController = async (req, res) => {
  try {
    const { status } = req.body;

    // ✅ Match model
    const allowedStatus = ["pending", "in transit", "delivered", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const parcel = await ParcelModel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // ✅ Correct flow
    const validTransitions = {
      pending: ["in transit", "cancelled"],
      "in transit": ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[parcel.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${parcel.status} to ${status}`,
      });
    }

    parcel.status = status;
    await parcel.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: parcel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete parcel
// @route   DELETE /api/v1/parcel/:id
// @access  Private/Admin

export const deleteParcelController = async (req, res) => {
  try {
    // Only admin can delete
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
    const parcel = await ParcelModel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    await parcel.deleteOne();
    res.status(200).json({
      success: true,
      message: "Parcel deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
