import { Accuracy, ModUtil } from "@rian8337/osu-base"
import { scrape } from "./scrape"
import { DroidDifficultyCalculator, DroidPerformanceCalculator, OsuDifficultyCalculator, OsuPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
import { embed } from "./embeds"
import { DroidScoreScraped, DroidMods, ScorePerformanceData } from "./types"
const user = async (uid: number) => {
    return await scrape.user(uid)
}

const recent = async (uid: number) => {
    return await scrape.scores({uid: uid, type: "recent"})
}

const best = async (uid: number) => {
    return await scrape.scores({uid: uid, type: "best"})
}

const scores = { recent, best }

const mods = async (mods_arr: string[]): Promise<DroidMods> => {
    var mods = {
        str: '',
        speed: 1.0,
    }
    for await (const mod of mods_arr) {

        switch (mod.toLowerCase()) {
            case "easy": mods.str = mods.str.concat("EZ"); break;
            case "nofail": mods.str = mods.str.concat("NF"); break;
            case "halftime": mods.str = mods.str.concat("HT"); break;
            case "hardrock": mods.str = mods.str.concat("HR"); break;
            case "hidden": mods.str = mods.str.concat("HD"); break;
            case "doubletime": mods.str = mods.str.concat("DT"); break;
            case "nightcore": mods.str = mods.str.concat("NC"); break;
            case "flashlight": mods.str = mods.str.concat("FL"); break;
            case "suddendeath": mods.str = mods.str.concat("SD"); break;
            case "perfect": mods.str = mods.str.concat("PF"); break;
            case "precise": mods.str = mods.str.concat("PR"); break;
			case "none": mods.str = ""; break;
            case "": break;
            default: mods.speed = Number(mod)
        }
    }
    return mods
}

const calculate = async (recent: DroidScoreScraped): Promise<ScorePerformanceData> => {

    const mods_all = await droid.mods(recent.mods)
    const mods = ModUtil.pcStringToMods(mods_all.str)


    if (recent.beatmap?.beatmap) {
		const stats_droid = new DroidDifficultyCalculator(recent.beatmap.beatmap).calculate({
			mods: mods,
			customSpeedMultiplier:mods_all.speed
		})
		const stats_osu = new OsuDifficultyCalculator(recent.beatmap.beatmap).calculate({
			mods: mods,
			customSpeedMultiplier:mods_all.speed
		})

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

        if (recent.misses > 0) {
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

            recent.performance_fc.dpp = droid_perf_fc.total
            recent.performance_fc.pp = osu_perf_fc.total
            recent.performance_fc.accuracy = accuracy_fc.value() * 100
        }
        recent.performance.dpp = droid_perf.total
        recent.performance.stars_dr = droid_perf.difficultyAttributes.starRating 
        recent.performance.pp = osu_perf.total
        recent.performance.stars_pc = osu_perf.difficultyAttributes.starRating
    }
    return {
        performance: recent.performance,
        performance_fc: recent.performance_fc
    }
}



export const droid = { user, scores,  mods, calculate, embed }
