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
        console.log('Finding product details...')
        fetch(`http://127.0.0.1:5000/api/video_links/${videoId}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            console.log("Video links fetched from Flask:", data);
            const videoLinksContainer = document.getElementById('video-links-result');

            if (data.links && data.links.length > 0) {
                displayData(data.product_details, videoLinksContainer);
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
                const videoLinksContainer = document.getElementById('video-links-result');
                
                const loadingContainer = document.createElement('div');
                loadingContainer.classList.add('loading-container');
                
                const loadingImage = document.createElement('img');
                loadingImage.src = 'images/loading.gif';
                loadingImage.alt = 'Loading';
                loadingImage.classList.add('loading-image');

                const loadingText = document.createElement('p');
                loadingText.textContent = 'Finding product details...';
                loadingText.classList.add('loading-text');
                
                loadingContainer.appendChild(loadingImage);
                loadingContainer.appendChild(loadingText);
                
                
                videoLinksContainer.appendChild(loadingContainer);

                fetchVideoLinks(videoId);
            } else {
                console.error("No video id found in local storage");
                document.getElementById('video-links-result').innerHTML = '<p>No video ID found in local storage</p>';
            }
        });
    });
});

// function displayData(products, container) {
//     container.innerHTML = '';
//     for (const key in products) {
//         const product = products[key];
//         const productName = product.item;
//         const overallRating = product.overall_rating;
//         const materialRating = product.material_score;
//         const materials = Object.entries(product.materials).sort((a, b) => b[1] - a[1]);
//         const brand = product.site;
//         const brandRating = product.brand_rating;
//         const price = '$'.repeat(product.price_level);
//         const location = product.location;
//         const link = product.link;

//         const productDiv = document.createElement('div');
//         productDiv.classList.add('product');

//         productDiv.innerHTML = `
//             <p>Product: ${productName}</p>
//             <p>Overall Footprint Score: ${overallRating}/5</p>
//             <p>Material Rating: ${materialRating}/5</p>
//             <p>Materials:</p>
//             <ul>
//                 ${materials.map(([material, percentage]) => {
//                     const capitalizedMaterial = material.split(' ')
//                         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//                         .join(' ');
//                     return `<li>${percentage}% ${capitalizedMaterial}</li>`;
//                 }).join('')}
//             </ul>
//             <p>Brand: ${brand}</p>
//             <p>Brand Rating: ${brandRating}/5</p>
//             <p>Price Level: ${price}</p>
//             <p>Country of Origin: ${location}</p>
//             <p>Product Link: <a href="${link}" target="_blank">${link}</a></p>
//         `;

//         container.appendChild(productDiv);
//     }

//     console.log('Done :)');
// }

function displayData(products, container) {
    container.innerHTML = '';
    for (const key in products) {
        const product = products[key];
        const productName = product.item;
        const overallRating = product.overall_rating;
        const materialRating = product.material_score;
        const materials = Object.entries(product.materials).sort((a, b) => b[1] - a[1]);
        const brand = product.site;
        const brandRating = product.brand_rating;
        const price = '$'.repeat(product.price_level);
        const location = product.location;
        const link = product.link;

        const productDetails = `
            <p>Overall Footprint Score: ${overallRating}/5</p>
            <p>Material Rating: ${materialRating}/5</p>
            <p>Materials:</p>
            <ul>
                ${materials.map(([material, percentage]) => {
                    const capitalizedMaterial = material.split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    return `<li>${percentage}% ${capitalizedMaterial}</li>`;
                }).join('')}
            </ul>
            <p>Brand: ${brand}</p>
            <p>Brand Rating: ${brandRating}/5</p>
            <p>Price Level: ${price}</p>
            <p>Country of Origin: ${location}</p>
            <p>Product Link: <a href="${link}" target="_blank">${link}</a></p>
            <img src="images/1-5.png" class="h-8 w-8">
        `;

        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        productDiv.innerHTML = `
            <details>
                <summary>${productName}</summary>
                ${productDetails}
            </details>
        `;

        container.appendChild(productDiv);
    }
    console.log('Done :)');
}
