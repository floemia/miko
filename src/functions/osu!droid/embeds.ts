import { EmbedBuilder, HexColorString,  } from "discord.js";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { client } from "../..";
import * as fs from "fs"
import { format_double_dec } from "../utils";
import { DroidScoreExtended, NewDroidUser, miko} from "miko-modules";
import { DroidScore, DroidUser } from "./types";

const score = async (score: DroidScoreExtended) => {
	const rank = await osu.emoji.rank(score.rank)
	let dpp_no_penalty = `~~${score.performance.dpp_no_penalty?.toFixed(2)}~~ `
	let dpp = score.performance.dpp?.toFixed(2) || "--"
	let pp = score.performance.pp?.toFixed(2) || "--"
	let fc = score.beatmap ? score.count.nMiss != 0 || score.combo < score.beatmap?.maxCombo! - 10 : false
	let if_fc = fc ? `**( ${score.performance.fc.dpp!.toFixed(2)} DPP ❘ ${score.performance.fc.pp!.toFixed(2)} PP ➜ FC ${score.performance.fc.accuracy!.toFixed(2)}% )**` : ""
	
	const statistics = `[${score.count?.n300}/${score.count?.n100}/${score.count?.n50}/${score.count?.nMiss}]`
	const pp_string = `${score.performance.penalty ? dpp_no_penalty : ""}${dpp} DPP ❘ ${pp} PP${fc ? ` ${if_fc}` : ``}`
	const mods_string = `${score.mods.acronyms.length ? `+${score.mods.acronyms.join("")}` : ''} ${score.mods.speed != 1 ? `(${score.mods.speed.toFixed(2)}x)` : ``}`
	const stars_string = score.stars.droid ? `${score.stars.osu!.toFixed(2)}⭐` : ''
	const embed = new EmbedBuilder()
	if (!score.beatmap) {
		embed.setAuthor({ name: `${score.filename} ${mods_string}`, iconURL: score.user.avatar_url })
	} else {
		embed.setAuthor({ name: `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] ${stars_string} ${mods_string}`, iconURL: score.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}` })
	}
	embed.setDescription(`> ${rank}**・${pp_string}・${format_double_dec(score.accuracy * 100)}%・**${statistics}**・**${score.score.toLocaleString("en-US")}**・${score.combo.toLocaleString("en-US")}x${score.beatmap?.maxCombo ? `/${score.beatmap.maxCombo.toLocaleString("en-US")}x` : ''}**`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${score.color.slice(1)}`))

	embed.setTimestamp(score.played_date)
	if (score.color != "#dedede") {
		embed.setImage(`https://assets.ppy.sh/beatmaps/${score.beatmap?.beatmapSetId}/covers/cover.jpg`)
	}

	return embed
}

const card = async (user: DroidUser, scores: DroidScore[]) => {
	const card = (await droid.card({ user: user, scores: scores }))!
	await fs.promises.writeFile(`./${user.id}-${user.username}.png`, card)
	const embed = new EmbedBuilder()
	.setColor(Number(`0x${user.color.slice(1)}`))
	.setAuthor({name: `osu!droid・${user.username}`, iconURL: `https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1`, url: `https://osudroid.moe/profile.php?uid=${user.id}`})
	.setImage(`attachment://${user.id}-${user.username}.png`)
	.setTimestamp()
	.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	return embed
}


// const top = async (embed: EmbedBuilder, scores: DroidScore[], index: number) => {
// 	index = 5* index
// 	const final_list: {name: string, value: string}[] = []
// 	for await (const score of scores) {
// 		if (!score.beatmap){
// 			const beatmapInfo = await MapInfo.getInformation(score.hash);
// 			if (beatmapInfo?.title) {
// 					score.beatmap = beatmapInfo
// 					await droid.calculate(score)
// 			}
// 		}
// 		const mods = droid.mods(score.mods)
// 		const mods_str = `${mods.str ? `+${mods.str}` : ''} ${mods.speed != 1 ? `(${mods.speed.toFixed(2)}x)` : ``}`
// 		const title = score.beatmap ? `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}]` : score.fallback_title
// 		final_list.push({
// 			name: `**${index + 1}・**${title} ${mods_str}`,
// 			value: `> **${osu.emoji.rank(score.rank)}・${format_double_dec(score.accuracy)}%・**${score.misses}**・${score.scraped_dpp} DPP**`
// 		})
// 		index++
// 	}
// 	return embed.setFields(final_list)
// } 
export const embed = { score, card }