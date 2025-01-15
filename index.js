let data;
let chart;
fetch('https://raw.githack.com/zweitstimme-org/byop/main/sample_data.json')
    .then((res) => res.json())
    .then(d => data = d)
    .then(() => {
        const ctx = document.getElementById('myChart');
        const sizeSelector = document.getElementById('sampleSize');
        const redrawButton = document.getElementById("redraw");

        function drawSample() {
            const sampleSize = sizeSelector.value;
            return shuffled = data.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
        }

        function aggregateVotes(sample) {
            const votes = sample.map(item => item[2]);
            const votesByParty = votes.reduce((acc, vote) => {
                if (acc[vote]) acc[vote] += 1;
                else acc[vote] = 1;
                return acc;
            }, {})
            return votesByParty;
        }

        function updateBarChart(votes) {
            Plotly.newPlot("holder", // elem
                [
                    {
                        "x": ["CDU/CSU", "SPD", "AfD", "Grüne", "FDP", "Linke", "Sonstige"], // labels
                        "y": [
                            votes["CDU/CSU"],
                            votes["SPD"],
                            votes["Afd"],
                            votes["B90"],
                            votes["FDP"],
                            votes["LINKE"],
                            votes["sonstige"]
                        ], // values
                        "type": "bar"
                    }
                ], // data
                { "width": 500, "height": 350}, // layout
                {displayModeBar: false}) // config
        
        };

        function redraw() {
            const sample = drawSample();
            const votes = aggregateVotes(sample);
            updateBarChart(votes);
        }

        sizeSelector.addEventListener("input", redraw);
        redrawButton.addEventListener("click", redraw);
        redraw();
    });