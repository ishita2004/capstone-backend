import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
const upload = multer(); // uses memory storage

// Middlewares
app.use(cors());
app.use(express.json());

// Auth Routes (NO MongoDB)
app.use("/api/auth", authRoutes);

// HuggingFace Proxy Route
app.post("/api/transform", upload.single("file"), async (req, res) => {
  try {
    console.log("📥 File received:", req.file?.originalname);
    console.log("📂 Genre:", req.body.genre);

    if (!req.file || !req.body.genre) {
      return res.status(400).json({ error: "File or genre missing" });
    }

    // Prepare data for HuggingFace API
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);
    formData.append("genre", req.body.genre);

    // Forward to HuggingFace API
    const response = await axios.post(
      "https://arjun9036-script-writer-api.hf.space/generate-script-from-pdf",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ HuggingFace API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to transform script" });
  }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
