import { Accuracy, MapInfo } from "@rian8337/osu-base"

export type DroidUser = {
    username: string,
    avatar_url: string,
    color: string,
    id: number,
    rank: {
        score: number,
        dpp: number,
    },
    country: string,
    total_score: number,
    dpp: number,
    accuracy: number,
    playcount: number,
	scores?: DroidScore []
}

export type DroidScore = {
    fallback_title: string,
    rank: string,
    score: number,
    embed_color: string | undefined,
    timestamp: number,
	statistics?:{
		accuracy?: Accuracy,
		pp: number,
		dpp: number,
		stars:{
			pc: number,
			droid: number
		} 
		fc?:{
			pp: number,
			dpp: number,
			accuracy: number
		},
	}
    scraped_dpp: number
    accuracy: number,
    mods: string[],
    combo: number
    misses: number,
    hash: string,
    beatmap: MapInfo | undefined
	user: DroidUser
}

export type DroidMods = {
    str: string,
    speed: number
}

export type ScorePerformanceData = {
    performance: {
        pp: number | undefined,
        dpp: number | undefined,
        stars_dr: number | undefined,
        stars_pc: number | undefined,
    },
    performance_fc: {
        pp: number | undefined,
        dpp: number | undefined,
        accuracy: number | undefined
    }
}

export type DroidPPBoardUser = {
	uid: number,
	username: string,
	pptotal: number,
	pp: DroidPPBoardScore[],
}

export type DroidPPBoardScore = {
	uid: number,
	hash: string,
	title: string,
	pp: number,
	mods: string,
	accuracy: number,
	combo: number,
	miss: number,
	speedMultiplier: number
}