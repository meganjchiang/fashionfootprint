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

