//  fetches data based on YouTube video url from json file
async function fetchData(videoLink) {
    const url = chrome.runtime.getURL('data/small_aritzia_scores.json');
    console.log('Fetching from:', url); 
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const jsonData = await response.json();
        console.log('Data:', jsonData); 
        console.log('YouTube Link:', videoLink);
        const filteredData = jsonData.filter(item => item.video_link === videoLink);
        // store filtered data in local Chrome storage
        chrome.storage.local.set({ 'filteredData': filteredData }, function() {
            console.log('Filtered data stored in local storage');
        });
        return filteredData;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return [];
    }
}

// window.location.href provides page's url (passed into fetchData)
fetchData(window.location.href).then(matchingItems => {
    console.log('Matching Items:', matchingItems);
    if (matchingItems.length > 0) {
        // send message to background.js to handle popup
        chrome.runtime.sendMessage({action: "setPopup"});
    }
});
// fetchData(window.location.href).then(matchingItems => {
//     console.log('Matching Items:', matchingItems); 
//     if (matchingItems.length > 0) {
//         // Get the active tab
//         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//             if (tabs.length > 0) {
//                 const tabId = tabs[0].id;
//                 // Set popup for the active tab
//                 chrome.action.setPopup({ tabId: tabId, popup: 'popup.html' }, () => {
//                     if (chrome.runtime.lastError) {
//                         console.error('Error setting popup:', chrome.runtime.lastError);
//                     } else {
//                         console.log('Popup set successfully');
//                     }
//                 });
//             } else {
//                 console.error('No active tab found');
//             }
//         });
//     }
// });
