// Define types for message passing
interface LinkMessage {
    action: string;
    link: string;
    linkType: string;
}

// Function to send a message to the background script
function sendMessageToBackground(action: string, link: string, linkType: string) {
    chrome.runtime.sendMessage({ action, link, linkType });
}

// Function to update the ui with collected links
function updateUI(links: { [key: string]: string[] }) {
    const linksContainer = document.getElementById("links-container");
    if (!linksContainer) return;

    linksContainer.innerHTML = ""; // Clear previous content

    Object.keys(links).forEach((linkType) => {
        const linkList = links[linkType];
        const linkTypeHeader = document.createElement("h3");
        linkTypeHeader.textContent = linkType.charAt(0).toUpperCase() + linkType.slice(1) + " Links";
        linksContainer.appendChild(linkTypeHeader);

        const list = document.createElement("ul");
        linkList.forEach((link) => {
            const listItem = document.createElement("li");
            const anchor = document.createElement("a");
            anchor.href = link;
            anchor.textContent = link;
            listItem.appendChild(anchor);
            list.appendChild(listItem);
        });

        linksContainer.appendChild(list);
    });
}

// Function to handle export button click
function handleExportButtonClick() {
    chrome.runtime.sendMessage({ action: "exportLinks" });
}

// Function to handle random button click
function handleRandomButtonClick() {
    chrome.runtime.sendMessage({ action: "selectRandomLink" });
}

// Function to handle checkbox change event
function handleCheckboxChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const checkboxId = checkbox.id;
    const isChecked = checkbox.checked;
    chrome.storage.sync.get("selectedTypes", (result) => {
        let selectedTypes: string[] = result.selectedTypes || [];
        if (isChecked && !selectedTypes.includes(checkboxId)) {
            selectedTypes.push(checkboxId);
        } else if (!isChecked && selectedTypes.includes(checkboxId)) {
            selectedTypes = selectedTypes.filter((type) => type !== checkboxId);
        }
        chrome.storage.sync.set({ selectedTypes });
    });
}

// Initialize ui and event listeners
document.addEventListener("DOMContentLoaded", () => {
    // Initialize ui based on user preferences
    chrome.storage.sync.get("selectedTypes", (result) => {
        const selectedTypes: string[] = result.selectedTypes || ["images", "videos", "outside"];
        selectedTypes.forEach((type) => {
            const checkbox = document.getElementById(`$(type)-checkbox`) as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    });

    // Add event listeners to checkbox changes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", handleCheckboxChange);
    });

    // Add event listener for export button click
    const exportButton = document.getElementById("export-button");
    if (exportButton) {
        exportButton.addEventListener("click", handleExportButtonClick);
    }

    // Add event listener for random button click
    const randomButton = document.getElementById("random-button");
    if (randomButton) {
        randomButton.addEventListener("click", handleRandomButtonClick);
    }

    // Display collected links
    chrome.runtime.sendMessage({ action: "getLinks" }, (response) => {
        updateUI(response);
    });
});