# be your own pollster

It's fun, they said...

## Development Setup

- Data Generation process in `data_generation.R`. Execute the whole script to generate a fresh `sample_data.json`, containing 100000 voters.
- Run a local http-server (such as [`http-server`](https://www.npmjs.com/package/http-server)) to view the app.

## Data Generating Process

Age and voting behavior are based on the results of the [20. German Federal Election](https://www.bundeswahlleiterin.de/dam/jcr/8ad0ca1f-a037-48f8-b9f4-b599dd380f02/btw21_heft4.pdf).

## Voter Structure

Inside `sample_data.json`, there are 100000 voters in an array. Each voter itself is an array. The attributes of each individual are in the following order:

- age (0): "18", "25", "35", "45", "60", or "70"
- sex (1): "male" or "female"
- vote (2): "CDU/CSU", "SPD", "AfD", "FDP", "B90", "LINKE", or "sonstige
- social_media (3): "true", "false", or null (synonymous with "false") 
- online (4): "true", "false", or null (synonymous with "false") 
- telephone (5): "true", "false", or null (synonymous with "false")
- final_vote (6): "CDU/CSU", "SPD", "AfD", "FDP", "B90", "LINKE", "sonstige, *or "BSW"*

