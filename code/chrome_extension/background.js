// adds event listener that is triggered each time new tab/page is opened
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // check if undefined when called
    console.log('Scripting API:', chrome.scripting); 
    if (changeInfo.status == 'complete' && tab.url && tab.url.includes('youtube.com/watch')) {
        try {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });
            console.log("YouTube video page loaded!");
        } catch (error) {
            console.error('Error executing script:', error);
        }
    } 
});