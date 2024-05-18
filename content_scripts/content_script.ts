// Define types for message passing
interface LinkMessage {
    action: string;
    link: string;
    linkType: string;
}

// Function to send a messsage to the background script
function sendMessageToBackground(action: string, link: string, linkType: string) {
    chrome.runtime.sendMessage({ action, link, linkType });
}

// Function to detect and send images to the background script
function detectImages() {
    const images = document.querySelectorAll('img');
    images.forEach((image: HTMLImageElement) => {
        const link = image.src;
        sendMessageToBackground("addLink", link, "image");
    });
}

// Function to detect and send videos to the background script
function detectVideos() {
    const videos = document.querySelectorAll('video');
    videos.forEach((video: HTMLVideoElement) => {
        const link = video.src;
        sendMessageToBackground("addLink", link, "video");
    });
}

// Function to detect and send outside links to the background script
function detectOutsideLinks() {
    const links = document.querySelectorAll('a');
    links.forEach((link: HTMLAnchorElement) => {
        const href = link.href;
        sendMessageToBackground("addLink", href, "outside");
    });
}

// Function to get the user preferences from storage
function getUserPreferences(): Promise<string[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get("selectedTypes", (result) => {
            const selectTypes: string[] = result.selectedTypes || ["images", "videos", "outside"];
            resolve(selectTypes);
        });
    });
}

// Call functions to detect and send selected links based on user preferences
getUserPreferences().then((selectedTypes) => {
    if (selectedTypes.includes("images")) {
        detectImages();
    }
    if (selectedTypes.includes("videos")) {
        detectVideos();
    }
    if (selectedTypes.includes("outside")) {
        detectOutsideLinks();
    }
});