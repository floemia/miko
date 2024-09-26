import { EmbedBuilder } from "discord.js";
import { DroidScoreScraped } from "./scrape";
import { droid } from "./functions";
import { rank_emoji } from "../osu/functions";
import { client } from "../..";

const score = async (recent: DroidScoreScraped) => {
    const mods = await droid.mods(recent.mods)
    const rank = await rank_emoji(recent.rank)
	const pp_string = `${recent.performance.dpp ? `**${recent.performance.dpp.toFixed(2)} DPP ─ ${recent.performance.pp?.toFixed(2)} PP` : `?? DPP ─ ?? PP`}** ${recent.performance_fc.dpp ? `\n> ${recent.performance_fc.dpp.toFixed(2)} DPP ─ ${recent.performance_fc.pp?.toFixed(2)} PP ➜ FC ${recent.performance_fc.accuracy?.toFixed(2)}%`: ''}`
    const embed = new EmbedBuilder()
    if (!recent.beatmap) {
        embed.setAuthor({name: recent.fallback_title, iconURL: recent.user.avatar_url})
    } else { embed.setAuthor({name: `${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}] ${recent.performance.stars_pc ? `${recent.performance.stars_pc.toFixed(2)} ⭐`: ''} ${mods.str? ` +${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: recent.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${recent.beatmap.beatmapSetId}#osu/${recent.beatmap.beatmapId}`})}
    embed.setDescription(`> ${rank} | ${pp_string}\n> ${recent.score.toLocaleString("en-US")} | ${recent.accuracy.toFixed(2)}% | ${recent.combo.toLocaleString("en-US")}x${recent.beatmap?.maxCombo ? ` / ${recent.beatmap.maxCombo.toLocaleString("en-US")}x`: ''}`)
    embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
    embed.setColor(Number(`0x${recent.embed_color?.slice(1)}`))
    embed.setTimestamp(recent.timestamp - 7200000)
    if (recent.embed_color != "#dedede"){
        embed.setImage(`https://assets.ppy.sh/beatmaps/${recent.beatmap?.beatmapSetId}/covers/cover.jpg`)
    }
    
    return embed
}

export const embed = { score }