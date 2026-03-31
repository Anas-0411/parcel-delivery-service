import { Router } from "express";
import {
  loginUserController,
  registerUserController,
  logoutUserController,
  refreshTokenController,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerUserController);
authRouter.post("/login", loginUserController);
authRouter.post("/logout", authenticateToken, logoutUserController);
authRouter.post("/refresh-token", refreshTokenController);

export default authRouter;
