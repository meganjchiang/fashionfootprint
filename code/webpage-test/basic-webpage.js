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

        // basic table to display results
        var itemScoreTable = `
            <table>
                <tr>
                    <th>Item</th>
                    <th>Material Score</th>
                    <th>Overall Score</th>
                    <th>People Score</th>
                    <th>Planet Score</th>
                </tr>
        `;

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
                    // adds each item to table 
                    // MAKE LOOK BETTER
                    itemScoreTable += `
                        <tr>
                            <td>${item}</td>
                            <td>${materialScore}</td>
                            <td>${overallScore}</td>
                            <td>${peopleScore}</td>
                            <td>${planetScore}</td>
                        </tr>
                    `;
                }
            }
        }
        itemScoreTable += `</table>`;

        if (found) {
            resultDiv.innerHTML = itemScoreTable;
        } else {
            resultDiv.innerHTML = "Video link not found in the brandDataset.";
        }
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
    }
}
