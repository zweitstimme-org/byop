import fs from 'fs';

let sampleWeights = null;

////////// Helper Functions //////////
function writeCSVHeader(headers, csvFilePath) {
    const headerLine = headers.join(',') + '\n';
    fs.appendFileSync(csvFilePath, headerLine);
}

function writeCSVLine(rowObject, csvFilePath) {
    const weighedVotesArray = [
        rowObject["CDU/CSU"],
        rowObject["SPD"],
        rowObject["AfD"],
        rowObject["B90"],
        rowObject["FDP"],
        rowObject["LINKE"],
        rowObject["Sonstige"],
        rowObject["BSW"]
    ]
    const csvLine = weighedVotesArray.join(',') + '\n';
    fs.appendFileSync(csvFilePath, csvLine);
}


// Load population sample
const url = "https://rawcdn.githack.com/zweitstimme-org/byop/d00952b6c3db6ce83862c7d6bfdec15fefca74e1/sample_data.json";
const response = await fetch(url);
const population = await response.json();
const outputPath = "simulation/population.json";
fs.appendFileSync(outputPath, JSON.stringify(population, null, 2));

const configurations = [
    // 500
    // 500 Telephone
    // {
    //     sample_size: 500,
    //     type: "telephone",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 500,
    //     type: "telephone",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 500,
    //     type: "telephone",
    //     weighting: "vote"
    // }, {
    //     sample_size: 500,
    //     type: "telephone",
    //     weighting: "both",
    // },
    // // 500 Social Media
    // {
    //     sample_size: 500,
    //     type: "social",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 500,
    //     type: "social",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 500,
    //     type: "social",
    //     weighting: "vote"
    // }, {
    //     sample_size: 500,
    //     type: "social",
    //     weighting: "both",
    // },
    // // 500 Online
    // {
    //     sample_size: 500,
    //     type: "online",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 500,
    //     type: "online",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 500,
    //     type: "online",
    //     weighting: "vote"
    // }, {
    //     sample_size: 500,
    //     type: "online",
    //     weighting: "both",
    // },
    // 1000
    // 1000 Telephone       
    // {
    //     sample_size: 1000,
    //     type: "telephone",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 1000,
    //     type: "telephone",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 1000,
    //     type: "telephone",
    //     weighting: "vote"
    // }, {
    //     sample_size: 1000,
    //     type: "telephone",
    //     weighting: "both",
    // },
    // 1000 Social       
    {
        sample_size: 1000,
        type: "social",
        weighting: "none",
    },
    {
        sample_size: 1000,
        type: "social",
        weighting: "demographics",
    }, {
        sample_size: 1000,
        type: "social",
        weighting: "vote"
    }, {
        sample_size: 1000,
        type: "social",
        weighting: "both",
    },
    // 1000 Online       
    {
        sample_size: 1000,
        type: "online",
        weighting: "none",
    },
    {
        sample_size: 1000,
        type: "online",
        weighting: "demographics",
    }, {
        sample_size: 1000,
        type: "online",
        weighting: "vote"
    }, {
        sample_size: 1000,
        type: "online",
        weighting: "both",
    },
    // 10000
    // 10000 Telephone
    // {
    //     sample_size: 10000,
    //     type: "telephone",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 10000,
    //     type: "telephone",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 10000,
    //     type: "telephone",
    //     weighting: "vote"
    // }, {
    //     sample_size: 10000,
    //     type: "telephone",
    //     weighting: "both",
    // },
    // // 10000 Social
    // {
    //     sample_size: 10000,
    //     type: "social",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 10000,
    //     type: "social",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 10000,
    //     type: "social",
    //     weighting: "vote"
    // }, {
    //     sample_size: 10000,
    //     type: "social",
    //     weighting: "both",
    // },
    // // 10000 Online
    // {
    //     sample_size: 10000,
    //     type: "online",
    //     weighting: "none",
    // },
    // {
    //     sample_size: 10000,
    //     type: "online",
    //     weighting: "demographics",
    // }, {
    //     sample_size: 10000,
    //     type: "online",
    //     weighting: "vote"
    // },
    // {
    //     sample_size: 10000,
    //     type: "online",
    //     weighting: "both",
    // },
]

