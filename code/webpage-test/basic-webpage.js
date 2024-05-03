async function findScores() {
    // retrieves inputted vid link from input field
    const videoLink = document.getElementById("videoLinkInput").value;
    try {
        // gets data from brand json file
        const response = await fetch('small_aritzia_scores.json');

        // parse json into js object
        const jsonData = await response.json();

        // filters jsonData to find items that match video_link inputted by user
        const matchingItems = jsonData.filter(item => item.video_link === videoLink);

        var itemsContainer = '';
        matchingItems.forEach((item, index) => {
            // if index is even, start new row (2 boxes per row)
            if (index % 2 === 0) { 
                // new div
                itemsContainer += `<div class="flex justify-center mt-2">`; 
            }

            // box with item_name and avg_score
            itemsContainer += `
                <div class="score-box">
                    <div class="item-name">${item.item_name}</div>
                    <div class="score">Avg Score: ${item.avg_score}</div>
                </div>
            `;

            // if odd index or last index in list, indicates end of row
            if (index % 2 === 1 || index === matchingItems.length - 1) {
                itemsContainer += `</div>`;
            }
        });
        // sets innerHTML of 'result' to itemsContainer and displays it
        document.getElementById("result").innerHTML = itemsContainer;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}
