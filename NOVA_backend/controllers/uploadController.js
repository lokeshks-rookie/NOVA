// ─── Upload Controller ─────────────────────────────────────────────────────
// Handles image uploads to Cloudinary.

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload one or more images to Cloudinary
// @route   POST /api/uploads
export const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files provided" });
    }

    // Upload each file buffer to Cloudinary in parallel
    const uploadPromises = req.files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "nova/items",
              resource_type: "image",
              transformation: [
                { width: 1200, crop: "limit" },   // cap max width to 1200px
                { quality: "auto", fetch_format: "auto" }, // auto-optimize
              ],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          stream.end(file.buffer);
        })
    );

    const urls = await Promise.all(uploadPromises);

    res.json({ success: true, data: urls });
  } catch (error) {
    next(error);
  }
};
