document.getElementById("upload-form").onsubmit = async (e) => {
    e.preventDefault();
    let file = document.getElementById("file-input").files[0];
    let siteName = document.getElementById("site-name").value || "site-" + Math.random().toString(36).substring(7);

    let formData = new FormData();
    formData.append("file", file);
    formData.append("siteName", siteName);

    let response = await fetch("https://rapid-host.vercel.app//upload", { method: "POST", body: formData });
    let result = await response.json();
    document.getElementById("status").innerText = result.message;
};
