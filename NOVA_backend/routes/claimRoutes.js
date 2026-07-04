import { Router } from "express";
import { verifyToken, authorize } from "../middleware/auth.js";
import {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
} from "../controllers/claimController.js";

const router = Router();

// GET  /api/claims/mine          → current user's claims
router.get("/mine", verifyToken, getMyClaims);

// POST /api/claims               → submit a new claim
router.post("/", verifyToken, createClaim);

// GET  /api/claims               → all claims (admin only)
router.get("/", verifyToken, authorize("admin", "staff"), getAllClaims);

// PATCH /api/claims/:id/approve  → approve a claim (admin only)
router.patch("/:id/approve", verifyToken, authorize("admin", "staff"), approveClaim);

// PATCH /api/claims/:id/reject   → reject a claim (admin only)
router.patch("/:id/reject", verifyToken, authorize("admin", "staff"), rejectClaim);

export default router;
