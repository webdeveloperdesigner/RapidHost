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
        return res.status(400).json({ error: "❌ No file uploaded!" });
    }

    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let zipFileName = path.parse(req.file.originalname).name;
    let sitePath = path.join(__dirname, "sites", siteName);
    let originalFolder = path.join(sitePath, "original", zipFileName);
    let extraFolder = path.join(sitePath, "extra");

    try {
        await fs.ensureDir(originalFolder);
        await fs.ensureDir(extraFolder);

        // Validate ZIP file format
        const fileBuffer = await fs.readFile(req.file.path);
        if (!(fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B)) {
            throw new Error("Invalid ZIP file format.");
        }

        // Extract ZIP file
        await fs.createReadStream(req.file.path)
            .pipe(unzipper.Extract({ path: originalFolder }))
            .promise();

        // Check if index.html is directly inside the extracted folder
        const extractedFiles = await fs.readdir(originalFolder);
        let indexPath;
        if (extractedFiles.includes("index.html")) {
            // If index.html is directly inside originalFolder
            indexPath = `/${siteName}/original/${zipFileName}/index.html`;
        } else {
            // If index.html is inside an extracted folder with the same ZIP name
            indexPath = `/${siteName}/original/${zipFileName}/${zipFileName}/index.html`;
        }

        return res.json({
            message: `<a href='${indexPath}' target='_blank'>${indexPath}</a>`,
            extra: `<a href='/${siteName}/extra/' target='_blank'>Extra Folder</a>`
        });
    } catch (err) {
        return res.status(500).json({ error: "❌ Deployment failed!", details: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
