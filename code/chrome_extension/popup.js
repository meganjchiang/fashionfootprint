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

    document.addEventListener('click', evt => {
        const a = evt.target.closest('a[href]');
        if (a) {
          evt.preventDefault();
          chrome.tabs.create({url: a.href, active: false});
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


function displayData(products, container) {
    container.innerHTML = '';
    for (const key in products) {
        const product = products[key];
        const productName = product.item;
        const overallRating = product.overall_rating;
        const materialRating = product.material_score;
        const materials = Object.entries(product.materials).sort((a, b) => b[1] - a[1]);
        const higg_link = product.higg_link;
        const brand = product.site;
        const brandRating = product.brand_rating;
        const price = '$'.repeat(product.price_level);
        const location = product.location;
        const link = product.link;
        const goy_link = product.goy_link;

        let ratingImageSrc = 'images/1-5.png'; // default
        if (overallRating > 1.0 && overallRating <= 2.0) {
            ratingImageSrc = 'images/2-5.png';
        } else if (overallRating > 2.0 && overallRating <= 3.0) {
            ratingImageSrc = 'images/3-5.png';
        } else if (overallRating > 3.0 && overallRating <= 4.0) {
            ratingImageSrc = 'images/4-5.png';
        } else if (overallRating > 4.0 && overallRating <= 5.0) {
            ratingImageSrc = 'images/5-5.png';
        }

        const summaryHTML = `
            <div class="flex justify-between items-start space-x-2 cursor-pointer">
                <div class="w-8/12">
                    <div class="flex items-center space-x-1">
                        <a href="${link}" class="uppercase font-semibold text-sm underline product-name" target="_blank">${productName}</a>
                    </div>
                    <p class="uppercase text-xs mt-1">${brand}</p>
                </div>
                <div class="flex items-center space-x-4 align-middle">
                    <img src="${ratingImageSrc}" class="h-8 w-8">
                    <button class="toggle-details focus:outline-none">
                        <img src="images/downward-arrow.png" class="h-3 w-4">
                    </button>
                </div>
            </div>
        `;

        const detailsHTML = `
            <div class="details hidden">
                <p class="uppercase mt-4 text-xs mr-1">Overall Footprint Score: <span class="font-bold">${overallRating}/5</span></p>
                <div class="flex flex-row justify-between mt-1">
                    <div class="flex flex-col flex-1 pr-4 w-full">
                        <div>
                            <a href="${higg_link}" class="uppercase underline font-semibold text-xs mr-0.5" target="_blank">Material Rating:</a>
                            <span class="font-bold text-xs">${materialRating}/5</span>
                        </div>
                        <div class="mt-1">
                            <p class="uppercase text-xs">Materials</p>
                            <ul class="list-disc list-inside text-xs">
                                ${materials.map(([material, percentage]) => {
                                    const capitalizedMaterial = material.split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ');
                                    return `<li>${percentage}% ${capitalizedMaterial}</li>`;
                                }).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="flex flex-col">
                        <div class="flex items-center">
                            <a href="${goy_link}" class="uppercase underline font-semibold text-xs mr-0.5" target="_blank">Brand Rating:</a>
                            <span class="font-bold text-xs">${brandRating}/5</span>
                        </div>
                        <div class="mt-1">
                            <p class="uppercase text-xs">${brand}</p>
                            <ul class="list-disc list-inside text-xs">
                                <li class="text-xs">Price Level: ${price}</li>
                                <li class="text-xs">Country: ${location}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const productDiv = document.createElement('div');
        productDiv.classList.add('bg-white', 'p-2', 'shadow-md', 'mb-3', 'mx-3');
        productDiv.innerHTML = summaryHTML + detailsHTML;
        productDiv.addEventListener('click', function(e) {
            if (!e.target.closest('a')) {
                const detailsDiv = productDiv.querySelector('.details');
                detailsDiv.classList.toggle('hidden');
                const arrow = productDiv.querySelector('.toggle-details img');
                if (detailsDiv.classList.contains('hidden')) {
                    arrow.src = 'images/downward-arrow.png';
                } else {
                    arrow.src = 'images/upward-arrow.png';
                }
            }
        });
        // const toggleButton = productDiv.querySelector('.toggle-details');
        // const detailsDiv = productDiv.querySelector('.details');

        // toggleButton.addEventListener('click', function() {
        //     detailsDiv.classList.toggle('hidden');
        //     const arrow = toggleButton.querySelector('img');
        //     if (detailsDiv.classList.contains('hidden')) {
        //         arrow.src = 'images/downward-arrow.png';
        //     } else {
        //         arrow.src = 'images/upward-arrow.png';
        //     }
        // });

        container.appendChild(productDiv);
    }
    console.log('Done :)');
}



// function displayData(products, container) {
//     container.innerHTML = '';
//     for (const key in products) {
//         const product = products[key];
//         const productName = product.item;
//         const overallRating = product.overall_rating;
//         const materialRating = product.material_score;
//         const materials = Object.entries(product.materials).sort((a, b) => b[1] - a[1]);
//         const higg_link = product.higg_link;
//         const brand = product.site;
//         const brandRating = product.brand_rating;
//         const price = '$'.repeat(product.price_level);
//         const location = product.location;
//         const link = product.link;
//         const goy_link = product.goy_link;

//         let ratingImageSrc = 'images/1-5.png'; // default
//         if (overallRating > 1.0 && overallRating <= 2.0) {
//             ratingImageSrc = 'images/2-5.png';
//         } else if (overallRating > 2.0 && overallRating <= 3.0) {
//             ratingImageSrc = 'images/3-5.png';
//         } else if (overallRating > 3.0 && overallRating <= 4.0) {
//             ratingImageSrc = 'images/4-5.png';
//         } else if (overallRating > 4.0 && overallRating <= 5.0) {
//             ratingImageSrc = 'images/5-5.png';
//         }

//         const productDetails = `
//             <p>Overall Footprint Score: ${overallRating}/5</p>
//             <p><a href="${higg_link}" target="_blank">Material Rating</a>: ${materialRating}/5</p>
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
//             ${goy_link ? `<p><a href="${goy_link}" target="_blank">Brand Rating</a>: ${brandRating}/5</p>` : `<p>Brand Rating: ${brandRating}/5</p>`}
//             <p>Price Level: ${price}</p>
//             <p>Country of Origin: ${location}</p>
//             <p>Product Link: <a href="${link}" target="_blank">${link}</a></p>
//             <img src="${ratingImageSrc}" class="h-8 w-8">
//         `;

//         const productDiv = document.createElement('div');
//         productDiv.classList.add('product');

//         productDiv.innerHTML = `
//             <details>
//                 <summary>${productName}</summary>
//                 ${productDetails}
//             </details>
//         `;

//         container.appendChild(productDiv);
//     }
//     console.log('Done :)');
// }
