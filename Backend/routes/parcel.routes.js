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
import { authenticateToken } from "../middleware/auth.middleware.js";

const parcelRouter = Router();

parcelRouter.post("/create", authenticateToken, createParcelController);
parcelRouter.get("/", authenticateToken, getAllParcelsController);
parcelRouter.get("/my", authenticateToken, getUserParcelsController);
parcelRouter.get("/:id", authenticateToken, getParcelByIdController);
parcelRouter.put("/:id", authenticateToken, updateParcelController);
parcelRouter.patch("/status/:id", authenticateToken, updateParcelStatusController);
parcelRouter.delete("/:id", authenticateToken, deleteParcelController);

export default parcelRouter;
