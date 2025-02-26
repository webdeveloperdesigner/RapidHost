const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
const upload = multer();  // ✅ Use memory storage (no disk access)

app.use(cors());

app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        const siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
        const fileBuffer = req.file.buffer.toString("base64");  // Convert file to Base64

        res.json({ 
            message: `Fake deployment at: https://your-backend.vercel.app/${siteName}/index.html`, 
            file: fileBuffer 
        });

    } catch (error) {
        res.status(500).json({ error: "Deployment failed" });
    }
});

module.exports = app;
