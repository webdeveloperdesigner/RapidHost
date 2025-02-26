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
app.use(express.static("public"));
app.use(express.static("sites"));

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join(__dirname, "sites", siteName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));

        return res.json({ 
            message: `<a href='/${siteName}/index.html' target='_blank'>${siteName}/index.html</a>` 
        });
    } catch (err) {
        return res.status(500).json({ error: "Deployment failed", details: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
