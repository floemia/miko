import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { DroidScoreScraped } from "./types";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { generate_card } from "./card";
import { MapInfo } from "@rian8337/osu-base";
import { client } from "../..";
import * as fs from "fs"

const score = async (data: DroidScoreScraped) => {
	if (!data.beatmap){
		const beatmapInfo = await MapInfo.getInformation(data.hash);
		if (beatmapInfo?.title) {
				data.beatmap = beatmapInfo
				await droid.calculate(data)
		}
	}

	
	const mods = await droid.mods(data.mods)
	const rank = osu.emoji.rank(data.rank)
	const pp_string = `${data.performance.dpp ? `${data.performance.dpp.toFixed(2)} DPP ❘ ${data.performance.pp?.toFixed(2)} PP` : `?? DPP ❘ ?? PP`}${data.performance_fc.dpp ? `・**( ${data.performance_fc.dpp.toFixed(2)} DPP ❘ ${data.performance_fc.pp?.toFixed(2)} PP ➜ FC ${data.performance_fc.accuracy?.toFixed(2)}% )**` : ''}\n> `

	
	const embed = new EmbedBuilder()
	if (!data.beatmap) {
		embed.setAuthor({ name: data.fallback_title, iconURL: data.user.avatar_url })
	} else {
		embed.setAuthor({ name: `${data.beatmap.artist} - ${data.beatmap.title} [${data.beatmap.version}] ${data.performance.stars_pc ? `${data.performance.stars_pc.toFixed(2)}⭐` : ''} ${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: data.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${data.beatmap.beatmapSetId}#osu/${data.beatmap.beatmapId}` })
	}

	embed.setDescription(`> ${rank}**・${pp_string}${data.accuracy.toFixed(2)}%・**${data.score.toLocaleString("en-US")}**・**${data.combo.toLocaleString("en-US")}x${data.beatmap?.maxCombo ? ` / ${data.beatmap.maxCombo.toLocaleString("en-US")}x` : ''}**・**${data.misses} ❌`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${data.embed_color?.slice(1)}`))
	embed.setTimestamp(data.timestamp - 7200000)
	if (data.embed_color != "#dedede") {
		embed.setImage(`https://assets.ppy.sh/beatmaps/${data.beatmap?.beatmapSetId}/covers/cover.jpg`)
	}

	return embed
}

const card = async (score_list: DroidScoreScraped[]) => {
	const data = await generate_card(score_list)
	const user = score_list[0].user

	await fs.promises.writeFile(`./${user.id}-${user.username}.png`, data)
	const embed = new EmbedBuilder()
	.setColor(Number(`0x${user.color.slice(1)}`))
	.setAuthor({name: `osu!droid・Perfil de ${user.username}`, iconURL: `https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1`, url: `https://osudroid.moe/profile.php?uid=${user.id}`})
	.setImage(`attachment://${user.id}-${user.username}.png`)
	.setTimestamp()
	.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })

	return embed
}

export const embed = { score, card }