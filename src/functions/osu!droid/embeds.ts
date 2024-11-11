import { EmbedBuilder,  } from "discord.js";
import { DroidScore, DroidUser } from "./types";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { generate_card } from "./card";
import { MapInfo } from "@rian8337/osu-base";
import { client } from "../..";
import * as fs from "fs"
import { format_double_dec } from "../utils";

const score = async (score: DroidScore) => {
	if (!score.beatmap){
		const beatmapInfo = await MapInfo.getInformation(score.hash);
		if (beatmapInfo?.title) {
				score.beatmap = beatmapInfo
				await droid.calculate(score)
		}
	}

	const mods = await droid.mods(score.mods)
	const rank = osu.emoji.rank(score.rank)
	const count = score.statistics?.accuracy
	const statistics = `[${count?.n300}/${count?.n100}/${count?.n50}/${count?.nmiss}]`
	const pp_string = `${score.statistics ? `${score.statistics.dpp.toFixed(2)} DPP ❘ ${score.statistics.pp.toFixed(2)} PP` : `?? DPP ❘ ?? PP`}${ score.statistics && score.statistics.fc ? `・**( ${score.statistics.fc.dpp.toFixed(2)} DPP ❘ ${score.statistics.fc.pp.toFixed(2)} PP ➜ FC ${score.statistics.fc.accuracy.toFixed(2)}% )**` : ''}`
	const embed = new EmbedBuilder()
	if (!score.beatmap) {
		embed.setAuthor({ name: score.fallback_title, iconURL: score.user.avatar_url })
	} else {
		embed.setAuthor({ name: `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] ${score.statistics ? `${score.statistics.stars.pc.toFixed(2)}⭐` : ''} ${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: score.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}` })
	}
	embed.setDescription(`> ${rank}**・${pp_string}・${format_double_dec(score.accuracy)}%・**${score.score.toLocaleString("en-US")}**・${score.combo.toLocaleString("en-US")}x${score.beatmap?.maxCombo ? `/${score.beatmap.maxCombo.toLocaleString("en-US")}x` : ''}・**${score.misses} ❌`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${score.embed_color?.slice(1)}`))
	embed.setTimestamp(score.timestamp - 3600000)
	if (score.embed_color != "#dedede") {
		embed.setImage(`https://assets.ppy.sh/beatmaps/${score.beatmap?.beatmapSetId}/covers/cover.jpg`)
	}

	return embed
}

const card = async (user: DroidUser) => {
	const score = await generate_card(user)

	await fs.promises.writeFile(`./${user.id}-${user.username}.png`, score)
	const embed = new EmbedBuilder()
	.setColor(Number(`0x${user.color.slice(1)}`))
	.setAuthor({name: `osu!droid・${user.username}`, iconURL: `https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1`, url: `https://osudroid.moe/profile.php?uid=${user.id}`})
	.setImage(`attachment://${user.id}-${user.username}.png`)
	.setTimestamp()
	.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })

	return embed
}


const top = async (embed: EmbedBuilder, scores: DroidScore[], index: number) => {
	index = 5* index
	const final_list: {name: string, value: string}[] = []
	for await (const score of scores) {
		if (!score.beatmap){
			const beatmapInfo = await MapInfo.getInformation(score.hash);
			if (beatmapInfo?.title) {
					score.beatmap = beatmapInfo
					await droid.calculate(score)
			}
		}
		const mods = droid.mods(score.mods)
		const mods_str = `${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``}`
		const title = score.beatmap ? `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]` : score.fallback_title
		final_list.push({
			name: `**${index + 1}・**${title} ${mods_str}`,
			value: `> **${osu.emoji.rank(score.rank)}・${format_double_dec(score.accuracy)}%・**${score.misses}**・${score.scraped_dpp} DPP**`
		})
		index++
	}
	return embed.setFields(final_list)
} 
export const embed = { score, card, top }