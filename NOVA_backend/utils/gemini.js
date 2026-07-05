// ─── Gemini AI Utility Service ──────────────────────────────────────────────
// Uses the official @google/genai SDK to connect to Gemini 2.5 Flash.

import { GoogleGenAI } from "@google/genai";
import { Item } from "../NOVA_database/models/index.js";

// Common words to ignore during local keyword fallback matching
const STOPWORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "have", "has", "had", 
  "are", "was", "were", "you", "your", "lost", "found", "about", "some", 
  "here", "there", "who", "what", "where", "when", "why", "how", "this", "that"
]);

// Initialize AI. GoogleGenAI automatically uses options or env variables.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Fetches an image from a Cloudinary URL (or any public URL) and returns it as a base64 string
 * with its MIME type, ready for Gemini's inlineData.
 */
const fetchImageAsBase64 = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";
    
    return {
      mimeType,
      data: buffer.toString("base64"),
    };
  } catch (err) {
    console.error("❌ Failed to fetch image for AI validation:", err.message);
    return null;
  }
};

/**
 * Validates report title, description, and images using Gemini multimodal features.
 */
export const validateReportIntegrity = async (title, description, category, type, imageUrls = []) => {
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

    // Add any images we received (now fetched from Cloudinary URLs)
    if (imageUrls && imageUrls.length > 0) {
      for (const imgUrl of imageUrls) {
        const parsed = await fetchImageAsBase64(imgUrl);
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
      - If the user is just saying hello or asking a general question, reply naturally and conversationally without searching the database.
      - If a user asks if someone has found/lost a specific item (e.g. "Has anyone found a blue ID card?" or "I lost my backpack"), search the "Live List of Open Items" above.
      - If they ask about a specific item and you find a matching item, list its title, location, and category, and direct them to click "Search Items" in the sidebar to search for it and initiate a claim.
      - If they ask about a specific item and you do NOT find a matching item in the list, tell them: "I checked the database and couldn't find a matching open report. I suggest you click 'Report Item' in the sidebar to raise a report."
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
    
    // Fallback: Perform local search on the database items when Gemini is exhausted or offline
    try {
      const userMessage = messagesHistory[messagesHistory.length - 1]?.content?.toLowerCase() || "";
      const dbItems = await Item.find({ status: "open" });
      
      const matches = dbItems.filter(item => {
        const title = item.title.toLowerCase();
        const desc = item.description.toLowerCase();
        const location = item.location.toLowerCase();
        const category = item.category.toLowerCase();
        
        // Split user input into words of at least 3 characters and filter out stopwords
        const words = userMessage.split(/[\s,./?!;:]+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
        
        // Check if any word from the user's message matches item details
        return words.some(word => 
          title.includes(word) || 
          desc.includes(word) || 
          location.includes(word) || 
          category.includes(word)
        );
      });
      
      if (matches.length > 0) {
        let reply = `I checked the live database and found these active items matching your query:\n\n`;
        matches.forEach(item => {
          reply += `- **[${item.type.toUpperCase()}]** "${item.title}" in *${item.location}* (${item.category})\n  *Description:* ${item.description}\n`;
        });
        reply += `\nGo ahead and click **"Search Items"** in the sidebar to search for them and raise a claim!`;
        return reply;
      } else {
        if (words.length === 0 || /^(hi|hey|hello|greetings|howdy)\b/i.test(userMessage.trim())) {
          return "Hello! I am Nova Assistant. How can I help you with the Campus Lost & Found today?";
        }
        return `I checked the database but couldn't find any matching open reports for your query. I suggest clicking **"Report Item"** in the sidebar to register it!`;
      }
    } catch (fallbackError) {
      console.error("❌ Fallback local search failed:", fallbackError.message);
      return "I'm having trouble connecting to my brain right now. Can you please try asking again in a moment?";
    }
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
    
    // Fallback: Perform local search on the database items when Gemini is exhausted or offline
    try {
      if (!query || !dbItems || dbItems.length === 0) {
        return [];
      }
      const words = query.toLowerCase().split(/[\s,./?!;:]+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
      return dbItems
        .map(item => {
          let score = 0;
          const title = item.title.toLowerCase();
          const desc = item.description.toLowerCase();
          const location = item.location.toLowerCase();
          const category = item.category.toLowerCase();
          
          words.forEach(word => {
            if (title.includes(word)) score += 50;
            else if (desc.includes(word)) score += 30;
            else if (location.includes(word)) score += 20;
            else if (category.includes(word)) score += 10;
          });
          
          return { id: item._id.toString(), score: Math.min(score, 100) };
        })
        .filter(match => match.score >= 30)
        .sort((a, b) => b.score - a.score);
    } catch (fallbackError) {
      console.error("❌ Fallback semantic search failed:", fallbackError.message);
      return [];
    }
  }
};
