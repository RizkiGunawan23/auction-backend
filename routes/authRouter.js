import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  checkUser,
} from "../controllers/authController.js";
import { protectedMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protectedMiddleware, logoutUser);
router.get("/get-user", protectedMiddleware, getCurrentUser);
router.get("/check-user", checkUser);

export default router;
