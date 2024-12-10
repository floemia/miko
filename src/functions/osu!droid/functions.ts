import { Accuracy, ModUtil } from "@rian8337/osu-base"
import { DroidDifficultyCalculator, DroidPerformanceCalculator, OsuDifficultyCalculator, OsuPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
import { embed } from "./embeds"
import { DroidScore, DroidUser } from "./types"
import { average_color } from "../utils"
import { tracking } from "./tracking"
import { droid as droidModule, DroidScoreParameters, DroidUserParameters } from "osu-droid-scraping"
import { card } from "osu-droid-card"

const user = async (params: DroidUserParameters): Promise<DroidUser | undefined> => {
	const data = await droidModule.user(params)
	if (!data) return undefined
	const color = await average_color(data.avatar_url)
	const user: DroidUser = { ...data, color: color.hex }
	return user
}
const scores = async (params: DroidScoreParameters): Promise<DroidScore[] | undefined> => {
	const scores = await droidModule.scores(params)
	if (!scores) return undefined
	const arr_scores: DroidScore[] = []
	for (const score of scores) {
		arr_scores.push({
			...score,
			color: "#dedede",
			beatmap: undefined,
			statistics: undefined
		})
	}
	return arr_scores
}

const calculate = async (recent: DroidScore) => {
	const mods = ModUtil.pcStringToMods(recent.mods.acronyms.join(""))
	if (recent.beatmap?.beatmap) {
		let options = {
			mods: mods,
			customSpeedMultiplier: recent.mods.speed
		}
		const stats_droid = new DroidDifficultyCalculator(recent.beatmap.beatmap).calculate(options)
		const stats_osu = new OsuDifficultyCalculator(recent.beatmap.beatmap).calculate(options)

		const accuracy = new Accuracy({
			nmiss: recent.misses,
			percent: recent.accuracy,
			nobjects: recent.beatmap.objects
		})

		const droid_perf = new DroidPerformanceCalculator(stats_droid.attributes).calculate({
			miss: recent.misses,
			combo: recent.combo,
			accPercent: accuracy,
		});

		const osu_perf = new OsuPerformanceCalculator(stats_osu.attributes).calculate({
			miss: recent.misses,
			combo: recent.combo,
			accPercent: accuracy,
		});
		recent.color = (await average_color(`https://assets.ppy.sh/beatmaps/${recent.beatmap.beatmapSetId}/covers/cover.jpg`)).hex
		recent.statistics = {
			accuracy: droid_perf.computedAccuracy,
			dpp: droid_perf.total,
			stars: {
				pc: osu_perf.difficultyAttributes.starRating,
				droid: droid_perf.difficultyAttributes.starRating
			},
			pp: osu_perf.total
		}

		if (recent.misses > 0 || recent.combo - recent.beatmap.beatmap.maxCombo > 5 && recent.combo < recent.beatmap.beatmap.maxCombo) {
			const accuracy_fc = new Accuracy({
				nmiss: 0,
				n300: accuracy.n300 + recent.misses,
				n100: accuracy.n100,
				n50: accuracy.n50,
				nobjects: recent.beatmap.objects
			})
			const droid_perf_fc = new DroidPerformanceCalculator(stats_droid.attributes).calculate({
				accPercent: accuracy_fc,
			});

			const osu_perf_fc = new OsuPerformanceCalculator(stats_osu.attributes).calculate({
				accPercent: accuracy,
			});

			recent.statistics.fc = {
				pp: osu_perf_fc.total,
				dpp: droid_perf_fc.total,
				accuracy: accuracy_fc.value() * 100
			}
		}
		return {
			pp: osu_perf.total,
			dpp: droid_perf.total
		}
	}
}
type response = {
	UserId: number,
	error?: string
}
const get_uid = async (username: string) => {
	const response = await fetch(`https://new.osudroid.moe/apitest/profile-username/${username}`)
	if (!response.ok){
		return undefined
	}
	const data: response =  JSON.parse(await response.text())
	return data.error? undefined : data.UserId

}

const request = droidModule.request
export const droid = { user, scores, calculate, embed, tracking, request, card, get_uid }
