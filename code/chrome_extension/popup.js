// triggers next function after html page loaded and calls popup.js
document.addEventListener('DOMContentLoaded', function() {
    // retrieves data from Chrome's local storage (from content.js) 
    chrome.storage.local.get('data', function(result) {
        const itemsContainer = document.getElementById('result');
        if (result.data && result.data.length > 0) {
            let row = null; // holds row element
            result.data.forEach((item, index) => {
                // new row for every two items
                if (index % 2 === 0) {
                    row = document.createElement('div');
                    row.className = 'flex justify-center mt-2';
                    itemsContainer.appendChild(row);
                }

                // create box for item name and score
                const itemElement = document.createElement('div');
                itemElement.className = 'score-box';
                itemElement.innerHTML = `<div class="item-name">${item.item_name}</div> 
                                        <div class="score">Avg Score: ${item.avg_score}</div>`;
            
                row.appendChild(itemElement);
            });
        } else {
            itemsContainer.innerHTML = '<p>No items found with this link :(</p>';
        }
    });
});