const header = ["CDU/CSU", "SPD", "AfD", "B90", "FDP", "LINKE", "Sonstige", "BSW"]

for (let configuration of configurations) {
    const sample_size = configuration.sample_size;
    const type = configuration.type;
    const weighting = configuration.weighting;

    const conf_key = `${sample_size}-${type}-${weighting}`;
    console.log(`Beginning with ${conf_key}`);
    writeCSVHeader(header, `simulation/${conf_key}.csv`);

    const byDemographics = ((weighting == "demographics") || (weighting == "both"));
    const byPastVote = ((weighting == "vote") || (weighting == "both"));


    for (let iter = 0; iter < 8000; iter++) {
        if (iter % 1000 == 0) console.log(`Iteration ${iter}`);
        ////////// Draw Sample //////////
        let shuffled = population.sort(() => 0.5 - Math.random());
        let iterDraw;
        if (type == "telephone") iterDraw = shuffled.filter(i => i[5] === "1").slice(0, sample_size);
        if (type == "social") iterDraw = shuffled.filter(i => i[3] === "1").slice(0, sample_size);
        if (type == "online") iterDraw = shuffled.filter(i => i[4] === "1").slice(0, sample_size);

        ////////// Weigh //////////

        /* NO WEIGHTING */
        if (!byDemographics && !byPastVote) {
            sampleWeights = null;
            const votes = iterDraw.map(item => item[6]);
            const votesByParty = votes.reduce((acc, vote) => {
                if (acc[vote]) acc[vote] += 1;
                else acc[vote] = 1;
                return acc;
            }, {})
            const weighedVotes = { ...votesByParty };
            writeCSVLine(weighedVotes, `simulation/${conf_key}.csv`);
        };

        // From BTW 21
        const pastVoteShareGoals = {
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
                    "CDU/CSU": 0.233,
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
        if (byDemographics && !byPastVote) {
            const demographicsTotals = iterDraw.reduce((acc, curr) => {
                const currSex = curr[1];
                const currAgeGroup = curr[0];
                if (!acc[currSex]) acc[currSex] = {};

                if (acc[currSex][currAgeGroup]) {
                    acc[currSex][currAgeGroup] += 1;
                }
                else acc[currSex][currAgeGroup] = 1;
                return acc;
            }, {});

            const demographicsShares = { ...demographicsTotals };
            Object.keys(demographicsTotals["m"]).forEach(key => {
                demographicsShares["m"][key] = demographicsTotals["m"][key] / iterDraw.length;
            });
            Object.keys(demographicsTotals["f"]).forEach(key => {
                demographicsShares["f"][key] = demographicsTotals["f"][key] / iterDraw.length;
            });

            const demographicsWeightingFactors = {
                "m": {},
                "f": {}
            };
            Object.keys(demographicsTotals["m"]).forEach((key) => {
                demographicsWeightingFactors["m"][key] = demographicsShareGoals["m"][key] / demographicsShares["m"][key];
            });
            Object.keys(demographicsTotals["f"]).forEach((key) => {
                demographicsWeightingFactors["f"][key] = demographicsShareGoals["f"][key] / demographicsShares["f"][key];
            });
            sampleWeights = [];
            const votes = {};
            iterDraw.forEach((item) => {
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

            const weighedVotes = { ...votes };
            writeCSVLine(weighedVotes, `simulation/${conf_key}.csv`);
        }

        /* ONLY weighed by PAST VOTE */
        if (!byDemographics && byPastVote) {
            const pastVotesTotal = iterDraw.reduce((acc, curr) => {
                const currPastVote = curr[2];
                if (!acc[currPastVote]) acc[currPastVote] = 1;
                else acc[currPastVote] += 1;
                return acc;
            }, {});

            const pastVotesShares = { ...pastVotesTotal };
            Object.keys(pastVotesTotal).forEach(key => {
                pastVotesShares[key] = pastVotesTotal[key] / iterDraw.length;
            });

            const pastVotesWeightingFactors = {};
            Object.keys(pastVotesTotal).forEach((key) => {
                pastVotesWeightingFactors[key] = pastVoteShareGoals[key] / pastVotesShares[key];
            });
            const votes = {};
            const sampleWeights = [];
            iterDraw.forEach((item) => {
                const vote = item[6];
                const pastVote = item[2];
                if (votes[vote]) votes[vote] += 1 * pastVotesWeightingFactors[pastVote];
                else votes[vote] = 1 * pastVotesWeightingFactors[pastVote];
                sampleWeights.push(pastVotesWeightingFactors[pastVote])
            });

            Object.keys(votes).forEach((key) => {
                votes[key] = Math.round(votes[key]);
            });

            const weighedVotes = { ...votes };
            writeCSVLine(weighedVotes, `simulation/${conf_key}.csv`);
        }

        /* weighed by DEMOGRAPHICS and PAST VOTE */
        if (byDemographics && byPastVote) {
            const allFactorTotals = iterDraw.reduce((acc, curr) => {
                const currSex = curr[1];
                const currAgeGroup = curr[0];
                const currPastVote = curr[2];
                if (!acc[currSex]) acc[currSex] = {};
                if (!acc[currSex][currAgeGroup]) acc[currSex][currAgeGroup] = {};

                if (!acc[currSex][currAgeGroup][currPastVote]) acc[currSex][currAgeGroup][currPastVote] = 1;
                else acc[currSex][currAgeGroup][currPastVote] += 1;
                return acc;
            }, {});

            const allFactorShares = { ...allFactorTotals };
            Object.keys(allFactorTotals["m"]).forEach(ageGroup => {
                Object.keys(allFactorTotals["m"][ageGroup]).forEach(party => {
                    allFactorShares["m"][ageGroup][party] = allFactorTotals["m"][ageGroup][party] / iterDraw.length;
                })
            });
            Object.keys(allFactorTotals["f"]).forEach(ageGroup => {
                Object.keys(allFactorTotals["f"][ageGroup]).forEach(party => {
                    allFactorShares["f"][ageGroup][party] = allFactorTotals["f"][ageGroup][party] / iterDraw.length;
                })
            });

            const allFactorWeightingFactors = {
                "m": {
                    18: {},
                    25: {},
                    35: {},
                    45: {},
                    60: {},
                    70: {}
                },
                "f": {
                    18: {},
                    25: {},
                    35: {},
                    45: {},
                    60: {},
                    70: {}
                }
            };
            Object.keys(allFactorTotals["m"]).forEach(ageGroup => {
                Object.keys(allFactorTotals["m"][ageGroup]).forEach(party => {
                    allFactorWeightingFactors["m"][ageGroup][party] = allFactorShareGoals["m"][ageGroup][party] / allFactorShares["m"][ageGroup][party];
                })
            });

            Object.keys(allFactorTotals["f"]).forEach(ageGroup => {
                Object.keys(allFactorTotals["f"][ageGroup]).forEach(party => {
                    allFactorWeightingFactors["f"][ageGroup][party] = allFactorShareGoals["f"][ageGroup][party] / allFactorShares["f"][ageGroup][party];
                })
            });
            sampleWeights = [];
            const votes = {};
            iterDraw.forEach((item) => {
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

            const weighedVotes = { ...votes }
            writeCSVLine(weighedVotes, `simulation/${conf_key}.csv`);
        }
    }
    console.log(`Done with ${conf_key}!`)
}            