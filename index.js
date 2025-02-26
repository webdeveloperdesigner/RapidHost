const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("sites"));

app.post("/upload", upload.single("file"), async (req, res) => {
    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join(__dirname, "sites", siteName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));
        res.json({ message: `Deployed at: https://your-backend.vercel.app/${siteName}/index.html` });
    } catch (err) {
        res.status(500).json({ error: "Deployment failed" });
    }
});

module.exports = app;  // ✅ Required for Vercel to detect as an API
