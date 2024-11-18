import { Accuracy, MapInfo } from "@rian8337/osu-base"
import { DroidScore as ScrapedDroidScore, DroidUser as ScrapedDroidUser } from "osu-droid-scraping"

export interface DroidUser extends ScrapedDroidUser {
	color: string
}
export interface DroidScore extends ScrapedDroidScore {
	color: string,
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
    beatmap: MapInfo | undefined
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