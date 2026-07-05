// ─── Claim Controller ──────────────────────────────────────────────────────
// Submit claims, admin approve/reject, view user's claims.

import {
  Claim,
  Item,
  Notification,
  AuditLog,
} from "../NOVA_database/models/index.js";

// @desc    Submit a new claim for an item
// @route   POST /api/claims
export const createClaim = async (req, res, next) => {
  try {
    const { itemId, answers, proofImageUrl, intent, foundDetails } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Prevent claims on "lost" items (they should be reported as "found" instead)
    if (item.type === "lost" && intent !== "found") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot claim a lost item. Please report it as found instead." });
    }
    if (item.status === "claimed" || item.status === "closed") {
      return res
        .status(400)
        .json({ success: false, message: "This item has already been claimed or closed" });
    }

    // Prevent the reporter from claiming their own item
    if (item.reportedBy.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot claim your own reported item" });
    }

    let status = "pending";
    let rejectReason = null;
    let pickupPin = null;
    let pickupInfo = null;

    // Automatic verification based on the challenge answer
    if (intent !== "found" && item.challengeQuestions && item.challengeQuestions.length > 0) {
      const normalize = (str) => {
        if (!str) return "";
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();
      };

      const expectedAnswer = normalize(item.challengeQuestions[0].answer);
      const providedAnswerObj = answers && answers.length > 0 ? answers[0] : null;
      const providedAnswer = normalize(providedAnswerObj ? providedAnswerObj.answer : "");

      if (providedAnswer === expectedAnswer) {
        status = "approved";
        pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
        pickupInfo = `Collect from Lost & Found desk, Main Block. PIN: ${pickupPin}`;
      } else {
        status = "rejected";
        rejectReason = "Answer does not match verification";
      }
    }

    const claimData = {
      item: itemId,
      claimant: req.user._id,
      answers: answers || [],
      proofImageUrl: proofImageUrl || null,
      status,
      pickupPin,
      pickupInfo,
      rejectReason,
    };
    if (intent === "found") {
      claimData.claimType = "found_submission";
      claimData.foundDetails = foundDetails || null;
    }

    const claim = await Claim.create(claimData);

    // Update item status based on automatic verification
    if (status === "approved") {
      await Item.findByIdAndUpdate(itemId, { status: "claimed" });
    } else if (status === "pending") {
      await Item.findByIdAndUpdate(itemId, { status: "pending_claim" });
    }

    // Notify the reporter
    await Notification.create({
      user: item.reportedBy,
      type: "claim",
      title: status === "approved" ? "Your item has been successfully claimed!" : "Someone attempted to claim your item",
      body: status === "approved" 
        ? `A claim for "${item.title}" was automatically approved because the correct answer was provided.`
        : `A claim was submitted for "${item.title}". ${status === 'rejected' ? 'It was automatically rejected due to an incorrect answer.' : 'It is now under review.'}`,
      relatedItem: item._id,
      relatedClaim: claim._id,
    });

    // Audit
    await AuditLog.create({
      action: "claim_submitted",
      actor: req.user._id,
      target: claim._id,
      targetModel: "Claim",
      metadata: { itemId, itemTitle: item.title },
    });

    res.status(201).json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Get claims for the current user
// @route   GET /api/claims/mine
export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate("item", "title imageUrls category type status")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims (admin)
// @route   GET /api/claims
export const getAllClaims = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const claims = await Claim.find(filter)
      .populate("item", "title imageUrls category type")
      .populate("claimant", "name email role mobile")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: claims });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a claim (admin only)
// @route   PATCH /api/claims/:id/approve
export const approveClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending claims can be approved" });
    }

    // Generate 4-digit PIN for physical pickup
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    claim.status = "approved";
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.pickupPin = pin;
    claim.pickupInfo = `Collect from Lost & Found desk, Main Block. PIN: ${pin}`;
    await claim.save();

    // Update item status
    await Item.findByIdAndUpdate(claim.item._id, { status: "claimed" });

    // Notify the claimant
    await Notification.create({
      user: claim.claimant,
      type: "claim",
      title: "Claim approved",
      body: `Your claim for "${claim.item.title}" was approved. ${claim.pickupInfo}`,
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    // Audit
    await AuditLog.create({
      action: "claim_approved",
      actor: req.user._id,
      target: claim._id,
      targetModel: "Claim",
      metadata: { pin, itemTitle: claim.item.title },
    });

    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a claim (admin only)
// @route   PATCH /api/claims/:id/reject
export const rejectClaim = async (req, res, next) => {
  try {
    const { rejectReason, adminNote } = req.body;

    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }
    if (claim.status !== "pending") {
      return res
        .status(400)
        .json({ success: false, message: "Only pending claims can be rejected" });
    }

    claim.status = "rejected";
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    claim.rejectReason = rejectReason || null;
    claim.adminNote = adminNote || null;
    await claim.save();

    // Reopen item for other claimants
    await Item.findByIdAndUpdate(claim.item._id, { status: "open" });

    // Notify the claimant
    await Notification.create({
      user: claim.claimant,
      type: "claim",
      title: "Claim rejected",
      body: `Your claim for "${claim.item.title}" was rejected. ${adminNote || "See admin notes for details."}`,
      relatedItem: claim.item._id,
      relatedClaim: claim._id,
    });

    // Audit
    await AuditLog.create({
      action: "claim_rejected",
      actor: req.user._id,
      target: claim._id,
      targetModel: "Claim",
      metadata: { rejectReason, adminNote, itemTitle: claim.item.title },
    });

    res.json({ success: true, data: claim });
  } catch (error) {
    next(error);
  }
};
