import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { DroidScoreScraped } from "./types";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { generate_card } from "./card";
import { client } from "../..";
import * as fs from "fs"

const score = async (recent: DroidScoreScraped) => {
	const mods = await droid.mods(recent.mods)
	const rank = osu.emoji.rank(recent.rank)
	const pp_string = `${recent.performance.dpp ? `${recent.performance.dpp.toFixed(2)} DPP ❘ ${recent.performance.pp?.toFixed(2)} PP` : `?? DPP ❘ ?? PP`}${recent.performance_fc.dpp ? `・**( ${recent.performance_fc.dpp.toFixed(2)} DPP ❘ ${recent.performance_fc.pp?.toFixed(2)} PP ➜ FC ${recent.performance_fc.accuracy?.toFixed(2)}% )**` : ''}\n> `

	const embed = new EmbedBuilder()
	if (!recent.beatmap) {
		embed.setAuthor({ name: recent.fallback_title, iconURL: recent.user.avatar_url })
	} else {
		embed.setAuthor({ name: `${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}] ${recent.performance.stars_pc ? `${recent.performance.stars_pc.toFixed(2)}⭐` : ''} ${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: recent.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${recent.beatmap.beatmapSetId}#osu/${recent.beatmap.beatmapId}` })
	}

	embed.setDescription(`> ${rank}**・${pp_string}${recent.accuracy.toFixed(2)}%・**${recent.score.toLocaleString("en-US")}**・**${recent.combo.toLocaleString("en-US")}x${recent.beatmap?.maxCombo ? ` / ${recent.beatmap.maxCombo.toLocaleString("en-US")}x` : ''}**・**${recent.misses} ❌`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${recent.embed_color?.slice(1)}`))
	embed.setTimestamp(recent.timestamp - 7200000)
	if (recent.embed_color != "#dedede") {
		embed.setImage(`https://assets.ppy.sh/beatmaps/${recent.beatmap?.beatmapSetId}/covers/cover.jpg`)
	}

	return embed
}

const card = async (recent_list: DroidScoreScraped[]) => {
	const data = await generate_card(recent_list)
	const user = recent_list[0].user

	await fs.promises.writeFile(`./${user.id}-${user.username}.png`, data)
	const embed = new EmbedBuilder()
	.setColor(Number(`0x${user.color.slice(1)}`))
	.setAuthor({name: user.username, iconURL: user.avatar_url, url: `https://osudroid.moe/profile.php?uid=${user.id}`})
	.setDescription(`<:droid_simple:1021473577951821824>  **osu!droid・**Perfil de  :flag_${user.country.toLowerCase()}:  **${user.username}**`)
	.setImage(`attachment://${user.id}-${user.username}.png`)
	.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })

	return embed
}

export const embed = { score, card }