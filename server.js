import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();
const upload = multer();

// ✅ Enable CORS globally
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ Auth Routes (Make sure they don't use Mongo)
app.use("/api/auth", authRoutes);

// ✅ Proxy route to Hugging Face API
app.post("/api/transform", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.genre) {
      return res.status(400).json({ error: "File or genre missing." });
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);
    formData.append("genre", req.body.genre);

    const response = await axios.post(
      "https://arjun9036-script-writer-api.hf.space/generate-script-from-pdf",
      formData,
      { headers: formData.getHeaders() }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Error calling Hugging Face API:", error.message);
    res.status(500).json({ error: "Failed to transform script" });
  }
});

// ------------------------------------------
// 🚀 Start Server (No MongoDB Needed)
// ------------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
