import { Router } from "express";
import {
  getUserProfileController,
  getAllUsersController,
  deleteUserController,
  updateUserController,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const userRouter = Router();

// Get logged-in user's profile
userRouter.get("/profile", authenticateToken, getUserProfileController);

// Get all users (admin only, add admin middleware if needed)
userRouter.get("/all", authenticateToken, getAllUsersController);

// Delete a user by ID (admin only, add admin middleware if needed)
userRouter.delete("/:id", authenticateToken, deleteUserController);

// Update a user by ID (admin or self, add admin/self middleware if needed)
userRouter.put("/:id", authenticateToken, updateUserController);

export default userRouter;
