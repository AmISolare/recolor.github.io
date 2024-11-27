document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const hueSlider = document.getElementById("hueSlider");
    const hueValue = document.getElementById("hueValue");
    const colorPicker = document.getElementById("colorPicker");
    const processButton = document.getElementById("processButton");
    const downloadButton = document.getElementById("downloadButton");
    const checklist = document.getElementById("checklist");
    const categories = document.getElementById("categories");

    let texturePack = null;
    let selectedFiles = [];
    let zip = null;

    // Update hue value label
    hueSlider.addEventListener("input", () => {
        hueValue.textContent = hueSlider.value;
    });

    // Synchronize the color picker with the hue slider
    colorPicker.addEventListener("input", () => {
        const hsl = hexToHsl(colorPicker.value);
        hueSlider.value = Math.round(hsl.h);
        hueValue.textContent = hueSlider.value;
    });

    // Handle file upload
    fileInput.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file || !file.name.endsWith(".zip")) {
            alert("Please upload a valid .zip file.");
            return;
        }

        try {
            zip = await JSZip.loadAsync(file);
            texturePack = zip.files;
            populateChecklist(texturePack);
        } catch (error) {
            alert(`An error occurred while processing the ZIP file: ${error.message}`);
        }
    });

    // Populate checklist with categorized tabs
    function populateChecklist(texturePack) {
        checklist.innerHTML = "";
        const filesByCategory = {
            all: [],
            icons: [],
            widgets: [],
            blocks: [],
            items: [],
        };

        for (const fileName in texturePack) {
            if (fileName.endsWith(".png")) {
                const category = fileName.includes("icons")
                    ? "icons"
                    : fileName.includes("widgets")
                    ? "widgets"
                    : fileName.includes("blocks")
                    ? "blocks"
                    : fileName.includes("items")
                    ? "items"
                    : "all";

                filesByCategory[category].push(fileName);
                filesByCategory.all.push(fileName);
            }
        }

        // Default to "all" category
        renderChecklist(filesByCategory, "all");

        // Add click events to tabs
        categories.querySelectorAll(".category-tab").forEach((tab) => {
            tab.addEventListener("click", () => {
                const category = tab.dataset.category;

                categories.querySelectorAll(".category-tab").forEach((t) =>
                    t.classList.remove("active")
                );
                tab.classList.add("active");

                renderChecklist(filesByCategory, category);
            });
        });

        processButton.disabled = false;
    }

    function renderChecklist(filesByCategory, category) {
        checklist.innerHTML = "";
        filesByCategory[category].forEach((fileName) => {
            const div = document.createElement("div");
            div.innerHTML = `<input type="checkbox" value="${fileName}"> ${fileName}`;
            checklist.appendChild(div);
        });
    }

    // Utility function: Convert HEX to HSL
    function hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;

        let max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h: h * 360, s, l };
    }
});
