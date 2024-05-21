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

// moved down
// window.location.href provides page's url (passed into fetchData)
// fetchData(window.location.href).then(matchingItems => {
//     console.log('Matching Items:', matchingItems);
//     if (matchingItems.length > 0) {
//         // send message to background.js to handle popup
//         chrome.runtime.sendMessage({action: "setPopup"});
//     }
// });

// function to fetch vid details from flask
async function fetchVideoDetails(videoId) {
    console.log('Fetching video details for ID:', videoId);
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Video details:', data);
        if (data.links) {
            console.log('Extracted links:', data.links);
        } else {
            console.error('No links found in the video description');
        }
    } catch (error) {
        console.error('Error fetching video description:', error);
    }
}

// function to extract video id from youtube url to use for youtube api scraping
function getVideoId(url) {
    // extracts serach part of url (starts with ?)
    const urlParams = new URLSearchParams(new URL(url).search);
    // 'v=' what precedes the video id in youtube urls
    return urlParams.get('v');
}

// get current url and extract video id from it
const videoLink = window.location.href;
const videoId = getVideoId(videoLink);
console.log('video_id:', videoId);


// store video id in local storage in chrome
chrome.storage.local.set({ 'videoId': videoId }, function() {
    console.log('Video id stored in local storage:', videoId);
    // fetch data from json based on youtube video url
    fetchData(videoLink).then(matchingItems => {
        console.log('Matching Items:', matchingItems);
        if (matchingItems.length > 0) {
            // send message to background.js to handle popup
            chrome.runtime.sendMessage({ action: "setPopup" });
        }

        // fetch video details from flas server
        fetchVideoDetails(videoId);
    });
});

// send request to flask server
// fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`)
//     // process response from flask - parse JSON response into JS object
//     .then(response => response.json())
//     // process data
//     .then(data => {
//         console.log('Video details:', data);
//         if (data.links) {
//             console.log('Extracted links:', data.links)
//         } else {
//             console.error('No links found in the video description');
//         }
//     })
//     .catch(error => console.error('Erorr fetching video description:', error));


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
