
function main() {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const uploadScreen = document.getElementById("upload-screen");
    const swaggerScreen = document.getElementById("swagger-screen");
    const backButton = document.getElementById("backButton");
    const themeToggles = Array.from(document.getElementsByClassName("theme-toggle"));

    const urlParams = new URLSearchParams(window.location.search);
    const spec = urlParams.get("swag");
    if (spec) {
        try {
            const compressed = LZString.decompressFromEncodedURIComponent(spec);
            showSwagger(JSON.parse(compressed));
        } catch (error) {
            console.error("Error loading Swagger from URL", error);
        }
    }

    function toggleTheme() {
        document.body.classList.toggle("dark-mode");
        const icon = document.body.classList.contains("dark-mode") ? "☀️" :  "🌙";
        themeToggles.forEach(t => t.textContent = icon);
    }

    function showSwagger(json) {
        uploadScreen.classList.add("hidden");
        swaggerScreen.classList.remove("hidden");
        SwaggerUIBundle({ spec: json, dom_id: "#swagger-container" });

        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(json));
        history.replaceState(null, "", `?swag=${compressed}`);
    }

    function handleFile(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                let json;
                if (file.name.endsWith(".yaml") || file.name.endsWith(".yml")) {
                    json = jsyaml.load(e.target.result);
                } else if (file.name.endsWith(".json")) {
                    json = JSON.parse(e.target.result);
                } else {
                    alert("Only YAML or JSON files allowed.");
                    return;
                }
                showSwagger(json);
            } catch (error) {
                alert("Error processing file.");
            }
        };
        reader.readAsText(file);
    }

    themeToggles.forEach(t => t.addEventListener("click", toggleTheme));

    fileInput.addEventListener("change", (event) => {
        if (event.target.files.length > 0) {
            handleFile(event.target.files[0]);
            event.target.value = null;
        } 
    });

    dropzone.addEventListener("click", () => fileInput.click());    
    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropzone.classList.remove('dragover');
        if (event.dataTransfer.files.length > 0) handleFile(event.dataTransfer.files[0]);
    });

    backButton.addEventListener("click", () => {
        history.replaceState(null, "", window.location.pathname);
        swaggerScreen.classList.add("hidden");
        uploadScreen.classList.remove("hidden");
    });
}

document.addEventListener('DOMContentLoaded', function() {
    main();
});