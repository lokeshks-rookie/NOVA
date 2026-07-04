// ─── Gemini AI Utility Service ──────────────────────────────────────────────
// Uses the official @google/genai SDK to connect to Gemini 2.5 Flash.

import { GoogleGenAI } from "@google/genai";
import { Item } from "../../NOVA_database/models/index.js";

// Initialize AI. GoogleGenAI automatically uses options or env variables.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Parses a data URL (base64 string) into raw data and mimeType for Gemini API.
 */
const parseBase64Image = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
};

/**
 * Validates report title, description, and images using Gemini multimodal features.
 */
export const validateReportIntegrity = async (title, description, category, type, imageBase64List = []) => {
  try {
    const prompt = `
      You are an AI moderator for a college Campus Lost & Found app named NOVA.
      Analyze the following reported item:
      - Type: "${type}" (lost or found)
      - Category: "${category}"
      - Title: "${title}"
      - Description: "${description}"

      If images are provided, analyze them as well.
      Check for:
      1. Spam, gibberish, or advertisement content.
      2. Mismatches: Does the text match the provided image? (e.g., description says "found keys" but the photo is a laptop, or description is toxic).
      3. Incoherent or joke reports.

      Return your response in strict JSON format:
      {
        "isFlagged": true/false,
        "reason": "Clear explanation of why it is flagged, or null if it's fine",
        "confidence": 0.0 to 1.0
      }
    `;

    const contents = [];

    // Add any images we received
    if (imageBase64List && imageBase64List.length > 0) {
      for (const imgUrl of imageBase64List) {
        const parsed = parseBase64Image(imgUrl);
        if (parsed) {
          contents.push({
            inlineData: {
              data: parsed.data,
              mimeType: parsed.mimeType,
            },
          });
        }
      }
    }

    contents.push(prompt);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text.trim());
    return result;
  } catch (error) {
    console.error("❌ Gemini report validation failed:", error.message);
    // Fallback: assume clean so app flow doesn't block on API issues
    return {
      isFlagged: false,
      reason: "AI validation failed to execute.",
      confidence: 0.0,
    };
  }
};

/**
 * Chatbot assistant route helper.
 * Maintains context and responds in markdown to guide users.
 */
export const chatAssistant = async (messagesHistory) => {
  try {
    // Fetch all currently open/active items from the database
    const dbItems = await Item.find({ status: "open" });
    const activeItemsText = dbItems.length > 0
      ? dbItems.map((item) => `- [${item.type.toUpperCase()}] "${item.title}" in ${item.location} (${item.category}). Description: ${item.description}`).join("\n")
      : "No items are currently listed as open in the database.";

    // Standardize input messages for Gemini API
    // Gemini API expects: contents: [{ role: 'user'|'model', parts: [{ text: '...' }] }]
    const contents = messagesHistory.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Insert system instructions at the start including the live database inventory
    const systemInstruction = `
      You are Nova Assistant, the official AI guide for the NOVA Campus Lost & Found System.
      
      CRITICAL: You DO have direct access to the live database of reported items, which is provided below under "Live List of Open Items". 
      Do NOT state "I don't have access to the database" or "I cannot search the database". You must search this list to answer user queries about found or lost items.
      
      Live List of Open Items:
      ${activeItemsText}
      
      Key guidelines:
      - Be warm, helpful, and concise.
      - If a user asks if someone has found/lost a specific item (e.g. "Has anyone found a blue ID card?" or "I lost my backpack"), search the "Live List of Open Items" above.
      - If you find a matching item, list its title, location, and category, and direct them to click "Search Items" in the sidebar to search for it and initiate a claim.
      - If you do not find a matching item in the list, tell them: "I checked the database and couldn't find a matching open report. I suggest you click 'Report Item' in the sidebar to raise a report."
      - Keep responses short and use bullet points for clarity.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("❌ Gemini Chat Assistant failed:", error.message);
    return "I'm having trouble connecting to my brain right now. Can you please try asking again in a moment?";
  }
};

/**
 * Natural language semantic search filter.
 * Uses Gemini to rank database items based on matching user query.
 */
export const filterSearchItems = async (query, dbItems) => {
  try {
    if (!query || !dbItems || dbItems.length === 0) {
      return [];
    }

    // Format db items into a lightweight list for token efficiency
    const itemsData = dbItems.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      description: item.description,
      category: item.category,
      location: item.location,
      type: item.type,
    }));

    const prompt = `
      You are a search matching engine for a Campus Lost & Found app.
      A user entered the natural language search query: "${query}"

      Evaluate the list of items below and determine which ones match this query semantically.
      For example, if the query is "lost dark bag", it should match items with descriptions like "black laptop backpack".
      
      Items to search:
      ${JSON.stringify(itemsData)}

      Rank the matching items from most relevant to least relevant. Only include matches where relevance score is 30 or higher (out of 100).
      Return your response in strict JSON format as an array of matching item IDs with their relevance score:
      [
        { "id": "item_id_here", "score": 85 }
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedResults = JSON.parse(response.text.trim());
    return parsedResults; // Array of { id, score }
  } catch (error) {
    console.error("❌ Gemini semantic search failed:", error.message);
    return []; // Return empty on failure
  }
};
