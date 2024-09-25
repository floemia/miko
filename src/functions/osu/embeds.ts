import { EmbedBuilder } from "discord.js";
import { response } from "osu-api-extended/dist/types/v2_scores_user_category";
import { getAverageColor } from "fast-average-color-node";
import { difficulty_emoji, int_short_gamemode, rank_emoji } from "./functions";
import { client } from "../..";
import { tools } from "osu-api-extended";
import * as fs from "fs"
import * as rosu from "rosu-pp-js"

export const osu_score_embed = async (recent: response) => {
    var color = {
        hex: "#dedede"
    }
    var image = "https://i.ibb.co/nMLJpTK/page-dark.png"
    if (recent.beatmapset.covers["card@2x"]) {
        try {
            color = await getAverageColor(recent.beatmapset.covers["card@2x"])
            image = recent.beatmapset.covers["card@2x"]
        } catch (error) {
            console.log(error)
        }
    }

    const path = await tools.download.difficulty(recent.beatmap_id, "./", `${recent.beatmap_id}`)
    const beatmap = fs.readFileSync(`${path}`)
    
    let map = new rosu.Beatmap(beatmap)
    const calc = new rosu.Performance({
        mods: recent.mods.map(x => x.acronym).join("") || "",
        misses: recent.statistics.miss,
        n300: recent.statistics.great,
        n100: recent.statistics.ok,
        n50: recent.statistics.meh,
        combo: recent.max_combo
    })

    var adjust = ""
    recent.mods.forEach(mod => {
        if (mod.settings) {
            if (mod.settings.speed_change) {
                calc.clockRate = mod.settings.speed_change
                adjust = adjust.concat(`(${mod.settings.speed_change}x`)
            }
            if (mod.settings.approach_rate != undefined) {
                calc.ar = mod.settings.approach_rate
                calc.arWithMods = true 
                adjust = adjust.concat(adjust ? `, AR = ${mod.settings.approach_rate}`: `(AR = ${mod.settings.approach_rate}`)
            }

            if (mod.settings.overall_difficulty != undefined) {
                calc.od = mod.settings.overall_difficulty
                calc.odWithMods = true
                adjust = adjust.concat(adjust ? `, OD = ${mod.settings.overall_difficulty}`: `(OD = ${mod.settings.overall_difficulty}`)
            }

            if (mod.settings.circle_size != undefined) {
                calc.cs = mod.settings.circle_size
                calc.csWithMods = true 
                adjust = adjust.concat(adjust ? `, CS = ${mod.settings.circle_size}`: `(CS = ${mod.settings.circle_size}`)
            }

            if (mod.settings.drain_rate != undefined) {
                calc.hp = mod.settings.drain_rate
                calc.hpWithMods = true 
                adjust = adjust.concat(adjust ? `, HP = ${mod.settings.drain_rate}`: `(HP = ${mod.settings.drain_rate}`)
            }
            if (adjust) adjust = adjust.concat(")")
        }
    })

    const performance = calc.calculate(map)
    if (calc.misses) {
        calc.n300 = (calc.n300 || 0 + calc.misses)
        calc.misses = 0
    }
    const performance_fc = calc.calculate(map)
    
    map.free()
    // const sr_emoji = difficulty_emoji(int_short_gamemode(recent.beatmap.mode_int), recent.beatmap.difficulty_rating)
    const rk_emoji = rank_emoji(recent.passed ? recent.rank : "F")
    const statistics = `[${recent.statistics.great || 0}/${recent.statistics.ok || 0}/${recent.statistics.meh || 0}/${recent.statistics.miss || 0}]`
    const embed = new EmbedBuilder()
    .setAuthor({ iconURL: recent.user.avatar_url, name: `${recent.beatmapset.artist} - ${recent.beatmapset.title} [${recent.beatmap.version}] (${performance.difficulty.stars.toFixed(2)} ★) + ${recent.mods.map(x => x.acronym).join("") || "NM"} ${adjust}`, url: `https://osu.ppy.sh/beatmapsets/${recent.beatmapset.id}#${recent.beatmap.mode}/${recent.beatmap.id}` || undefined })
    .setDescription(`> ${rk_emoji} • ${performance.pp.toFixed(2)}${recent.statistics.miss || 0 > 0 ? ` | ${performance_fc.pp.toFixed(2)} - FC` : ''} •  ${(recent.accuracy*100).toFixed(2)}%\n> ${recent.total_score.toLocaleString("en-US")} • ${statistics} • **${recent.max_combo.toLocaleString("en-US")}x**`)
    .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
    .setColor(Number(`0x${color.hex.substring(1)}`))
    .setTimestamp(new Date(recent.ended_at))
    .setImage(image)

    return embed
}
