function uploadFile() {
    let fileInput = document.getElementById("fileUpload");
    let siteNameInput = document.getElementById("siteName").value;
    let statusDiv = document.getElementById("status");

    if (!fileInput.files.length) {
        statusDiv.innerHTML = "<span style='color:red'>❌ No file selected</span>";
        return;
    }

    let formData = new FormData();
    formData.append("file", fileInput.files[0]);
    if (siteNameInput) formData.append("siteName", siteNameInput);

    statusDiv.innerHTML = "⏳ Uploading...";

    fetch("/upload", { method: "POST", body: formData })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            statusDiv.innerHTML = `<span style='color:red'>❌ ${data.error}</span>`;
        } else {
            statusDiv.innerHTML = `✅ Deployed at: ${data.message}`;
        }
    })
    .catch(err => {
        statusDiv.innerHTML = "<span style='color:red'>❌ Upload failed</span>";
    });
}
