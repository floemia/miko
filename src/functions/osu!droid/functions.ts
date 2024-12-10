import { Accuracy, ModUtil } from "@rian8337/osu-base"
import { DroidDifficultyCalculator, DroidPerformanceCalculator, OsuDifficultyCalculator, OsuPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
import { embed } from "./embeds"
import { DroidScore, DroidUser, HitStatistics } from "./types"
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

interface DroidScoresParametersExtended extends DroidScoreParameters {
	newdroid_response?: NewDroidResponse
}
const scores = async (params: DroidScoresParametersExtended): Promise<DroidScore[] | undefined> => {
	const scores = await droidModule.scores(params)
	
	if (!scores) return undefined
	const arr_scores: DroidScore[] = []
	let statistics: HitStatistics[] | undefined
	if (params.newdroid_response) statistics = (await droid.get_statistics(params.newdroid_response))[params.type == "recent" ? 1 : 0]
	let i = 0
	for (const score of scores) {
		arr_scores.push({
			...score,
			color: "#dedede",
			beatmap: undefined,
			statistics: undefined,
			count: statistics ? statistics[i++] : undefined
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
export type statistics = {
	MapGeki: number,
	MapPerfect: number,
	MapKatu: number,
	MapGood: number,
	MapBad: number,
	MapMiss: number,
}
export type NewDroidResponse = {
	UserId: number,
	error?: string
	Top50Plays: statistics[],
	Last50Scores: statistics[]
}
const request_newdroid = async (params: {username?: string, uid?: number}): Promise<NewDroidResponse | undefined> => {
	const response = await fetch(params.username? `https://new.osudroid.moe/apitest/profile-username/${params.username}`: `https://new.osudroid.moe/apitest/profile-uid/${params.uid}` )
	if (!response.ok){
		return undefined
	}
	return JSON.parse(await response.text())
}

const get_statistics = async (response: NewDroidResponse): Promise<HitStatistics[][]> => {
	let top50: HitStatistics[] = []
	let recent50: HitStatistics[] = []
	for (const stats of response.Top50Plays) {
		top50.push({
			nGeki: stats.MapGeki,
			n300: stats.MapPerfect,
			nKatu: stats.MapKatu,
			n100: stats.MapGood,
			n50: stats.MapBad,
			nMiss: stats.MapMiss
		})
	}
	for (const stats of response.Last50Scores) {
		recent50.push({
			nGeki: stats.MapGeki,
			n300: stats.MapPerfect,
			nKatu: stats.MapKatu,
			n100: stats.MapGood,
			n50: stats.MapBad,
			nMiss: stats.MapMiss
		})
	}
	return [top50, recent50]
}
const get_uid = async (response: NewDroidResponse | undefined) => {
	if (!response) return undefined
	return response.error? undefined : response.UserId
}

const request = droidModule.request
export const droid = { user, scores, calculate, embed, tracking, request, card, get_uid, get_statistics, request_newdroid }
