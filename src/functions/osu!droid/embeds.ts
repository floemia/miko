import { EmbedBuilder } from "discord.js";
import { DroidScoreScraped } from "./scrape";
import { droid } from "./functions";
import { rank_emoji } from "../osu/functions";
import { client } from "../..";

const score = async (recent: DroidScoreScraped) => {
    const mods = await droid.mods(recent.mods)
    const rank = await rank_emoji(recent.rank)
    const embed = new EmbedBuilder()
    if (!recent.beatmap) {
        embed.setAuthor({name: recent.fallback_title, iconURL: recent.user.avatar_url})
    } else { embed.setAuthor({name: `${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}] ${recent.performance.stars_pc ? `${recent.performance.stars_pc.toFixed(2)} ⭐`: ''} ${mods.str? `+ ${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: recent.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${recent.beatmap.beatmapsetID}#osu/${recent.beatmap.beatmapID}`})}
    embed.setDescription(`> ${rank} | **${recent.scraped_pp ? recent.scraped_pp.toFixed(2) : `...`} DPP  ─  ${recent.performance.pp ? `${recent.performance.pp?.toFixed(2)}` : '...'} PP**\n> ${recent.score.toLocaleString("en-US")} | ${recent.accuracy.toFixed(2)}% | ${recent.combo.toLocaleString("en-US")}x${recent.beatmap? ` / ${recent.beatmap.maxCombo.toLocaleString("en-US")}x`: ''}`)
    embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
    embed.setColor(Number(`0x${recent.embed_color?.slice(1)}`))
    embed.setTimestamp(recent.timestamp - 7200000)
    if (recent.embed_color != "#dedede"){
        embed.setImage(`https://assets.ppy.sh/beatmaps/${recent.beatmap?.beatmapsetID}/covers/cover.jpg`)
    }
    
    return embed
}

export const embed = { score }