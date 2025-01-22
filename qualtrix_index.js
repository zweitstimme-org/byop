let data;
let rawSample = [];
let weighedSample = {};
let biasedSample = {};
let drawnSamples = {};
let sampleWeights = null;
let foundEmbeddedData = null;

window.byop_data = {
    size_changed: 0,
    type_changed: 0,
    weighting_changed: 0,
    biased_party_changed: 0,
    party_bias_changed: 0,
    sample_changed: 0,
    reset: 0,
    poll_results: new Set()
}

Qualtrics.SurveyEngine.addOnReady(function()
{
    foundEmbeddedData = Qualtrics.SurveyEngine.getEmbeddedData('dashboard_experiment_data');
    const sumValues = obj => Object.values(obj).reduce((a, b) => a + b, 0);
	const setOpacity = (hex, alpha) => {
        const colorWithOpa = String(hex)+Math.floor(alpha * 255).toString(16).padStart(2, 0);
        return colorWithOpa;
    };
	jQuery.getScript("https://cdn.plot.ly/plotly-3.0.0-rc.2.min.js", () => {
	  jQuery.getJSON("https://raw.githack.com/zweitstimme-org/byop/main/sample_data.json", (d) => {
					data = d;
		  const holderElem = document.getElementById('holder');
			let holderWidth = Math.round(holderElem.clientWidth - 20);
            if (holderWidth > 600) holderWidth = 600;
			let holderHeight = Math.round(holderWidth / 1.428);
		  if (holderHeight < 250) holderHeight = 250;
		
        const redrawButton = document.getElementById("redraw");
        const resetButton = document.getElementById("resetByop");

        const loadingIndicator = document.getElementById("loadingIndicator");
        /* SAMPLE SIZE */
        const fh_radio = document.getElementById("500")
        const ot_radio = document.getElementById("1000")
        const tt_radio = document.getElementById("10000")
        
        let SAMPLE_SIZE
        function updateSampleSize() {
            if (fh_radio.checked) SAMPLE_SIZE = 500;
            if (ot_radio.checked) SAMPLE_SIZE = 1000;
            if (tt_radio.checked) SAMPLE_SIZE = 10000;
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

        /* EXPLANATORY TEXTS */
        const sampleSizeText = document.getElementById("sampleSizeText");
        const modeText = document.getElementById("modeText");
        const weightingText = document.getElementById("weightingText");
        const biasText = document.getElementById("biasText");

        // https://www.media-analyse.at/Signifikanz
        function errorTerm(absItem, sample_size) {
            absItem = Number(absItem);
            const weighedTotal = sumValues(biasedSample);
            const p_hat = absItem/weighedTotal; 
            let n_eff;
            if (!sampleWeights) n_eff = sample_size
            else {
                const squaredSumOfWeights = Math.pow(sampleWeights.reduce((acc, curr) => acc+curr, 0), 2)
                const sumOfSquaredWeights = sampleWeights.reduce((acc, curr) => acc+Math.pow(curr, 2))
                n_eff = squaredSumOfWeights/sumOfSquaredWeights
            }
            
            const percentItem = (p_hat).toFixed(2);
            const err = 1.96*Math.sqrt((percentItem*(1-percentItem))/n_eff)
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
            window.byop_data.poll_results.add(JSON.stringify(yValues));

            const errorTerms = [
                errorTerm(biasedSample["CDU/CSU"], SAMPLE_SIZE),
                errorTerm(biasedSample["SPD"], SAMPLE_SIZE),
                errorTerm(biasedSample["AfD"], SAMPLE_SIZE),
                errorTerm(biasedSample["B90"], SAMPLE_SIZE),
                errorTerm(biasedSample["FDP"], SAMPLE_SIZE),
                errorTerm(biasedSample["LINKE"], SAMPLE_SIZE),
                errorTerm(biasedSample["BSW"], SAMPLE_SIZE),
                errorTerm(biasedSample["Sonstige"], SAMPLE_SIZE)
            ]

            const intervals = yValues.map((num, i) => {
                let intervalStart = num - Math.round(errorTerms[i]);
                if (intervalStart < 0) intervalStart = 0;
                const intervalEnd = num + Math.round(errorTerms[i]);
                return String(intervalStart)+"% - "+String(intervalEnd)+"%";
            })

            performanceTexts = [
                (biasedSample["CDU/CSU"]/SAMPLE_SIZE)*100,
                (biasedSample["SPD"]/SAMPLE_SIZE)*100,
                (biasedSample["AfD"]/SAMPLE_SIZE)*100,
                (biasedSample["B90"]/SAMPLE_SIZE)*100,
                (biasedSample["FDP"]/SAMPLE_SIZE)*100,
                (biasedSample["LINKE"]/SAMPLE_SIZE)*100,
                (biasedSample["BSW"]/SAMPLE_SIZE)*100,
                (biasedSample["Sonstige"]/SAMPLE_SIZE)*100
            ].map(n => n.toFixed(1)+"%");

            const xValues = ["CDU/CSU", "SPD", "AfD", "Grüne", "FDP", "Linke", "BSW", "Sonstige"];

            // DAWUM Wahltrend
            const pollingAverage = [30.2, 16, 20.3, 13.8, 4.2, 3.5, 5.2, 6.8];

            const differenceAnnotations = [
                (biasedSample["CDU/CSU"]/SAMPLE_SIZE)*100,
                (biasedSample["SPD"]/SAMPLE_SIZE)*100,
                (biasedSample["AfD"]/SAMPLE_SIZE)*100,
                (biasedSample["B90"]/SAMPLE_SIZE)*100,
                (biasedSample["FDP"]/SAMPLE_SIZE)*100,
                (biasedSample["LINKE"]/SAMPLE_SIZE)*100,
                (biasedSample["BSW"]/SAMPLE_SIZE)*100,
                (biasedSample["Sonstige"]/SAMPLE_SIZE)*100]
                .map((elem, i) => elem - pollingAverage[i])
                .map((elem, i) => {
                    const differenceString = Math.abs(elem.toFixed(1));
                    const differenceNumber = Number(elem.toFixed(1));
                    const differenceStringPerc = differenceString + '%';
                    const sign = differenceNumber > 0 ? "+" : (differenceNumber == 0 ? "±" : "-" )
                    return {
                        x: xValues[i],
                        y: 50,
                        xref: 'x',
                        yref: 'y',
                        text: sign + differenceStringPerc,
                        align: 'center',
                        showarrow: false,
                        font: {
                            color: sign == "+" ? 'green' : (sign == "±" ? 'black' : 'red'),
                            size: holderWidth >= 440 ? 12 : 8
                        }
                    }
                } );

            const annotations = []
            annotations.push(...differenceAnnotations);
            for (let i = 0; i < 8; i++) {
                // Performance in Sample
                annotations.push(
                    {
                        x: xValues[i],
                        y: yValues[i] + errorTerms[i] + 2,
                        xref: 'x',
                        yref: 'y',
                        text: performanceTexts[i],
                        align: 'center',
                        showarrow: false,
                        font: {
                            size: holderWidth >= 440 ? 12 : 8
                        }
                    }
                )
            }

            annotations.push(
                {
                    x: 0,
                    xanchor: 'left',
                    y: 55,
                    xref: 'paper',
                    yref: 'y',
                    text: 'Abweichung vom Durchschnitt anderer Umfragen:',
                    font: {
                        size: holderWidth >= 440 ? 12 : 8
                    },
                    align: 'center',
                    showarrow: false
                }
            )
			
            Plotly.newPlot("holder", // elem
                [
                    { /* BACKGROUND BARS */
                        x: xValues, // labels
                        y: pollingAverage,
                        marker: { // custom party colors
                            color: [
                                setOpacity("#000000", 0.4),
                                setOpacity("#ff0000", 0.4),
                                setOpacity("#0000ff", 0.4),
                                setOpacity("#008000", 0.4),
                                setOpacity("#ffff00", 0.4),
                                setOpacity("#ff00ff", 0.4),
                                setOpacity("#7b2450", 0.4),
                                setOpacity("#c0c0c0", 0.4),
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
                        hovertemplate: '%{customdata}<extra></extra>'
                    }                    
                ], // data
                {
                    width: holderWidth,
                    height: holderHeight,
                    showlegend: false,
                    barmode: 'overlay',
                    yaxis: {
                        range: [0, 55],
                        tickvals: [0, 10, 20, 30, 40],
                        ticktext: ['0%', '10%', '20%', '30%', '40%']
                    },
                    annotations: annotations,
                    dragmode: false,
                    margin: {t: 20, l: 40, r: 40, b: 0}
                }, // layout
                {
                    displayModeBar: false,
                    doubleClick: false
                } // config
            ).then(function() { 
                loadingIndicator.style.setProperty('display', 'none'); 
            });
                    
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
            else {
                noneCheckbox.checked = true;
                weightingText.style.setProperty('display', 'none');
            };

            /* NO WEIGHTING */
            if (!byDemographics && !byPastVote) {
                sampleWeights = null;
                const votes = rawSample.map(item => item[6]);
                const votesByParty = votes.reduce((acc, vote) => {
                    if (acc[vote]) acc[vote] += 1;
                    else acc[vote] = 1;
                    return acc;
                }, {})
                weighedSample = jQuery.extend(true, {}, votesByParty);
                adaptForParty();
                return;
            };

            // From BTW 21
            pastVoteShareGoals = {
                "CDU/CSU": 0.241,
                "SPD": 0.257, 
                "AfD": 0.103,
                "B90": 0.148,
                "FDP": 0.115,
                "LINKE": 0.049, 
                "Sonstige": 0.087 
            }

            const demographicsShareGoals = {
                m: {
                    18: 0.079,
                    25: 0.129, 
                    35: 0.14,
                    45: 0.276,
                    60: 0.179,
                    70: 0.196
                },
                f: {
                    18: 0.072,
                    25: 0.122,
                    35: 0.133,
                    45: 0.265,
                    60: 0.178,
                    70: 0.229     
                }
            }
            
            const allFactorShareGoals = {
                m: {
                    18: {
                        "CDU/CSU": 0.108,
                        "SPD": 0.146,
                        "AfD": 0.77,
                        "B90": 0.197, 
                        "LINKE": 0.067,
                        "FDP": 0.262,
                        "Sonstige": 0.142,
                    },
                    25: {
                        "CDU/CSU": 0.134,
                        "SPD": 0.163,
                        "AfD": 0.119,
                        "B90": 0.198, 
                        "LINKE": 0.069,
                        "FDP": 0.178,
                        "Sonstige": 0.139,
                    }, 
                    35: {
                        "CDU/CSU": 0.151,
                        "SPD": 0.176,
                        "AfD": 0.174,
                        "B90": 0.171, 
                        "LINKE": 0.05,
                        "FDP": 0.137,
                        "Sonstige": 0.111,
                    },
                    45: {
                        "CDU/CSU":0.233 ,
                        "SPD": 0.24,
                        "AfD": 0.162,
                        "B90": 0.132, 
                        "LINKE": 0.041,
                        "FDP": 0.119,
                        "Sonstige": 0.073,
                    },
                    60: {
                        "CDU/CSU": 0.257,
                        "SPD": 0.308,
                        "AfD": 0.133,
                        "B90": 0.111, 
                        "LINKE": 0.051,
                        "FDP": 0.093,
                        "Sonstige": 0.048,
                    },
                    70: {
                        "CDU/CSU": 0.369,
                        "SPD": 0.339,
                        "AfD": 0.079,
                        "B90": 0.064, 
                        "LINKE": 0.043,
                        "FDP": 0.08,
                        "Sonstige": 0.026,
                    }
                                },
                f: {
                    18: {
                        "CDU/CSU": 0.107,
                        "SPD": 0.165,
                        "AfD": 0.05,
                        "B90": 0.283, 
                        "LINKE": 0.089,
                        "FDP": 0.148,
                        "Sonstige": 0.157,
                    },
                    25: {
                        "CDU/CSU": 0.137,
                        "SPD": 0.185,
                        "AfD": 0.08,
                        "B90": 0.259, 
                        "LINKE": 0.064,
                        "FDP": 0.12,
                        "Sonstige": 0.153,
                    },
                    35: {
                        "CDU/CSU": 0.192,
                        "SPD": 0.208,
                        "AfD": 0.108,
                        "B90": 0.202, 
                        "LINKE": 0.046,
                        "FDP": 0.112,
                        "Sonstige": 0.132,
                    },
                    45: {
                        "CDU/CSU": 0.227,
                        "SPD": 0.268,
                        "AfD": 0.095,
                        "B90": 0.16, 
                        "LINKE": 0.041,
                        "FDP": 0.107,
                        "Sonstige": 0.101,
                    },
                    60: {
                        "CDU/CSU": 0.269,
                        "SPD": 0.325,
                        "AfD": 0.083,
                        "B90": 0.124, 
                        "LINKE": 0.047,
                        "FDP": 0.088,
                        "Sonstige": 0.067,
                    },
                    70: {
                        "CDU/CSU": 0.396,
                        "SPD": 0.344,
                        "AfD": 0.045,
                        "B90": 0.068, 
                        "LINKE": 0.035,
                        "FDP": 0.075,
                        "Sonstige": 0.038,
                    },    
                }
            }

            /* ONLY weighed by DEMOGRAPHICS */
            if (byDemographics && !byPastVote){
                const demographicsTotals = rawSample.reduce((acc, curr) => {
                    const currSex = curr[1];
                    const currAgeGroup = curr[0];
                    if (!acc[currSex]) acc[currSex] = {};

                    if (acc[currSex][currAgeGroup]){
                        acc[currSex][currAgeGroup] += 1;
                    }
                    else acc[currSex][currAgeGroup] = 1;
                    return acc;
                }, {});

                const demographicsShares = jQuery.extend(true, {}, demographicsTotals);
                Object.keys(demographicsTotals["m"]).forEach(key => {
                    demographicsShares["m"][key] = demographicsTotals["m"][key]/rawSample.length;
                });
                Object.keys(demographicsTotals["f"]).forEach(key => {
                    demographicsShares["f"][key] = demographicsTotals["f"][key]/rawSample.length;
                });
                
                const demographicsWeightingFactors =  {
                    "m": {},
                    "f": {}
                };
                Object.keys(demographicsTotals["m"]).forEach((key) => {
                    demographicsWeightingFactors["m"][key] = demographicsShareGoals["m"][key]/demographicsShares["m"][key]; 
                });
                Object.keys(demographicsTotals["f"]).forEach((key) => {
                    demographicsWeightingFactors["f"][key] = demographicsShareGoals["f"][key]/demographicsShares["f"][key]; 
                });
                sampleWeights = [];
                const votes = {};
                rawSample.forEach((item) => {
                    const vote = item[6];
                    const age = item[0];
                    const sex = item[1];
                    if (votes[vote]) votes[vote] += 1 * demographicsWeightingFactors[sex][age];
                    else votes[vote] = 1 * demographicsWeightingFactors[sex][age]
                    sampleWeights.push(demographicsWeightingFactors[sex][age]);
                });
                
                Object.keys(votes).forEach((key) => {
                    votes[key] = Math.round(votes[key]); 
                });

                weighedSample = jQuery.extend(true, {}, votes);
                adaptForParty();
                return;
            }

            /* ONLY weighed by PAST VOTE */
            if (!byDemographics && byPastVote){
                const pastVotesTotal = rawSample.reduce((acc, curr) => {
                    const currPastVote = curr[2];
                    if (!acc[currPastVote]) acc[currPastVote] = 1;
                    else acc[currPastVote] += 1;
                    return acc;
                }, {});

                const pastVotesShares = jQuery.extend(true, {}, pastVotesTotal);
                Object.keys(pastVotesTotal).forEach(key => {
                    pastVotesShares[key] = pastVotesTotal[key]/rawSample.length;
                });

                const pastVotesWeightingFactors =  { };
                Object.keys(pastVotesTotal).forEach((key) => {
                    pastVotesWeightingFactors[key] = pastVoteShareGoals[key]/pastVotesShares[key]; 
                });
                const votes = {};
                const sampleWeights = [];
                rawSample.forEach((item) => {
                    const vote = item[6];
                    const pastVote = item[2];
                    if (votes[vote]) votes[vote] += 1 * pastVotesWeightingFactors[pastVote];
                    else votes[vote] = 1 * pastVotesWeightingFactors[pastVote];
                    sampleWeights.push(pastVotesWeightingFactors[pastVote])
                });
                
                Object.keys(votes).forEach((key) => {
                    votes[key] = Math.round(votes[key]); 
                });

                weighedSample = jQuery.extend(true, {}, votes);
                adaptForParty();
                return;
            }

            /* weighed by DEMOGRAPHICS and PAST VOTE */
            if (byDemographics && byPastVote){
                const allFactorTotals = rawSample.reduce((acc, curr) => {
                    const currSex = curr[1];
                    const currAgeGroup = curr[0];
                    const currPastVote = curr[2];
                    if (!acc[currSex]) acc[currSex] = {};
                    if (!acc[currSex][currAgeGroup]) acc[currSex][currAgeGroup] = {};

                    if (!acc[currSex][currAgeGroup][currPastVote]) acc[currSex][currAgeGroup][currPastVote] = 1;
                    else acc[currSex][currAgeGroup][currPastVote] += 1;
                    return acc;
                }, {});

                const allFactorShares = jQuery.extend(true, {}, allFactorTotals);
                Object.keys(allFactorTotals["m"]).forEach(ageGroup => {
                    Object.keys(allFactorTotals["m"][ageGroup]).forEach(party => {
                        allFactorShares["m"][ageGroup][party] = allFactorTotals["m"][ageGroup][party]/rawSample.length;
                    }) 
                });
                Object.keys(allFactorTotals["f"]).forEach(ageGroup => {
                    Object.keys(allFactorTotals["f"][ageGroup]).forEach(party => {
                        allFactorShares["f"][ageGroup][party] = allFactorTotals["f"][ageGroup][party]/rawSample.length;
                    }) 
                });
                
                const allFactorWeightingFactors =  {
                    "m": {
                            18: { },
                            25: { },
                            35: { },
                            45: { },
                            60: { },
                            70: { }
                    },
                    "f": {
                        18: { },
                        25: { },
                        35: { },
                        45: { },
                        60: { },
                        70: { }
                    }
                };
                Object.keys(allFactorTotals["m"]).forEach(ageGroup => {
                    Object.keys(allFactorTotals["m"][ageGroup]).forEach(party => {
                        allFactorWeightingFactors["m"][ageGroup][party] = allFactorShareGoals["m"][ageGroup][party]/allFactorShares["m"][ageGroup][party];
                    }) 
                });

                Object.keys(allFactorTotals["f"]).forEach(ageGroup => {
                    Object.keys(allFactorTotals["f"][ageGroup]).forEach(party => {
                        allFactorWeightingFactors["f"][ageGroup][party] = allFactorShareGoals["f"][ageGroup][party]/allFactorShares["f"][ageGroup][party];
                    }) 
                });
                sampleWeights = [];
                const votes = {};
                rawSample.forEach((item) => {
                    const pastVote = item[2];
                    const vote = item[6];
                    const age = item[0];
                    const sex = item[1];
                    if (votes[vote]) votes[vote] += 1 * allFactorWeightingFactors[sex][age][pastVote];
                    else votes[vote] = 1 * allFactorWeightingFactors[sex][age][pastVote]
                    sampleWeights.push(allFactorWeightingFactors[sex][age][pastVote])
                });
                
                Object.keys(votes).forEach((key) => {
                    votes[key] = Math.round(votes[key]); 
                });

                weighedSample = jQuery.extend(true, {}, votes);
                adaptForParty();
                return;
            }
        }

        function adaptForParty () {
            const party = partyChooser.value;
            const effectSize = Number(biasSlider.value);
            
            // Do nothing if we do not introduce bias
            if (effectSize == 0) {
                biasedSample = jQuery.extend(true, {}, weighedSample);
                updateBarChart();
                return;
            };

            weighed_sample_size = sumValues(weighedSample);

            const partyPercentages = {
                "CDU/CSU": weighedSample["CDU/CSU"]/weighed_sample_size,
                "SPD": weighedSample["SPD"]/weighed_sample_size,
                "AfD": weighedSample["AfD"]/weighed_sample_size,
                "B90": weighedSample["B90"]/weighed_sample_size,
                "FDP": weighedSample["FDP"]/weighed_sample_size,
                "LINKE": weighedSample["LINKE"]/weighed_sample_size,
                "BSW": weighedSample["BSW"]/weighed_sample_size,
                "Sonstige": weighedSample["Sonstige"]/weighed_sample_size
            }

            const percentagePoint = Math.round(weighed_sample_size/100);
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

        function drawSample() {
            drawnSamples = {
                    500: {},
                    1000: {},
                    10000: {}
            };

            [500,1000,10000].forEach((sampleSize) => {
                let shuffled = data.sort(() => 0.5 - Math.random());
                drawnSamples[sampleSize]["telephone"] = shuffled.filter(i => i[5] === "1").slice(0, sampleSize);
                shuffled = data.sort(() => 0.5 - Math.random());
                drawnSamples[sampleSize]["socialmedia"] = shuffled.filter(i => i[3] === "1").slice(0, sampleSize);
                shuffled = data.sort(() => 0.5 - Math.random());
                drawnSamples[sampleSize]["online"] = shuffled.filter(i => i[4] === "1").slice(0, sampleSize);
            })

            switchSample();
        }

        function redraw() {
            drawSample();
            updateWeights(true); // triggers the whole pipeline
        }

        function switchSample() {
            rawSample = [];
            weighedSample = {};
            biasedSample = {};

            updateSampleSize();

            const telephone = telephoneSample.checked;
            const socialMedia = socialMediaSample.checked;
            const online = onlineSample.checked;

            if (SAMPLE_SIZE == 500) {
                if (telephone) rawSample = drawnSamples["500"]["telephone"];
                if (socialMedia) rawSample = drawnSamples["500"]["socialmedia"];
                if (online) rawSample = drawnSamples["500"]["online"];
            }
            if (SAMPLE_SIZE == 1000) {
                if (telephone) rawSample = drawnSamples["1000"]["telephone"];
                if (socialMedia) rawSample = drawnSamples["1000"]["socialmedia"];
                if (online) rawSample = drawnSamples["1000"]["online"];
            }
            if (SAMPLE_SIZE == 10000) {
                if (telephone) rawSample = drawnSamples["10000"]["telephone"];
                if (socialMedia) rawSample = drawnSamples["10000"]["socialmedia"];
                if (online) rawSample = drawnSamples["10000"]["online"];
            }
            updateWeights(true); // triggers the whole pipeline
        }

        function reset() {
            ot_radio.checked = true;
            onlineSample.checked = true;
            demographicsCheckbox.checked = false;
            voteCheckbox.checked = false;
            noneCheckbox.checked = true;
            partyChooser.value = "CDU/CSU";
            biasSlider.value = 0;
            switchSample();
        }

        /* USER CONTROL FLOW */
        fh_radio.addEventListener('click', switchSample);
        ot_radio.addEventListener('click', switchSample);
        tt_radio.addEventListener('click', switchSample);

        telephoneSample.addEventListener('click', switchSample);
        socialMediaSample.addEventListener('click', switchSample);
        onlineSample.addEventListener('click', switchSample);
        
        redrawButton.addEventListener("click", redraw);
        resetButton.addEventListener("click", reset);

        demographicsCheckbox.addEventListener("change", updateWeights);
        voteCheckbox.addEventListener("change", updateWeights);
        noneCheckbox.addEventListener("change", updateWeights);

        biasSlider.addEventListener('input', adaptForParty);
        partyChooser.addEventListener('change', resetBias);

        /* INTERACTION LOGGING */
        function recordInteraction (elem) {
            const trigger = elem.srcElement;

            if (trigger == fh_radio) window.byop_data.size_changed += 1;
            if (trigger == ot_radio) window.byop_data.size_changed += 1;
            if (trigger == tt_radio) window.byop_data.size_changed += 1;
            if (trigger == fh_radio ||
                trigger == ot_radio ||
                trigger == tt_radio) {
                    sampleSizeText.style.setProperty('display', 'block');
                    modeText.style.setProperty('display', 'none');
                    weightingText.style.setProperty('display', 'none');
                    biasText.style.setProperty('display', 'none');
                }

            if (trigger == telephoneSample) window.byop_data.type_changed += 1;
            if (trigger == socialMediaSample) window.byop_data.type_changed += 1;
            if (trigger == onlineSample) window.byop_data.type_changed += 1;
            if (trigger == telephoneSample ||
                trigger == socialMediaSample ||
                trigger == onlineSample) {
                    sampleSizeText.style.setProperty('display', 'none');
                    modeText.style.setProperty('display', 'block');
                    weightingText.style.setProperty('display', 'none');
                    biasText.style.setProperty('display', 'none');
                }

            if (trigger == redrawButton) window.byop_data.sample_changed += 1;
            if (trigger == resetButton) window.byop_data.reset += 1;
            if (trigger == noneCheckbox) window.byop_data.weighting_changed += 1;
            if (trigger == redrawButton ||
                trigger == resetButton ||
                trigger == noneCheckbox) {
                    sampleSizeText.style.setProperty('display', 'none');
                    modeText.style.setProperty('display', 'none');
                    weightingText.style.setProperty('display', 'none');
                    biasText.style.setProperty('display', 'none');
                }

            if (trigger == demographicsCheckbox) window.byop_data.weighting_changed += 1;
            if (trigger == voteCheckbox) window.byop_data.weighting_changed += 1;
            if (trigger == demographicsCheckbox ||
                trigger == voteCheckbox) {
                    sampleSizeText.style.setProperty('display', 'none');
                    modeText.style.setProperty('display', 'none');
                    weightingText.style.setProperty('display', 'block');
                    biasText.style.setProperty('display', 'none');
                }

            if (trigger == biasSlider) window.byop_data.party_bias_changed += 1;
            if (trigger == partyChooser)window.byop_data.biased_party_changed += 1;
            if (trigger == biasSlider ||
                trigger == partyChooser) {
                    sampleSizeText.style.setProperty('display', 'none');
                    modeText.style.setProperty('display', 'none');
                    weightingText.style.setProperty('display', 'none');
                    biasText.style.setProperty('display', 'block');
                }
        }

        fh_radio.addEventListener('click', recordInteraction);
        ot_radio.addEventListener('click', recordInteraction);
        tt_radio.addEventListener('click', recordInteraction);
        telephoneSample.addEventListener('click', recordInteraction);
        socialMediaSample.addEventListener('click', recordInteraction);
        onlineSample.addEventListener('click', recordInteraction);
        redrawButton.addEventListener("click", recordInteraction);
        resetButton.addEventListener("click", recordInteraction);
        demographicsCheckbox.addEventListener("click", recordInteraction);
        voteCheckbox.addEventListener("click", recordInteraction);
        noneCheckbox.addEventListener("click", recordInteraction);
        biasSlider.addEventListener('change', recordInteraction);
        partyChooser.addEventListener('change', recordInteraction);

        // Trigger initial load
        redraw(); 
      })
});})       

Qualtrics.SurveyEngine.addOnPageSubmit(function()
{
    const setString = JSON.stringify([...window.byop_data.poll_results]);
    delete window.byop_data.poll_results;
    const dataString = JSON.stringify(window.byop_data);
    let dataToEmbed = dataString + setString;
    if (foundEmbeddedData) dataToEmbed = foundEmbeddedData + dataToEmbed
    Qualtrics.SurveyEngine.setEmbeddedData('dashboard_experiment_data', dataToEmbed);
});