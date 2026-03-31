import { Router } from "express";
import {
  createParcelController,
  getAllParcelsController,
  getParcelByIdController,
  updateParcelController,
  deleteParcelController,
  getUserParcelsController,
  updateParcelStatusController,
} from "../controllers/parcel.controller.js";
import { authenticateToken, isAdmin } from "../middleware/auth.middleware.js";

const parcelRouter = Router();

parcelRouter.post("/create", authenticateToken, createParcelController);
parcelRouter.get("/", authenticateToken, isAdmin, getAllParcelsController);
parcelRouter.get("/my", authenticateToken, getUserParcelsController);
parcelRouter.get("/:id", authenticateToken, getParcelByIdController);
parcelRouter.put("/:id", authenticateToken, isAdmin, updateParcelController);
parcelRouter.patch(
  "/status/:id",
  authenticateToken,
  isAdmin,
  updateParcelStatusController,
);
parcelRouter.delete("/:id", authenticateToken, isAdmin, deleteParcelController);

export default parcelRouter;
