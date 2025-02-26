document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById("fileInput").files[0];
    const siteName = document.getElementById("siteName").value;
    if (!fileInput) return alert("Please select a ZIP file.");

    let formData = new FormData();
    formData.append("file", fileInput);
    formData.append("siteName", siteName);

    document.getElementById("status").textContent = "Uploading...";

    try {
        let res = await fetch("https://rapidhost-jyjy.onrender.com/upload", {
            method: "POST",
            body: formData
        });
        let data = await res.json();
        
        if (res.ok) {
            document.getElementById("status").innerHTML = `✅ Deployed: <a href="${data.message}" target="_blank">${data.message}</a>`;
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        document.getElementById("status").textContent = "❌ Upload failed: " + err.message;
    }
});
