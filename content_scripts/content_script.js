// Function to send a messsage to the background script
function sendMessageToBackground(action, link, linkType) {
    chrome.runtime.sendMessage({ action: action, link: link, linkType: linkType });
}
// Function to detect and send images to the background script
function detectImages() {
    var images = document.querySelectorAll('img');
    images.forEach(function (image) {
        var link = image.src;
        sendMessageToBackground("addLink", link, "image");
    });
}
// Function to detect and send videos to the background script
function detectVideos() {
    var videos = document.querySelectorAll('video');
    videos.forEach(function (video) {
        var link = video.src;
        sendMessageToBackground("addLink", link, "video");
    });
}
// Function to detect and send outside links to the background script
function detectOutsideLinks() {
    var links = document.querySelectorAll('a');
    links.forEach(function (link) {
        var href = link.href;
        sendMessageToBackground("addLink", href, "outside");
    });
}
// Function to get the user preferences from storage
function getUserPreferences() {
    return new Promise(function (resolve) {
        chrome.storage.sync.get("selectedTypes", function (result) {
            var selectTypes = result.selectedTypes || ["images", "videos", "outside"];
            resolve(selectTypes);
        });
    });
}
// Call functions to detect and send selected links based on user preferences
getUserPreferences().then(function (selectedTypes) {
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
