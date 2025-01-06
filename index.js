let data;
let chart;
fetch('sample_data.json')
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
            const votes = sample.map(item => [item[0], item[2]]);

            const votesByAgeGroup = votes.reduce((acc, [age, party]) => {
                let ageGroup = acc.find(entry => entry.age === age);

                if (!ageGroup) {
                    ageGroup = { age, preferences: {} };
                    acc.push(ageGroup);
                }
                ageGroup.preferences[party] = (ageGroup.preferences[party] || 0) + 1;

                return acc;
            }, []);

            return votesByAgeGroup;
        }

        function updateBarChart(votes) {
            chart?.destroy();
            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['CDU/CSU', 'SPD', 'Afd', 'FDP', 'LINKE', 'B90', "sonstige"],
                    datasets: [{
                        label: '18-24',
                        data: [
                            votes.find(v => v.age == "18").preferences["CDU/CSU"],
                            votes.find(v => v.age == "18").preferences["SPD"],
                            votes.find(v => v.age == "18").preferences["Afd"],
                            votes.find(v => v.age == "18").preferences["FDP"],
                            votes.find(v => v.age == "18").preferences["LINKE"],
                            votes.find(v => v.age == "18").preferences["B90"],
                            votes.find(v => v.age == "18").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '25-34',
                        data: [
                            votes.find(v => v.age == "25").preferences["CDU/CSU"],
                            votes.find(v => v.age == "25").preferences["SPD"],
                            votes.find(v => v.age == "25").preferences["Afd"],
                            votes.find(v => v.age == "25").preferences["FDP"],
                            votes.find(v => v.age == "25").preferences["LINKE"],
                            votes.find(v => v.age == "25").preferences["B90"],
                            votes.find(v => v.age == "25").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '25-34',
                        data: [
                            votes.find(v => v.age == "25").preferences["CDU/CSU"],
                            votes.find(v => v.age == "25").preferences["SPD"],
                            votes.find(v => v.age == "25").preferences["Afd"],
                            votes.find(v => v.age == "25").preferences["FDP"],
                            votes.find(v => v.age == "25").preferences["LINKE"],
                            votes.find(v => v.age == "25").preferences["B90"],
                            votes.find(v => v.age == "25").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '35-44',
                        data: [
                            votes.find(v => v.age == "35").preferences["CDU/CSU"],
                            votes.find(v => v.age == "35").preferences["SPD"],
                            votes.find(v => v.age == "35").preferences["Afd"],
                            votes.find(v => v.age == "35").preferences["FDP"],
                            votes.find(v => v.age == "35").preferences["LINKE"],
                            votes.find(v => v.age == "35").preferences["B90"],
                            votes.find(v => v.age == "35").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '45-59',
                        data: [
                            votes.find(v => v.age == "45").preferences["CDU/CSU"],
                            votes.find(v => v.age == "45").preferences["SPD"],
                            votes.find(v => v.age == "45").preferences["Afd"],
                            votes.find(v => v.age == "45").preferences["FDP"],
                            votes.find(v => v.age == "45").preferences["LINKE"],
                            votes.find(v => v.age == "45").preferences["B90"],
                            votes.find(v => v.age == "45").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '60-69',
                        data: [
                            votes.find(v => v.age == "60").preferences["CDU/CSU"],
                            votes.find(v => v.age == "60").preferences["SPD"],
                            votes.find(v => v.age == "60").preferences["Afd"],
                            votes.find(v => v.age == "60").preferences["FDP"],
                            votes.find(v => v.age == "60").preferences["LINKE"],
                            votes.find(v => v.age == "60").preferences["B90"],
                            votes.find(v => v.age == "60").preferences["sonstige"]
                        ]
                    },
                    {
                        label: '70+',
                        data: [
                            votes.find(v => v.age == "70").preferences["CDU/CSU"],
                            votes.find(v => v.age == "70").preferences["SPD"],
                            votes.find(v => v.age == "70").preferences["Afd"],
                            votes.find(v => v.age == "70").preferences["FDP"],
                            votes.find(v => v.age == "70").preferences["LINKE"],
                            votes.find(v => v.age == "70").preferences["B90"],
                            votes.find(v => v.age == "70").preferences["sonstige"]
                        ]
                    }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true,
                        },
                        y: {
                            stacked: true
                        }
                    }
                }
            });
        }

        function redraw() {
            const sample = drawSample();
            const votes = aggregateVotes(sample);
            updateBarChart(votes);
        }

        sizeSelector.addEventListener("input", redraw);
        redrawButton.addEventListener("click", redraw);
        redraw();
    });