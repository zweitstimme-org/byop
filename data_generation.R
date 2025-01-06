# Setup -------------------------------------------------------------------

library(jsonlite)
set.seed(123)
TOTAL_SAMPLE_SIZE <-100000

# https://www.bundeswahlleiterin.de/dam/jcr/8ad0ca1f-a037-48f8-b9f4-b599dd380f02/btw21_heft4.pdf

# Sex ---------------------------------------------------------------------

electorate_sample_sex <- sample(c("f", "m"), size = TOTAL_SAMPLE_SIZE, replace = TRUE, prob = c(0.52, 0.48))

# Age (given sex) ---------------------------------------------------------

# page 31
AGE_GROUPS <- c("18", "25", "35", "45",  "60", "70")
electorate_sample_age <- rep(NA, TOTAL_SAMPLE_SIZE)

# Split
male <- which(electorate_sample_sex == "m")
female <- which(electorate_sample_sex == "f")

electorate_sample_age[male] <- sample(
  AGE_GROUPS, 
  size = length(male), 
  replace = TRUE, 
  prob = c(0.079, 0.129, 0.14, 0.276, 0.179, 0.196)
)

electorate_sample_age[female] <- sample(
  AGE_GROUPS, 
  size = length(female), 
  replace = TRUE, 
  prob = c(0.072, 0.122, 0.133, 0.265, 0.178, 0.229)
)

# Past Vote (given age and sex) -------------------------------------------

# page 107
VOTE_OPTIONS <- c("CDU/CSU", "SPD", "Afd", "FDP", "LINKE", "B90", "sonstige")
electorate_sample_vote <- rep(NA, TOTAL_SAMPLE_SIZE)

male_18 <- which(electorate_sample_sex == "m" & electorate_sample_age == "18")
electorate_sample_vote[male_18] <- sample(
  VOTE_OPTIONS, 
  size = length(male_18), 
  replace = TRUE, 
  prob = c(0.108,0.146,0.077,0.262, 0.067,0.197,0.142)
)

male_25 <- which(electorate_sample_sex == "m" & electorate_sample_age == "25")
electorate_sample_vote[male_25] <- sample(
  VOTE_OPTIONS, 
  size = length(male_25), 
  replace = TRUE, 
  prob = c(0.134, 0.163, 0.119, 0.178, 0.069,0.198,0.139)
)

male_35 <- which(electorate_sample_sex == "m" & electorate_sample_age == "35")
electorate_sample_vote[male_35] <- sample(
  VOTE_OPTIONS, 
  size = length(male_35), 
  replace = TRUE, 
  prob = c(0.181,0176,0.174,0.137,0.05,0.171,0.111)
)

male_45 <- which(electorate_sample_sex == "m" & electorate_sample_age == "45")
electorate_sample_vote[male_45] <- sample(
  VOTE_OPTIONS, 
  size = length(male_45), 
  replace = TRUE, 
  prob = c(0.232,0.24,0.162,0.119,0.041,0.132,0.073)
)

male_60 <- which(electorate_sample_sex == "m" & electorate_sample_age == "60")
electorate_sample_vote[male_60] <- sample(
  VOTE_OPTIONS, 
  size = length(male_60), 
  replace = TRUE, 
  prob = c(0.257,0.308,0.133,0.093,0.051,0.111,0.048)
)

male_70 <- which(electorate_sample_sex == "m" & electorate_sample_age == "70")
electorate_sample_vote[male_70] <- sample(
  VOTE_OPTIONS, 
  size = length(male_70), 
  replace = TRUE, 
  prob = c(0.269,0.339,0.079,0.08,0.043,0.064,0.026)
)


female_18 <- which(electorate_sample_sex == "f" & electorate_sample_age == "18")
electorate_sample_vote[female_18] <- sample(
  VOTE_OPTIONS, 
  size = length(female_18), 
  replace = TRUE, 
  prob = c(0.107,0.165,0.05,0.148,0.089,0.283,0.157)
)

female_25 <- which(electorate_sample_sex == "f" & electorate_sample_age == "25")
electorate_sample_vote[female_25] <- sample(
  VOTE_OPTIONS, 
  size = length(female_25), 
  replace = TRUE, 
  prob = c(0.137,0.185,0.08,0.12,0.064,0.259,0.153)
)

female_35 <- which(electorate_sample_sex == "f" & electorate_sample_age == "35")
electorate_sample_vote[female_35] <- sample(
  VOTE_OPTIONS, 
  size = length(female_35), 
  replace = TRUE, 
  prob = c(0.192,0.208,0.108,0.112,0.046,0.202,0.132)
)

female_45 <- which(electorate_sample_sex == "f" & electorate_sample_age == "45")
electorate_sample_vote[female_45] <- sample(
  VOTE_OPTIONS, 
  size = length(female_45), 
  replace = TRUE, 
  prob = c(0.227,0.268,0.095,0.107,0.041,0.16,0.101)
)

female_60 <- which(electorate_sample_sex == "f" & electorate_sample_age == "60")
electorate_sample_vote[female_60] <- sample(
  VOTE_OPTIONS, 
  size = length(female_60), 
  replace = TRUE, 
  prob = c(0.269,0.325,0.083,0.088,0.047,0.124,0.067)
)

female_70 <- which(electorate_sample_sex == "f" & electorate_sample_age == "70")
electorate_sample_vote[female_70] <- sample(
  VOTE_OPTIONS, 
  size = length(female_70), 
  replace = TRUE, 
  prob = c(0.396,0.344,0.045,0.075,0.035,0.068,0.038)
)

# Modus (partially given age, and vote) ------------------------------

## Social Media ------------------------------------------------------------

electorate_sample_social_media <- rep(NA, TOTAL_SAMPLE_SIZE)
# 1/3 of 34-60
older <- which(electorate_sample_age == "35" |
                        electorate_sample_age == "45" |
                        electorate_sample_age == "60")
electorate_sample_social_media[older] <- sample(
  c("1", "0"), 
  size = length(older), 
  replace = TRUE, 
  prob = c(1/3,2/3)
)
# 3/4 of afd
afd <- which(electorate_sample_vote == "Afd")
electorate_sample_social_media[afd] <- sample(
  c("1", "0"), 
  size = length(afd), 
  replace = TRUE, 
  prob = c(0.75,0.25)
)
# all 18 and 25
# do this after afd so that we do not flip back!
electorate_sample_social_media[which(electorate_sample_age == "18")] <- "1"
electorate_sample_social_media[which(electorate_sample_age == "25")] <- "1"

## Telephone ------------------------------------------------------------

electorate_sample_telephone <- rep(NA, TOTAL_SAMPLE_SIZE)
# 1/3 of 25-70
telephone <- which(electorate_sample_age != "18")
electorate_sample_telephone[telephone] <- sample(
  c("1", "0"), 
  size = length(telephone), 
  replace = TRUE, 
  prob = c(1/3,2/3)
)

## Online ------------------------------------------------------------

electorate_sample_online <- rep(NA, TOTAL_SAMPLE_SIZE)
# 1/3 of 18-60
online <- which(electorate_sample_age != "70")
electorate_sample_online[online] <- sample(
  c("1", "0"), 
  size = length(online), 
  replace = TRUE, 
  prob = c(1/3,2/3)
)  
  
# Export ------------------------------------------------------------------

data <- cbind(
  electorate_sample_age,
  electorate_sample_sex,
  electorate_sample_vote,
  electorate_sample_social_media,
  electorate_sample_online,
  electorate_sample_telephone
  )

json_data <- toJSON(data, pretty = FALSE)

write(json_data, "sample_data.json")
