const express = require("express");
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const unzipper = require("unzipper");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Use TEMP storage on Vercel/Render
const upload = multer({ dest: "/tmp/uploads/" });

app.use(cors());
app.use(express.static("public"));
app.use(express.static("sites"));

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "❌ No file uploaded!" });
    }

    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let zipFileName = path.parse(req.file.originalname).name;
    let sitePath = path.join("/tmp", "sites", siteName);
    let originalFolder = path.join(sitePath, "original", zipFileName);

    try {
        await fs.ensureDir(originalFolder);

        // ✅ Extract ZIP file to /tmp
        await fs.createReadStream(req.file.path)
            .pipe(unzipper.Extract({ path: originalFolder }))
            .promise();

        // ✅ Check if index.html is directly inside or in a subfolder
        const extractedFiles = await fs.readdir(originalFolder);
        let indexPath;
        if (extractedFiles.includes("index.html")) {
            indexPath = `/${siteName}/original/${zipFileName}/index.html`;
        } else {
            indexPath = `/${siteName}/original/${zipFileName}/${zipFileName}/index.html`;
        }

        return res.json({
            message: `<a href='${indexPath}' target='_blank'>${indexPath}</a>`,
        });
    } catch (err) {
        return res.status(500).json({ error: "❌ Deployment failed!", details: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
