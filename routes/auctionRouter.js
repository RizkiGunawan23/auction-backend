import express from "express";
import multer from "multer";
import {
  createAuction,
  getAuctionByUser,
  updateAuction,
  deleteAuction,
  importExcelAuction,
} from "../controllers/auctionController.js";
import {
  protectedMiddleware,
  userMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protectedMiddleware);
router.use(userMiddleware);

router.route("/").post(createAuction).get(getAuctionByUser);

router.route("/:id").put(updateAuction).delete(deleteAuction);

router.post("/import", upload.single("file"), importExcelAuction);

export default router;
