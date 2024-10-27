import { EmbedBuilder,  } from "discord.js";
import { DroidScore, DroidUser } from "./types";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { generate_card } from "./card";
import { MapInfo } from "@rian8337/osu-base";
import { client } from "../..";
import * as fs from "fs"

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
	const pp_string = `${score.statistics ? `${score.statistics.dpp.toFixed(2)} DPP ❘ ${score.statistics.pp.toFixed(2)} PP` : `?? DPP ❘ ?? PP`}${ score.statistics && score.statistics.fc ? `・**( ${score.statistics.fc.dpp.toFixed(2)} DPP ❘ ${score.statistics.fc.pp.toFixed(2)} PP ➜ FC ${score.statistics.fc.accuracy.toFixed(2)}% )**` : ''}\n> `
	const embed = new EmbedBuilder()
	if (!score.beatmap) {
		embed.setAuthor({ name: score.fallback_title, iconURL: score.user.avatar_url })
	} else {
		embed.setAuthor({ name: `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] ${score.statistics ? `${score.statistics.stars.pc.toFixed(2)}⭐` : ''} ${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``} `, iconURL: score.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}` })
	}

	embed.setDescription(`> ${rank}**・${pp_string}${score.accuracy.toFixed(2)}%・**${score.score.toLocaleString("en-US")}**・**${score.combo.toLocaleString("en-US")}x${score.beatmap?.maxCombo ? ` / ${score.beatmap.maxCombo.toLocaleString("en-US")}x` : ''}**・**${score.misses} ❌`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${score.embed_color?.slice(1)}`))
	embed.setTimestamp(score.timestamp - 7200000)
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
	.setAuthor({name: `osu!droid・Perfil de ${user.username}`, iconURL: `https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1`, url: `https://osudroid.moe/profile.php?uid=${user.id}`})
	.setImage(`attachment://${user.id}-${user.username}.png`)
	.setTimestamp()
	.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })

	return embed
}

export const embed = { score, card }