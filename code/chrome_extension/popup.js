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

    // Function to update the video ID in the popup HTML
    // function updateVideoId(videoId) {
    //     const videoIdElement = document.getElementById('video-id');
    //     if (videoIdElement) {
    //         videoIdElement.innerText = `Video ID: ${videoId}`;
    //     }
    // }

    // event listener for messages from the background script
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.videoId) {
            // Update the UI with the new video ID
            const videoId = message.videoId;
            
            // console.log("Received new video ID in popup:", videoId);
            // updateVideoId(videoId);

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

    // // get brand ratings from brand_ratings_only.JSON
    // fetch(chrome.runtime.getURL('data/brand_ratings_only.JSON'))
    // .then(response => response.json())
    // .then(ratingsData => {
    //     const brandName = 'sezane'

    //     // find the rating for the brand 'Shein' (case-insensitive)
    //     const brandRating = ratingsData.find(rating => rating.brand.toLowerCase() === brandName);

    //     // if a rating is found, display rating on extension
    //     if (brandRating) {
    //         console.log(`Brand: ${brandRating.brand}`);
    //         console.log(`Brand Rating: ${brandRating.avg_brand_rating}/5`);
    //         console.log(`Price: ${brandRating.price_level}`);
    //         console.log(`Country of Origin: ${brandRating.location}`);
        
    //         // Create and append elements for each piece of information
    //         const brandElement = document.createElement('div');
    //         brandElement.innerText = `Brand: ${brandRating.brand}`;
    //         container.appendChild(brandElement);

    //         // Check if the rating has no decimal part
    //         let ratingValue;
    //         if (brandRating.avg_brand_rating % 1 === 0) {
    //             ratingValue = Math.round(brandRating.avg_brand_rating);
    //         } else {
    //             ratingValue = brandRating.avg_brand_rating;
    //         }

    //         const ratingElement = document.createElement('div');
    //         ratingElement.innerText = `Brand Rating: ${brandRating.avg_brand_rating}/5`;
    //         container.appendChild(ratingElement);

    //         const priceLevelElement = document.createElement('div');
    //         priceLevelElement.innerText = `Price: ${'$'.repeat(Math.round(brandRating.price_level))}`;
    //         container.appendChild(priceLevelElement);
        
    //         const locationElement = document.createElement('div');
    //         locationElement.innerText = `Country of Origin: ${brandRating.location}`;
    //         container.appendChild(locationElement);
    //     } else {
    //         console.log(`No rating found for ${brand_name}`);
    //     }
    // })
    // .catch(error => console.error('Error fetching brand ratings:', error));

    // start of working code

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

    // end of working code

    // data.forEach((item, index) => {
    //     console.log("item", item);
    
    //     // Fetch the webpage content
    //     fetch(item)
    //     .then(response => response.text())
    //     .then(html => {
    //         // Create a temporary div element to parse the HTML content
    //         const tempDiv = document.createElement('div');
    //         tempDiv.innerHTML = html;
    
    //         // Find the meta tag with property 'og:site_name' and get the content
    //         const metaTag = tempDiv.querySelector('meta[property="og:site_name"]');
    //         const brandName = metaTag ? metaTag.getAttribute('content') : null;
    
    //         // Display the brand name if found
    //         if (brandName) {
    //             console.log(`Brand: ${brandName}`);
    
    //             // Create and append elements for each piece of information
    //             const brandElement = document.createElement('div');
    //             brandElement.innerText = `Brand: ${brandName}`;
    //             container.appendChild(brandElement);
    
    //             // You can fetch brand ratings based on this brand name and display them as well
    //         } else {
    //             console.log('No brand name found in meta tags');
    //         }
    //     })
    //     .catch(error => console.error('Error fetching webpage content:', item));
    // });
}    