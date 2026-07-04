import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import { uploadImages } from "../controllers/uploadController.js";

const router = Router();

// Multer config — memory storage (buffers), max 5MB per file, max 4 files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// POST /api/uploads — upload up to 4 images (requires auth)
router.post("/", verifyToken, upload.array("images", 4), uploadImages);

export default router;
