let data;
let sample;
let rawSample;
let currentWeights;
fetch('https://raw.githack.com/zweitstimme-org/byop/main/sample_data.json')
    .then((res) => res.json())
    .then(d => data = d)
    .then(() => {

        const redrawButton = document.getElementById("redraw");
        const resetButton = document.getElementById("reset");

        /* SAMPLE SIZE */
        const fh_radio = document.getElementById("500")
        const ot_radio = document.getElementById("1000")
        const th_radio = document.getElementById("10000")
        
        let SAMPLE_SIZE
        function updateSampleSize() {
            if (fh_radio.checked) SAMPLE_SIZE = 500;
            if (ot_radio.checked) SAMPLE_SIZE = 1000;
            if (th_radio.checked) SAMPLE_SIZE = 10000;
        }
        updateSampleSize();

        /* SAMPLE TYPE */
        const telephoneSample = document.getElementById("tel")
        const socialMediaSample = document.getElementById("socialMedia")
        const onlineSample = document.getElementById("online")

        /* WEIGHTING */
        const ageCheckbox = document.getElementById("age");
        const sexCheckbox = document.getElementById("sex");
        const voteCheckbox = document.getElementById("vote");

        /* PARTY BIAS */
        const partyChooser = document.getElementById("partyBias");
        const biasSlider = document.getElementById("partyAdaptionValue");
        
        function drawSample() {
            debugger;
            shuffled = data.sort(() => 0.5 - Math.random());

            const telephone = telephoneSample.checked;
            const socialMedia = socialMediaSample.checked;
            const online = onlineSample.checked;

            let sample;
            if (telephone) sample = shuffled.filter(i => i[5] === "1") 
            if (socialMedia) sample = shuffled.filter(i => i[3] === "1")
            if (online) sample = shuffled.filter(i => i[4] === "1")

            rawSample = sample.slice(0, SAMPLE_SIZE)
            return rawSample;
        }

        function aggregateVotes(sample) {
            const votes = sample.map(item => item[6]);
            const votesByParty = votes.reduce((acc, vote) => {
                if (acc[vote]) acc[vote] += 1;
                else acc[vote] = 1;
                return acc;
            }, {})
            return votesByParty;
        }

        // https://www.media-analyse.at/Signifikanz
        function errorTerm(absItem) {
            absItem = Number(absItem);
            const percentItem = (absItem/SAMPLE_SIZE).toFixed(2);
            const err = 1.96*Math.sqrt((percentItem*(1-percentItem))/SAMPLE_SIZE)
            return err*100; // conversion for correct display in plotly
        }

        function updateBarChart(votes) {
            Plotly.newPlot("holder", // elem
                [
                    {
                        x: ["CDU/CSU", "SPD", "AfD", "Grüne", "FDP", "Linke", "BSW", "Sonstige"], // labels
                        y: [ // values,
                            Math.round((votes["CDU/CSU"]/SAMPLE_SIZE)*100),
                            Math.round((votes["SPD"]/SAMPLE_SIZE)*100),
                            Math.round((votes["Afd"]/SAMPLE_SIZE)*100),
                            Math.round((votes["B90"]/SAMPLE_SIZE)*100),
                            Math.round((votes["FDP"]/SAMPLE_SIZE)*100),
                            Math.round((votes["LINKE"]/SAMPLE_SIZE)*100),
                            Math.round((votes["BSW"]/SAMPLE_SIZE)*100),
                            Math.round((votes["sonstige"]/SAMPLE_SIZE)*100)
                        ],
                        marker: { // custom party colors
                            color: ["#000000", "#ff0000", "#0000ff", "#008000", "#ffff00", "#ff00ff","#7b2450", "#c0c0c0"]
                        },
                        error_y: { // error bars
                            type: 'data',
                            array: [
                                errorTerm(votes["CDU/CSU"],SAMPLE_SIZE),
                                errorTerm(votes["SPD"],SAMPLE_SIZE),
                                errorTerm(votes["Afd"],SAMPLE_SIZE),
                                errorTerm(votes["B90"],SAMPLE_SIZE),
                                errorTerm(votes["FDP"],SAMPLE_SIZE),
                                errorTerm(votes["LINKE"],SAMPLE_SIZE),
                                errorTerm(votes["BSW"],SAMPLE_SIZE),
                                errorTerm(votes["sonstige"],SAMPLE_SIZE)
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
            const parties = ["CDU/CSU", "SPD", "Afd", "B90", "FDP", "LINKE", "BSW", "sonstige"];

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
                const vote = item[6];
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
            updateSampleSize();
            const sample = drawSample();
            const votes = aggregateVotes(rawSample);
            updateBarChart(votes);
        }

        function reset() {
            fh_radio.checked = true;
            onlineSample.checked = true;
            ageCheckbox.checked = false;
            sexCheckbox.checked = false;
            voteCheckbox.checked = false;
            partyChooser.value = "CDU/CSU";
            biasSlider.value = 0;
        }


        fh_radio.addEventListener('click', redraw);
        ot_radio.addEventListener('click', redraw);
        th_radio.addEventListener('click', redraw);

        telephoneSample.addEventListener('click', redraw);
        socialMediaSample.addEventListener('click', redraw);
        onlineSample.addEventListener('click', redraw);
        
        redrawButton.addEventListener("click", redraw);
        resetButton.addEventListener("click", reset);

        ageCheckbox.addEventListener("change", updateWeights)
        sexCheckbox.addEventListener("change", updateWeights)
        voteCheckbox.addEventListener("change", updateWeights)

        
        // Trigger initial load
        redraw();
    });