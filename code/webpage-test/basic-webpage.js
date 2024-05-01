async function findScores() {
    // retrieves inputted vid link from input field
    var videoLink = document.getElementById("videoLinkInput").value;

    try {
        // get data from brand json file
        var response = await fetch('uniqlo-data.json');
        var brandDataset = await response.json();
        
        // retrieves reference to result element (from html)
        var resultDiv = document.getElementById("result");
        // if link is found...
        var found = false;

        var itemsContainer = '';

        for (var i=0; i < brandDataset.length; i++) {
            // finds matching video link in brand dataset
            // find more efficient way of doing this later...
            if (brandDataset[i].VideoLink === videoLink) {
                found = true;
                // retrieves links to items in the vid's description
                var items = brandDataset[i].Links;
                // retrieves item name and scores
                for (var j=0; j < items.length; j++) {
                    var item = items[j].ScrapedData.item;
                    var materialScore = items[j].MaterialScore;
                    var overallScore = items[j].overall_score;
                    var peopleScore = items[j].people_score;
                    var planetScore = items[j].planet_score;
                    
                    itemsContainer += `
                        <div class="score-box">
                            <div class="item-name">${item}</div>
                            <div class="score">Material Score: ${materialScore}</div>
                            <div class="score">Overall Score: ${overallScore}</div>
                            <div class="score">People Score: ${peopleScore}</div>
                            <div class="score">Planet Score: ${planetScore}</div>
                        </div>
                    `;
                }
            }
        }

        if (found) {
            resultDiv.innerHTML = itemsContainer;
        } else {
            resultDiv.innerHTML = "Video link not found in the brandDataset.";
        }
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}
