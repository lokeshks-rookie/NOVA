import { Router } from "express";
import { authorize } from "../middleware/mockAuth.js";
import {
  createClaim,
  getMyClaims,
  getAllClaims,
  approveClaim,
  rejectClaim,
} from "../controllers/claimController.js";

const router = Router();

// GET  /api/claims/mine          → current user's claims
router.get("/mine", getMyClaims);

// POST /api/claims               → submit a new claim
router.post("/", createClaim);

// GET  /api/claims               → all claims (admin only)
router.get("/", authorize("admin", "staff"), getAllClaims);

// PATCH /api/claims/:id/approve  → approve a claim (admin only)
router.patch("/:id/approve", authorize("admin", "staff"), approveClaim);

// PATCH /api/claims/:id/reject   → reject a claim (admin only)
router.patch("/:id/reject", authorize("admin", "staff"), rejectClaim);

export default router;
