let data;
let sample;
let rawSample;
let currentWeights;
fetch('https://raw.githack.com/zweitstimme-org/byop/main/sample_data.json')
    .then((res) => res.json())
    .then(d => data = d)
    .then(() => {

        const sizeSelector = document.getElementById('sampleSize');
        const redrawButton = document.getElementById("redraw");
        const resetButton = document.getElementById("reset");

        const ageCheckbox = document.getElementById("age");
        const sexCheckbox = document.getElementById("sex");
        const voteCheckbox = document.getElementById("vote");

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

        // https://www.media-analyse.at/Signifikanz
        function errorTerm(absItem, sampleSize) {
            absItem = Number(absItem);
            sampleSize = Number(sampleSize);    
            const percentItem = (absItem/sampleSize).toFixed(2);
            const err = 1.96*Math.sqrt((percentItem*(1-percentItem))/sampleSize)
            return err*100; // conversion for correct display in plotly
        }

        function updateBarChart(votes) {
            Plotly.newPlot("holder", // elem
                [
                    {
                        x: ["CDU/CSU", "SPD", "AfD", "Grüne", "FDP", "Linke", "Sonstige"], // labels
                        y: [ // values,
                            Math.round((votes["CDU/CSU"]/sizeSelector.value)*100),
                            Math.round((votes["SPD"]/sizeSelector.value)*100),
                            Math.round((votes["Afd"]/sizeSelector.value)*100),
                            Math.round((votes["B90"]/sizeSelector.value)*100),
                            Math.round((votes["FDP"]/sizeSelector.value)*100),
                            Math.round((votes["LINKE"]/sizeSelector.value)*100),
                            Math.round((votes["sonstige"]/sizeSelector.value)*100)
                        ], 
                        error_y: { // error bars
                            type: 'data',
                            array: [
                                errorTerm(votes["CDU/CSU"],sizeSelector.value),
                                errorTerm(votes["SPD"],sizeSelector.value),
                                errorTerm(votes["Afd"],sizeSelector.value),
                                errorTerm(votes["B90"],sizeSelector.value),
                                errorTerm(votes["FDP"],sizeSelector.value),
                                errorTerm(votes["LINKE"],sizeSelector.value),
                                errorTerm(votes["sonstige"],sizeSelector.value)
                            ],
                            visible: true
                          },
                        type: "bar"
                    }
                ], // data
                { "width": 500, "height": 350}, // layout
                {displayModeBar: false}) // config
        
        };

        function updateWeights() {
            debugger;
            const parties = ["CDU/CSU", "SPD", "Afd", "B90", "FDP", "LINKE", "sonstige"];

            const byAge = ageCheckbox.checked;
            const bySex = sexCheckbox.checked;
            const byPastVote = voteCheckbox.checked;

            if (!byAge && !bySex && !byPastVote) return updateBarChart(aggregateVotes(rawSample));

            const womenShareGoal = 0.52;
            const menShareGoal = 1-womenShareGoal;

            const menShareActual = Number(rawSample.filter(item => item[1] == "m").length / rawSample.length).toFixed(2)
            const womenShareActual = 1 - menShareActual;

            const womenWeightingFactor = womenShareGoal/womenShareActual;
            const menWeightingFactor = menShareGoal/menShareActual;

            let votesByGender = rawSample.reduce((acc, item) => {
                const vote = item[2];
                const sex = item[1];
                if (acc[vote]){
                    if (acc[vote][sex]) acc[vote][sex] += 1;
                    else acc[vote][sex] = 1
                }
                else {
                    acc[vote] = {}
                    acc[vote][sex] = 1
                };
                return acc;
            }, {})
            
            const votes = {};
            for (party of parties){
                votes[party] = Math.round(votesByGender[party]["m"] * menWeightingFactor + votesByGender[party]["f"] * womenWeightingFactor);
            }

            updateBarChart(votes);
        }

        function redraw() {
            const sample = drawSample();
            rawSample = sample;
            const votes = aggregateVotes(rawSample);
            updateBarChart(votes);
        }


        sizeSelector.addEventListener("input", redraw);
        redrawButton.addEventListener("click", redraw);
        resetButton.addEventListener("click", reset);

        ageCheckbox.addEventListener("change", updateWeights)
        sexCheckbox.addEventListener("change", updateWeights)
        voteCheckbox.addEventListener("change", updateWeights)
    });