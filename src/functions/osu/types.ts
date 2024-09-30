
export type OsuGamemodes = "osu!" | "osu!taiko" | "osu!catch" | "osu!mania"
export type OsuCodeGamemodes = "osu" | "taiko" | "fruits" | "mania"

export type ScoreDifficultyData = {
	pp: number| undefined,
    fc: {
        pp: number | undefined,
        accuracy: number | undefined
    }
	stars: number | undefined,
	combo: number | undefined
}