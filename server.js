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
app.use(express.static("public"));
app.use("/sites", express.static(path.join(__dirname, "sites")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let zipFileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    let siteName = req.body.siteName || "site-" + Math.random().toString(36).substring(7);
    let sitePath = path.join(__dirname, "sites", siteName, "original", zipFileName);

    try {
        await fs.ensureDir(sitePath);
        await fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));

        let baseUrl = `${req.protocol}://${req.get("host")}`;
        let link1 = `${baseUrl}/sites/${siteName}/original/${zipFileName}/index.html`;
        let link2 = `${baseUrl}/sites/${siteName}/original/${zipFileName}/${zipFileName}/index.html`;

        let responseHtml = `
            <html>
            <head>
                <title>Upload Successful</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    a { display: block; margin: 10px; padding: 10px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; }
                    a:hover { background: #218838; }
                    input { width: 100%; padding: 10px; margin-top: 10px; text-align: center; }
                </style>
            </head>
            <body>
                <h2>✔️ Deployment Successful!</h2>
                <p>Click the links below to view your deployed pages:</p>
                <a href="${link1}" target="_blank" onclick="copyToClipboard('${link1}')">${link1}</a>
                <a href="${link2}" target="_blank" onclick="copyToClipboard('${link2}')">${link2}</a>
                <p>Click a link to open or copy it below:</p>
                <input type="text" id="copyField" readonly value="" onclick="this.select()">
                <script>
                    function copyToClipboard(text) {
                        document.getElementById("copyField").value = text;
                        document.getElementById("copyField").select();
                        document.execCommand("copy");
                        alert("Copied to clipboard: " + text);
                    }
                </script>
            </body>
            </html>
        `;

        res.send(responseHtml);
    } catch (err) {
        return res.status(500).send("<h3>❌ Deployment failed</h3>");
    }
});

app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
