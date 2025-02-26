const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const multer = require('multer');
const cors = require('cors');

const upload = multer({ dest: '/tmp/uploads/' });

module.exports = (req, res) => {
    // Enable CORS if necessary
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handling OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Multer to handle the file upload
        upload.single('file')(req, res, async function (err) {
            if (err) {
                return res.status(500).json({ error: "File upload failed", message: err.message });
            }

            const zipFileName = path.basename(req.file.originalname, path.extname(req.file.originalname));
            const siteName = req.body.siteName || 'site-' + Math.random().toString(36).substring(7);
            const sitePath = path.join('/tmp', 'sites', siteName, 'original', zipFileName);

            try {
                // Extract the uploaded zip file
                await fs.promises.mkdir(sitePath, { recursive: true });
                const extractStream = fs.createReadStream(req.file.path).pipe(unzipper.Extract({ path: sitePath }));

                extractStream.on('close', () => {
                    const baseUrl = `${req.protocol}://${req.headers.host}`;
                    const link1 = `${baseUrl}/sites/${siteName}/original/${zipFileName}/index.html`;
                    const link2 = `${baseUrl}/sites/${siteName}/original/${zipFileName}/${zipFileName}/index.html`;

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
                            <a href="${link1}" target="_blank">${link1}</a>
                            <a href="${link2}" target="_blank">${link2}</a>
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
                });

                extractStream.on('error', (err) => {
                    return res.status(500).json({ error: "File extraction failed", message: err.message });
                });
            } catch (err) {
                return res.status(500).json({ error: "Error processing file", message: err.message });
            }
        });
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
