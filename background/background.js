"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// Class for managing links
var BackgroundManager = /** @class */ (function () {
    function BackgroundManager() {
        this.videoLinks = [];
        this.imageLinks = [];
        this.outsideLinks = [];
    }
    // Function to update the extension UI
    BackgroundManager.prototype.updateUI = function () {
        // Send messahe to the UI (popup) with updated link lists
        chrome.runtime.sendMessage({
            action: "updateUI",
            videoLinks: this.videoLinks,
            imageLinks: this.imageLinks,
            outsideLinks: this.outsideLinks,
        });
    };
    // function to add a link of specific type
    BackgroundManager.prototype.addLink = function (link, linkType) {
        // add the new type to the appropiate list based on the link type
        switch (linkType) {
            case "video":
                this.videoLinks.push(link);
                break;
            case "image":
                this.imageLinks.push(link);
                break;
            case "outside":
                this.outsideLinks.push(link);
                break;
            default:
                break;
        }
        // Update the UI
        this.updateUI();
    };
    // Function to clear all link lists
    BackgroundManager.prototype.clearLinks = function () {
        this.videoLinks = [];
        this.imageLinks = [];
        this.outsideLinks = [];
    };
    // Function to randomly select a link
    BackgroundManager.prototype.selectRandomLink = function (linkType) {
        var links;
        switch (linkType) {
            case "video":
                links = this.videoLinks;
                break;
            case "image":
                links = this.imageLinks;
                break;
            case "outside":
                links = this.outsideLinks;
                break;
            default:
                return undefined;
        }
        var randomIndex = Math.floor(Math.random() * links.length);
        return links[randomIndex];
    };
    // Function to export links to a file
    BackgroundManager.prototype.exportToFile = function (filePath) {
        var data = {
            videoLinks: this.videoLinks,
            imageLinks: this.imageLinks,
            outsideLinks: outsideLinks
        };
        var jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData);
    };
    return BackgroundManager;
}());
// Create an instance of BackgroundManager
var backgroundManager = new BackgroundManager();
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "addLink") {
        // Add the link to the appropiate list
        backgroundManager.addLink(message.link, message.linkType);
    }
});
// Listen for extension installation or update events
chrome.runtime.onInstalled.addListener(function () {
    // Perform setup
    // Right now, clear all link lists
    backgroundManager.clearLinks();
});
// Listen for the extensions UI being opened
chrome.runtime.onConnect.addListener(function (port) {
    // when the ui connects, send the link lists to update the ui
    if (port.name === "popup") {
        backgroundManager.updateUI();
    }
});
