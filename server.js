const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Multer setup: Store uploaded files in /tmp
const upload = multer({ dest: "/tmp" });

app.use(cors({ origin: "*" }));
app.use(express.static("public")); // Serve files from 'public' folder

// Upload & Extract ZIP Files
app.post("/upload", upload.single("file"), async (req, res) => {
    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join("/tmp", siteName);
    let publicPath = path.join(__dirname, "public", siteName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));
        await fs.move(sitePath, publicPath, { overwrite: true });

        res.json({ message: `Deployed at: https://rapidhost-jyjy.onrender.com/${siteName}/index.html` });
    } catch (err) {
        res.status(500).json({ error: "Deployment failed", details: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
