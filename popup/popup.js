"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Define types for message passing
var chrome = require("chrome");
// Function to send a message to the background script
function sendMessageToBackground(action, link, linkType) {
    chrome.runtime.sendMessage({ action: action, link: link, linkType: linkType });
}
// Function to update the ui with collected links
function updateUI(links) {
    var linksContainer = document.getElementById("links-container");
    if (!linksContainer)
        return;
    linksContainer.innerHTML = ""; // Clear previous content
    Object.keys(links).forEach(function (linkType) {
        var linkList = links[linkType];
        var linkTypeHeader = document.createElement("h3");
        linkTypeHeader.textContent = linkType.charAt(0).toUpperCase() + linkType.slice(1) + " Links";
        linksContainer.appendChild(linkTypeHeader);
        var list = document.createElement("ul");
        linkList.forEach(function (link) {
            var listItem = document.createElement("li");
            var anchor = document.createElement("a");
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
function handleCheckboxChange(event) {
    var checkbox = event.target;
    var checkboxId = checkbox.id;
    var isChecked = checkbox.checked;
    chrome.storage.sync.get("selectedTypes", function (result) {
        var selectedTypes = result.selectedTypes || [];
        if (isChecked && !selectedTypes.includes(checkboxId)) {
            selectedTypes.push(checkboxId);
        }
        else if (!isChecked && selectedTypes.includes(checkboxId)) {
            selectedTypes = selectedTypes.filter(function (type) { return type !== checkboxId; });
        }
        chrome.storage.sync.set({ selectedTypes: selectedTypes });
    });
}
// Initialize ui and event listeners
document.addEventListener("DOMContentLoaded", function () {
    // Initialize ui based on user preferences
    chrome.storage.sync.get("selectedTypes", function (result) {
        var selectedTypes = result.selectedTypes || ["images", "videos", "outside"];
        selectedTypes.forEach(function (type) {
            var checkbox = document.getElementById("$(type)-checkbox");
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    });
    // Add event listeners to checkbox changes
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("change", handleCheckboxChange);
    });
    // Add event listener for export button click
    var exportButton = document.getElementById("export-button");
    if (exportButton) {
        exportButton.addEventListener("click", handleExportButtonClick);
    }
    // Add event listener for random button click
    var randomButton = document.getElementById("random-button");
    if (randomButton) {
        randomButton.addEventListener("click", handleRandomButtonClick);
    }
    // Display collected links
    chrome.runtime.sendMessage({ action: "getLinks" }, function (response) {
        updateUI(response);
    });
});
