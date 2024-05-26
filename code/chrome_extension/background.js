// adds event listener that is triggered each time new tab/page is opened
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     // check if undefined when called
//     console.log('Scripting API:', chrome.scripting); 
//     if (changeInfo.status == 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
//         try {
//             chrome.scripting.executeScript({
//                 target: { tabId: tab.id },
//                 files: ['content.js']
//             });
//             console.log("YouTube video page loaded!");
//         } catch (error) {
//             console.error('Error executing script:', error);
//         }
//     } 
// });
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "setPopup") {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs.length > 0) {
                chrome.action.setPopup({tabId: tabs[0].id, popup: 'popup.html'}, function() {
                    if (chrome.runtime.lastError) {
                        console.error('Error setting popup:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Popup set successfully');
                    }
                });
            } else {
                console.error('No active tabs found');
            }
        });
    }
});

// Event listener for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        // Check if the updated URL is a YouTube video URL
        if (isYouTubeVideo(changeInfo.url)) {
            // Extract the video ID from the URL
            const videoId = extractYouTubeVideoId(changeInfo.url);
            // console.log("YouTube video ID:", videoId);
            
            // Send a message to the popup script
            chrome.runtime.sendMessage({ videoId: videoId });
        }
    }
});

// Function to check if a URL is a YouTube video URL
function isYouTubeVideo(url) {
    return /^https?:\/\/(?:www\.)?youtube.com\/watch\?(?=.*v=\w+)/.test(url);
}

// Function to extract the video ID from a YouTube video URL
function extractYouTubeVideoId(url) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
}