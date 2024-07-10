import express from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  protectedMiddleware,
  ownerMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protectedMiddleware);
router.use(ownerMiddleware);

router.route("/").get(getUsers).post(createUser);

router.route("/:id").put(updateUser).delete(deleteUser);

export default router;
