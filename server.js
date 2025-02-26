const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static("public")); // Serves static frontend
app.use(express.static("sites")); // Serves deployed sites

// ✅ API Route for Deployment
app.post("/upload", upload.single("file"), async (req, res) => {
    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join(__dirname, "sites", siteName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));
        res.json({ message: `Deployed at: https://rapidhost-jyjy.onrender.com/${siteName}/index.html` });
    } catch (err) {
        res.status(500).json({ error: "Deployment failed" });
    }
});

// ✅ Keep Your API Routes Working
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
});

// ✅ Serve index.html as the Default Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
