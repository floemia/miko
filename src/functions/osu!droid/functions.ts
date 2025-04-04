import { Accuracy, ModUtil } from "@rian8337/osu-base"
import { DroidDifficultyCalculator, DroidPerformanceCalculator, OsuDifficultyCalculator, OsuPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
import { embed } from "./embeds"
import { DroidScore, DroidUser, HitStatistics } from "./types"
import { average_color } from "../utils"
import { tracking } from "./tracking"
import { droid as droidModule, DroidScoreParameters, DroidUserParameters } from "osu-droid-scraping"
import { card } from "osu-droid-card"

const user = async (params: DroidUserParameters): Promise<DroidUser | { error: string }> => {
	const data = await droidModule.user(params)
	if ("error" in data) return data
	const color = await average_color(data.avatar_url)
	const user: DroidUser = { ...data, color: color.hex }
	return user
}

// const db_user = async (params: {uid?: number, username?: string, discord_user_id?: string})=> {

// }
const request = droidModule.request
export const droid = { user, embed, tracking, request, card }
