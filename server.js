const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: "/tmp/uploads/" });

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("sites"));

// ✅ Serve a Default Index Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html")); // Make sure "public/index.html" exists
});

// ✅ Upload API
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let zipFileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join(__dirname, "sites", siteName, "original", zipFileName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));

        let link1 = `/${siteName}/original/${zipFileName}/index.html`;
        let link2 = `/${siteName}/original/${zipFileName}/${zipFileName}/index.html`;

        return res.json({
            message: "✔️ Deployment Successful!",
            links: {
                singleFolder: link1,
                nestedFolder: link2
            }
        });
    } catch (err) {
        return res.status(500).json({ error: "❌ Deployment failed" });
    }
});

// ✅ Start Server
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
