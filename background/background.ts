import * as fs from 'fs';
import { json } from 'stream/consumers';

// Define the types for message passing
interface LinkMessage {
    action: string;
    link: string;
    linkType: string;
}

// Define types for exported data
interface ExportedData {
    videoLinks: string[];
    imageLinks: string[];
    outsideLinks: string[];
}

// Class for managing links
class BackgroundManager {
    private videoLinks: string[] = [];
    private imageLinks: string[] = [];
    private outsideLinks: string[] = [];

    // Function to update the extension UI
    public updateUI() {
        // Send messahe to the UI (popup) with updated link lists
        chrome.runtime.sendMessage({ action: "updateUI", videoLinks: this.videoLinks, imageLinks: this.imageLinks, this.outsideLinks: this.outsideLinks });
    }

    // function to add a link of specific type
    public addLink(link: string, linkType: string) {
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
    }

    // Function to clear all link lists
    public clearLinks() {
        this.videoLinks = [];
        this.imageLinks = [];
        this.outsideLinks = [];
    }

    // Function to randomly select a link
    public selectRandomLink(linkType: string): string | undefined {
        let links: string[];
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
        const randomIndex = Math.floor(Math.random() * links.length);
        return links[randomIndex];
    }

    // Function to export links to a file
    public exportToFile(filePath: string) {
        const data: ExportedData = {
            videoLinks: this.videoLinks,
            imageLinks: this.imageLinks,
            outsideLinks = this.imageLinks
        };
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData);
    }
}

// Create an instance of BackgroundManager
const backgroundManager = new BackgroundManager();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message: LinkMessage, sender, sendResponse) => {
    if (message.action === "addLink") {
        // Add the link to the appropiate list
        backgroundManager.addLink(message.link, message.linkType);
    }
});

// Listen for extension installation or update events
chrome.runtime.onInstalled.addListener(() => {
    // Perform setup
    // Right now, clear all link lists
    backgroundManager.clearLinks();
});

// Listen for the extensions UI being opened
chrome.runtime.onConnect.addListener((port) => {
    // when the ui connects, send the link lists to update the ui
    if (port.name === "popup") {
        backgroundManager.updateUI();
    }
})