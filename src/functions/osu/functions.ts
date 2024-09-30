import { response } from "osu-api-extended/dist/types/v2_scores_user_category";
import { client } from "../..";
import { OsuCodeGamemodes, OsuGamemodes, ScoreDifficultyData } from "./types";
import { embed } from "./embeds";
import * as rosu from "rosu-pp-js"
import * as fs from "fs"
import { tools } from "osu-api-extended";

export const code = (int: number): OsuCodeGamemodes =>  {
    switch (int) {
        case 0: return "osu"; break
        case 1: return "taiko"; break
        case 2: return "fruits"; break
        case 3: return "mania"; break
        default: return "osu"; break
    }
}
export const full = (int: number) =>  {
    switch (int) {
        case 0: return "<:osu:955183369954680922>  osu!";
        case 1: return "<:taiko:955183369912721428>  osu!taiko"; 
        case 2: return "<:ctb:955183369740775504>  osu!catch";
        case 3: return "<:mania:955183369816256523>  osu!mania";
        default: return "<:osu:955183369954680922>  osu!";
    }
}

export const difficulty = (mode: "osu" | "taiko" | "fruits" | "mania", SR: number) => {
    var rank = 1
    if (SR < 1.70) {
        rank = 1
    } else if (SR < 2.7) {
        rank = 2
    } else if (SR < 3.7) {
        rank = 3
    } else if (SR < 4.7) {
        rank = 4
    } else if (SR < 5.7) {
        rank = 5
    } else if (SR < 6.7) {
        rank = 6
    } else if (SR < 7.7) {
        rank = 7
    } else if (SR < 8.7) {
        rank = 8
    } else {
        rank = 9
    }
    const emoji = client.emojis.cache.find(emoji => emoji.name === `${mode}${rank}`)
    return emoji;
}

export const rank = (rank: string) => {
    switch (rank) {
        case "A":
            return client.emojis.cache.get('954909322503155722')
        case 'B':
            return client.emojis.cache.get('954909322540879892')
        case 'C':
            return client.emojis.cache.get('954909322515738654')
        case 'D':
            return client.emojis.cache.get('954909322117275719')
        case 'S':
            return client.emojis.cache.get('954909322167599125')
        case 'SH':
            return client.emojis.cache.get('954909322515738624')
        case 'X':
            return client.emojis.cache.get('954909954995798066')
        case 'XH':
            return client.emojis.cache.get('954909954966425631')
        case 'F':
            return client.emojis.cache.get('966098768908914778')
    }
}

const calculate = async (score: response): Promise<ScoreDifficultyData | undefined> => {
	const path = await tools.download.difficulty(score.beatmap.id, `./`, `${score.beatmap.id}`)
	if (!path) return
	const buffer_beatmap = fs.readFileSync(path)
	const beatmap = new rosu.Beatmap(buffer_beatmap)
	const statistics: any = score.statistics
	// any bc this api module doesnt care about other gamemodes, great.

	beatmap.convert(score.beatmap.mode_int)
	const fc_data = new rosu.Performance({
		mods: score.mods,
		nGeki: score.beatmap.mode == "mania" ? statistics.perfect + (statistics.miss || 0): undefined,
		n300: score.beatmap.mode == "mania" ? statistics.great : statistics.great + (statistics.miss || 0),
		nKatu: statistics.small_tick_miss || statistics.good,
		n100: statistics.ok,
		n50: statistics.meh,
	}).calculate(beatmap)

	const score_data = new rosu.Performance({
		mods: score.mods,
		misses: score.statistics.miss,
		accuracy: score.accuracy * 100,
		combo: score.max_combo,
	}).calculate(fc_data);
	beatmap.free()
	fs.unlinkSync(path)

	const accuracy_fc = tools.accuracy({ 300: `${fc_data.state?.n300}`, 100: `${fc_data.state?.n100}`, 50: `${fc_data.state?.n50}`, geki: `${fc_data.state?.nGeki}`, katu: `${fc_data.state?.nKatu}`, 0: "0"}, osu.gamemode.code(score.beatmap.mode_int))
	const performance_fc = {
		pp: Math.abs(score.max_combo - fc_data.difficulty.maxCombo) > 5 || score_data.state?.misses ? fc_data.pp : undefined,
		accuracy: accuracy_fc
	}
	return {
		pp: score_data.pp,
		fc: performance_fc,
		stars: score_data.difficulty.stars,
		combo: fc_data.difficulty.maxCombo
	}

	
}


const emoji = { rank, difficulty }
const gamemode = { code, full }

export const osu = { emoji, gamemode, calculate, embed }