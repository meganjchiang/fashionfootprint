// triggers next function after html page loaded and calls popup.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Popup script loaded");

    // event listener for messages from the background script
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.videoId) {
            // Update the UI with the new video ID
            const videoId = message.videoId;
        
            // Fetch video links when the video ID is updated
            fetchVideoLinks(videoId);
        }
    });

    // fetch video links from the backend
    function fetchVideoLinks(videoId) {
        console.log('Loading :)')
        fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log("Video links fetched from Flask:", data);
            const videoLinksContainer = document.getElementById('video-links-result');

            if (data.links && data.links.length > 0) {
                // displayData(data.links, videoLinksContainer);
                displayData(data.product_details);
            } else {
                videoLinksContainer.innerHTML = '<p>No links found for this video :(</p>';
            }
        })
        .catch(error => console.error("Error fetching video links:", error));
    }

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
                fetchVideoLinks(videoId);
            } else {
                console.error("No video id found in local storage");
                document.getElementById('video-links-result').innerHTML = '<p>No video ID found in local storage</p>';
            }
        });
    });
});

// function displayData(data, container) {
function displayData(products) {
    for (const key in products) {
        // print blank line in console
        console.log('\u200B');

        const product = products[key];

        console.log(`Product: ${product.item}`);
        console.log(`Overall Footprint Score: ${product.overall_rating}/5`);

        console.log(`Material Rating: ${product.material_score}/5`);
        console.log('Materials:');
        
        const sortedMaterials = Object.entries(product.materials).sort((a, b) => b[1] - a[1]);

        for (const [material, percentage] of sortedMaterials) {
            // make each first letter uppercase
            const capitalizedMaterial = material.split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
            console.log(`   ${percentage}% ${capitalizedMaterial}`);
        }
        
        console.log(`Brand: ${product.site}`);
        console.log(`Brand Rating: ${product.brand_rating}/5`);
        console.log(`Price Level: ${'$'.repeat(product.price_level)}`);
        console.log(`Country of Origin: ${product.location}`);
        
        console.log(`Product Link: ${product.link}`);
    }
}    