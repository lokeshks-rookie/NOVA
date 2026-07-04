import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { chatAssistant } from "../utils/gemini.js";

const router = Router();

// POST /api/ai/chat → handle conversational chat history
router.post("/chat", verifyToken, async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Invalid request. 'messages' array is required." });
    }

    const reply = await chatAssistant(messages);
    res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
});

export default router;
