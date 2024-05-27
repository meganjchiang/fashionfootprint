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
        fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log("Video links fetched from Flask:", data);
            const videoLinksContainer = document.getElementById('video-links-result');
            
            data.materials.forEach((item, index) => {
                console.log("materials", item);
            })

            if (data.links && data.links.length > 0) {
                displayData(data.links, videoLinksContainer);
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

function displayData(data, container) {
    container.innerHTML = '';
    let row = null;

    data.forEach((item, index) => {
        console.log("item", item);

        // get brand ratings from brand_ratings_only.JSON
        fetch(chrome.runtime.getURL('data/brand_ratings_only.JSON'))
        .then(response => response.json())
        .then(ratingsData => {
            const brandName = 'aritzia'

            // find the rating for the brand 'Shein' (case-insensitive)
            const brandRating = ratingsData.find(rating => rating.brand.toLowerCase() === brandName);

            // if a rating is found, display rating on extension
            if (brandRating) {
                console.log(`Brand: ${brandRating.brand}`);
                console.log(`Brand Rating: ${brandRating.avg_brand_rating}/5`);
                console.log(`Price: ${brandRating.price_level}`);
                console.log(`Country of Origin: ${brandRating.location}`);
            
                // Create and append elements for each piece of information
                const brandElement = document.createElement('div');
                brandElement.innerText = `Brand: ${brandRating.brand}`;
                container.appendChild(brandElement);

                const ratingElement = document.createElement('div');
                ratingElement.innerText = `Brand Rating: ${brandRating.avg_brand_rating}/5`;
                container.appendChild(ratingElement);

                const priceLevelElement = document.createElement('div');
                priceLevelElement.innerText = `Price: ${'$'.repeat(brandRating.price_level)}`;
                container.appendChild(priceLevelElement);
            
                const locationElement = document.createElement('div');
                locationElement.innerText = `Country of Origin: ${brandRating.location}`;
                container.appendChild(locationElement);

                const productLinkElement = document.createElement('a');
                productLinkElement.innerText = `Link to Product`;
                productLinkElement.href = item; // Set the link
                productLinkElement.target = "_blank"; // Open link in new tab
                productLinkElement.style.color = "blue"; // Set the default color
                productLinkElement.style.textDecoration = "none"; // Remove underline
                productLinkElement.addEventListener("mouseover", () => {
                    productLinkElement.style.color = "red"; // Change color on hover
                });
                productLinkElement.addEventListener("mouseout", () => {
                    productLinkElement.style.color = "blue";
                });
                container.appendChild(productLinkElement);

                const spaceElement = document.createElement('div');
                spaceElement.style.marginBottom = '20px';
                container.appendChild(spaceElement);
            } else {
                console.log(`No rating found for ${brand_name}`);
            }
        })
        .catch(error => console.error('Error fetching brand ratings:', error));
    })
}    