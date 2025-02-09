document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const logo = document.getElementById("logo");
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const uploadScreen = document.getElementById("upload-screen");
    const swaggerScreen = document.getElementById("swagger-screen");
    const backButton = document.getElementById("backButton");
    const shareButton = document.getElementById("shareButton");

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

    if (navigator.canShare) {
        shareButton.classList.remove("hidden");
    }

    function showSwagger(json) {
        body.classList.add("default-background");
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

    logo.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    })

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
        body.classList.remove("default-background");
    });

    shareButton.addEventListener("click", () => {
        navigator.share({
            title: "Share my Swag - API Documentation",
            url: window.location
            }).then(() => {
                console.log('Thanks for sharing!');
            })
            .catch(console.error);
    });

});