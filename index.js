let data;
let rawSample = [];
let weighedSample = {};
let biasedSample = {};

/* HELPER FUNCTIONS */
const sumValues = obj => Object.values(obj).reduce((a, b) => a + b, 0);
const setOpacity = (hex, alpha) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2, 0)}`;

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
        const demographicsCheckbox = document.getElementById("demographics");
        const voteCheckbox = document.getElementById("vote");
        const noneCheckbox = document.getElementById("none");

        /* PARTY BIAS */
        const partyChooser = document.getElementById("partyBias");
        const biasSlider = document.getElementById("partyAdaptionValue");
        

        /**
         * Draws a new sample from the data.
         * Respects the currently selected sample type.
         */
        function drawSample() {
            rawSample = [];
            weighedSample = {};
            biasedSample = {};

            updateSampleSize();
            
            shuffled = data.sort(() => 0.5 - Math.random());

            const telephone = telephoneSample.checked;
            const socialMedia = socialMediaSample.checked;
            const online = onlineSample.checked;

            let sample;
            if (telephone) sample = shuffled.filter(i => i[5] === "1") 
            if (socialMedia) sample = shuffled.filter(i => i[3] === "1")
            if (online) sample = shuffled.filter(i => i[4] === "1")

            rawSample = sample.slice(0, SAMPLE_SIZE);
        }

        // https://www.media-analyse.at/Signifikanz
        function errorTerm(absItem, sample_size) {
            absItem = Number(absItem);
            const percentItem = (absItem/sample_size).toFixed(2);
            const err = 1.96*Math.sqrt((percentItem*(1-percentItem))/sample_size)
            return err*100; // conversion for correct display in plotly
        }

        function updateBarChart() {
            const actualSampleSize = SAMPLE_SIZE;
            SAMPLE_SIZE = sumValues(biasedSample)
            const yValues = [
                Math.round((biasedSample["CDU/CSU"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["SPD"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["AfD"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["B90"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["FDP"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["LINKE"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["BSW"]/SAMPLE_SIZE)*100),
                Math.round((biasedSample["Sonstige"]/SAMPLE_SIZE)*100)
            ];

            const errorTerms = [
                errorTerm(biasedSample["CDU/CSU"], actualSampleSize),
                errorTerm(biasedSample["SPD"], actualSampleSize),
                errorTerm(biasedSample["AfD"], actualSampleSize),
                errorTerm(biasedSample["B90"], actualSampleSize),
                errorTerm(biasedSample["FDP"], actualSampleSize),
                errorTerm(biasedSample["LINKE"], actualSampleSize),
                errorTerm(biasedSample["BSW"], actualSampleSize),
                errorTerm(biasedSample["Sonstige"], actualSampleSize)
            ]

            const intervals = yValues.map((num, i) => {
                const intervalStart = num - Math.round(errorTerms[i]);
                const intervalEnd = num + Math.round(errorTerms[i]);
                return `${intervalStart}% - ${intervalEnd}%`;
            })

            texts = [
                (biasedSample["CDU/CSU"]/SAMPLE_SIZE)*100,
                (biasedSample["SPD"]/SAMPLE_SIZE)*100,
                (biasedSample["AfD"]/SAMPLE_SIZE)*100,
                (biasedSample["B90"]/SAMPLE_SIZE)*100,
                (biasedSample["FDP"]/SAMPLE_SIZE)*100,
                (biasedSample["LINKE"]/SAMPLE_SIZE)*100,
                (biasedSample["BSW"]/SAMPLE_SIZE)*100,
                (biasedSample["Sonstige"]/SAMPLE_SIZE)*100
            ].map(n => `${n.toFixed(1)}%`);

            const xValues = ["CDU/CSU", "SPD", "AfD", "Grüne", "FDP", "Linke", "BSW", "Sonstige"];

            const annotations = []
            textHeight = 35;
            for (let i = 0; i < 8; i++) {
                annotations.push(
                    {
                        x: xValues[i],
                        y: yValues[i] + errorTerms[i] + 2,
                        xref: 'x',
                        yref: 'y',
                        text: texts[i],
                        align: 'center',
                        showarrow: false
                    }
                )
            }

            // DAWUM Wahltrend
            const pollingAverage = [30.2, 16, 20.3, 13.8, 4.2, 3.5, 5.2, 6.8];

            Plotly.newPlot("holder", // elem
                [
                    { /* BACKGROUND BARS */
                        x: xValues, // labels
                        y: pollingAverage,
                        marker: { // custom party colors
                            color: [
                                setOpacity("#000000", 0.6),
                                setOpacity("#ff0000", 0.6),
                                setOpacity("#0000ff", 0.6),
                                setOpacity("#008000", 0.6),
                                setOpacity("#ffff00", 0.6),
                                setOpacity("#ff00ff", 0.6),
                                setOpacity("#7b2450", 0.6),
                                setOpacity("#c0c0c0", 0.6),
                            ]
                        },
                        type: "bar",
                        width: 0.9,
                        hoverinfo: 'none' // Disable hover tooltips
                    },
                    { /* MAIN BARS */
                        x: xValues, // labels
                        y: yValues,
                        customdata: intervals,
                        marker: { // custom party colors
                            color: [
                                "#000000",
                                "#ff0000",
                                "#0000ff",
                                "#008000",
                                "#ffff00",
                                "#ff00ff",
                                "#7b2450",
                                "#c0c0c0"
                            ]
                        },
                        error_y: { // error bars
                            type: 'data',
                            array: errorTerms,
                            visible: true
                          },
                        type: "bar",
                        width: 0.7,
                        hovertemplate: '%{x}: %{customdata}<extra></extra>'
                    }                    
                ], // data
                {
                    "width": 500,
                    "height": 350,
                    showlegend: false,
                    barmode: 'overlay',
                    yaxis: {range: [0, 40]},
                    annotations: annotations,
                    dragmode: false
                }, // layout
                {
                    displayModeBar: false,
                } // config
            )
                    
            SAMPLE_SIZE = actualSampleSize;
        };

        function updateWeights(elem) {
            if (elem.srcElement == noneCheckbox) {
                if (noneCheckbox.checked) {
                    demographicsCheckbox.checked = false;
                    voteCheckbox.checked = false;
                }
            }

            const byDemographics = demographicsCheckbox.checked;
            const byPastVote = voteCheckbox.checked;

            if (byDemographics || byPastVote ) noneCheckbox.checked = false;
            else noneCheckbox.checked = true;

            const parties = ["CDU/CSU", "SPD", "AfD", "B90", "FDP", "LINKE", "BSW", "Sonstige"];

            if (!byDemographics && !byPastVote) {
                const votes = rawSample.map(item => item[6]);
                const votesByParty = votes.reduce((acc, vote) => {
                    if (acc[vote]) acc[vote] += 1;
                    else acc[vote] = 1;
                    return acc;
                }, {})
                weighedSample = { ...votesByParty };
                adaptForParty();
                return;
            };

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

            weighedSample = { ...votes };
            adaptForParty();
        }

        function adaptForParty () {
            const party = partyChooser.value;
            const effectSize = Number(biasSlider.value);
            
            // Do nothing if we do not introduce bias
            if (effectSize == 0) {
                biasedSample = { ...weighedSample };
                updateBarChart();
                return;
            };

            const partyPercentages = {
                "CDU/CSU": weighedSample["CDU/CSU"]/SAMPLE_SIZE,
                "SPD": weighedSample["SPD"]/SAMPLE_SIZE,
                "AfD": weighedSample["AfD"]/SAMPLE_SIZE,
                "B90": weighedSample["B90"]/SAMPLE_SIZE,
                "FDP": weighedSample["FDP"]/SAMPLE_SIZE,
                "LINKE": weighedSample["LINKE"]/SAMPLE_SIZE,
                "BSW": weighedSample["BSW"]/SAMPLE_SIZE,
                "Sonstige": weighedSample["Sonstige"]/SAMPLE_SIZE
            }

            const percentagePoint = Math.round(SAMPLE_SIZE/100);
            const offset = effectSize*percentagePoint; 
            biasedSample[party] = weighedSample[party] + effectSize*percentagePoint;
            for (p in weighedSample){
                if (p == party) continue;
                else {
                    biasedSample[p] = ((offset*-1)*partyPercentages[p]) + weighedSample[p];
                    biasedSample[p] = Math.round(biasedSample[p]);
                }
            }
            updateBarChart();
        }

        function resetBias() {
            biasSlider.value = 0;
            adaptForParty();               
        }

        /**
         * Description
         */
        function redraw() {
            drawSample();
            updateWeights(true); // triggers the whole pipeline
        }

        function reset() {
            fh_radio.checked = true;
            onlineSample.checked = true;
            demographicsCheckbox.checked = false;
            voteCheckbox.checked = false;
            noneCheckbox.checked = true;
            partyChooser.value = "CDU/CSU";
            biasSlider.value = 0;
            updateWeights(true); // triggers the whole pipeline
        }


        fh_radio.addEventListener('click', redraw);
        ot_radio.addEventListener('click', redraw);
        th_radio.addEventListener('click', redraw);

        telephoneSample.addEventListener('click', redraw);
        socialMediaSample.addEventListener('click', redraw);
        onlineSample.addEventListener('click', redraw);
        
        redrawButton.addEventListener("click", redraw);
        resetButton.addEventListener("click", reset);

        demographicsCheckbox.addEventListener("change", updateWeights);
        voteCheckbox.addEventListener("change", updateWeights);
        noneCheckbox.addEventListener("change", updateWeights);

        biasSlider.addEventListener('input', adaptForParty);
        partyChooser.addEventListener('change', resetBias);
        
        // Trigger initial load
        redraw();
    });