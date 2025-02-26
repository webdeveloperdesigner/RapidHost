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
        let res = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            let errorText = await res.text(); // Debugging
            throw new Error(`Server error: ${res.status} - ${errorText}`);
        }

        let data = await res.json();
        document.getElementById("status").innerHTML = data.message;

    } catch (err) {
        document.getElementById("status").textContent = "❌ Upload failed: " + err.message;
    }
});
