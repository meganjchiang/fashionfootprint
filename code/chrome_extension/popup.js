// triggers next function after html page loaded and calls popup.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup script loaded");

    // retrieves data from Chrome's local storage (from content.js) 
    // chrome.storage.local.get('filteredData', function(result) { 
    //     console.log("Retrieved filtered data from local storage:", result);
    //     const itemsContainer = document.getElementById('result');

    //     if (result.filteredData && result.filteredData.length > 0) {
    //         let row = null; // holds row element
    //         result.filteredData.forEach((item, index) => {
    //             console.log("item", item);
    //             // new row for every two items
    //             if (index % 2 === 0) {
    //                 row = document.createElement('div');
    //                 row.className = 'flex justify-center mt-2';
    //                 itemsContainer.appendChild(row);
    //             }

    //             // create box for item name and score
    //             const itemElement = document.createElement('div');
    //             itemElement.className = 'score-box';
    //             itemElement.innerHTML = `<div class="item-name">${item.item_name}</div> 
    //                                     <div class="score">Avg Score: ${item.avg_score}</div>`;
            
    //             row.appendChild(itemElement);
    //         });
    //     } else {
    //         itemsContainer.innerHTML = '<p>No items found with this link :(</p>';
    //     }
    // });

    document.getElementById('fetch-backend-data').addEventListener('click', function() {
        fetch('http://127.0.0.1:5000/api/data', {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log("Data fetched from Flask backend:", data);
            const backendDataContainer = document.getElementById('backend-result');
            if (data && data.length > 0) {
                displayData(data, backendDataContainer);
            } else {
                backendDataContainer.innerHTML = '<p>No data retrieved from backend :(</p>';
            }
        })
        .catch(error => console.error('Error fetching data from backend:', error));
    });

    document.getElementById('fetch-video-links').addEventListener('click', function() {
        chrome.storage.local.get('videoId', function(result) {
            console.log("Retrieved video id from local storage:", result.videoId);
            const videoId = result.videoId;
            if (videoId) {
                fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`, {
                    method: 'GET'
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Video links fetched from flask:", data);
                    const videoLinksContainer = document.getElementById('video-links-result');
                    if (data.links && data.links.length > 0) {
                        // videoLinksContainer.innerHTML = youtube_data.links.map(link => `<div>${link}</div>`).join('');
                        displayData(data, videoLinksContainer);
                    } else {
                        videoLinksContainer.innerHTML = '<p>No links found for this video :(</p>';
                    }
                })
                .catch(error => console.error("Error fetching video links:", error));
            } else {
                console.error("No video id found in local storage");
                document.getElementById('video-links-result').innerHTML = '<p>No video ID found in local storage</p>';
            }
        });
    });
});

function displayData(data, container) {
    container.innerHTML = '';
    let row = null;
    data.forEach((item, index) => {
        console.log("item", item);
    })
}
