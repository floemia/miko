import { EmbedBuilder } from "discord.js";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { client } from "../..";
import * as fs from "fs"
import { format_double_dec } from "../utils";
import { DroidCalculatedData, DroidScoreExtended, NewDroidUser, miko } from "miko-modules";
import { DroidScore, DroidUser } from "./types";
import { v2 } from "osu-api-extended";

const score = async (score: DroidScoreExtended) => {
	const rank = await osu.emoji.rank(score.rank)
	let dpp_no_penalty = `**~~${score.performance.dpp_no_penalty?.toFixed(2)}~~ **`
	let dpp = score.performance.dpp?.toFixed(2) || "--"
	let pp = score.performance.pp?.toFixed(2) || "--"
	let if_fc = score.performance.fc ? `**(${score.performance.fc.dpp.toFixed(2)}dpp ❘ ${score.performance.fc.pp.toFixed(2)}pp ➜ FC ${score.performance.fc.accuracy.toFixed(2)}%)**` : ""

	const statistics = `[${score.count?.n300}/${score.count?.n100}/${score.count?.n50}/${score.count?.nMiss}]`
	const pp_string = `${score.performance.penalty ? dpp_no_penalty : ""}${dpp}dpp ❘ ${pp}pp${score.performance.fc ? ` ${if_fc}` : ``}`
	const mods_string = `${score.mods.acronyms.length ? `+${score.mods.acronyms.join("")}` : ''} ${score.mods.speed != 1 ? `(${score.mods.speed.toFixed(2)}x)` : ``}`
	const stars_string = score.stars.droid ? `${score.stars.osu!.toFixed(2)}⭐` : ''
	const embed = new EmbedBuilder()
	if (!score.beatmap) {
		embed.setAuthor({ name: `${score.filename} ${mods_string}`, iconURL: score.user!.avatar_url })
	} else {
		embed.setAuthor({ name: `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] ${mods_string} ${stars_string} `, iconURL: score.user!.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}` })
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
		.setAuthor({ name: `osu!droid・${user.username}`, iconURL: `https://cdn.discordapp.com/emojis/1021473577951821824.png?v=1`, url: `https://osudroid.moe/profile.php?uid=${user.id}` })
		.setImage(`attachment://${user.id}-${user.username}.png`)
		.setTimestamp()
		.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	return embed
}

const calculate = async (data: DroidCalculatedData) => {

	const time_formatted = (time: number) => {
		let minutes = Math.floor(time / 60)
		let seconds = Math.floor(time % 60)
		return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
	}

	const rank = await osu.emoji.rank(data.rank)
	let dpp = data.performance.dpp!.toFixed(2) || "--"
	let pp = data.performance.pp!.toFixed(2) || "--"
	let statistics = `[${data.count.n300}/${data.count.n100}/${data.count.n50}/${data.count.nMiss}]`
	let oss = data.rating.osu
	let droid = data.rating.droid

	let mult_cs = 1
	let mult_hp = 1

	if (data.mods.acronyms.includes("EZ")) {
		mult_cs = 0.5
		mult_hp = 0.5
	}
	if (data.mods.acronyms.includes("HR")) {
		mult_cs = 1.3
		mult_hp = 1.4
	}
	let ar = oss.attributes.approachRate.toLocaleString("en-US", { maximumFractionDigits: 2 })
	let od = oss.attributes.overallDifficulty.toLocaleString("en-US", { maximumFractionDigits: 2 })
	let cs = Math.min(oss.beatmap.difficulty.cs * mult_cs, 10).toLocaleString("en-US", { maximumFractionDigits: 2 })
	let hp = Math.min(oss.beatmap.difficulty.hp * mult_hp, 10).toLocaleString("en-US", { maximumFractionDigits: 2 })
	let beatmap = await v2.beatmap.id.lookup({ id: data.beatmap.beatmapId })
	let speed = 1
	if (data.mods.acronyms.includes("HT")) speed = 0.75
	if (data.mods.acronyms.includes("DT") || data.mods.acronyms.includes("NC")) speed = 1.5
	if (data.mods.speed != 1) speed *= data.mods.speed
	let total_length = beatmap.total_length / speed

	let length_str = time_formatted(total_length)
	let default_length_str = time_formatted(beatmap.total_length)

	let mods_string = `${data.mods.acronyms.length ? `+${data.mods.acronyms.join("")}` : ''}` || "+NM"
	if (data.mods.speed != 1) mods_string = `${mods_string} (${data.mods.speed.toFixed(2)}x)`	
	let title = `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title}`
	let beatmap_url = `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}`
	let star_rating = data.rating.osu.total
	let diff_emoji = osu.emoji.difficulty("osu", star_rating)

	let time_emoji = `<:time:1005980377304793190>`
	let bpm_emoji = `<:bpm:1005980375387996241>`
	let circle_emoji = `<:circle:1005980371881574492>`
	let slider_emoji = `<:slider:1005980368081522841>`
	let ranked_str = "" 
	switch (beatmap.ranked) {
		case -2: 
			ranked_str = "Graveyard"
			break;
		case -1: 
			ranked_str = "WIP"
			break;
		case 0: 
			ranked_str = "Unranked"
			break;
		case 1: 
			ranked_str = "Ranked"
			break;
		case 2: 
			ranked_str = "Approved"
			break;
		case 3: 
			ranked_str = "Qualified"
			break;
		case 4: 
			ranked_str = "Loved"
			break;
	}

	let time_str = `${length_str}${speed != 1 ? ` (${default_length_str})` : ""}`
	let bpm_str = `${(beatmap.bpm * speed).toFixed(2)}${speed != 1 ? ` (${beatmap.bpm})` : ""}`
	let avatar_url = `https://a.ppy.sh/${beatmap.beatmapset.user_id}`
	let creator_url = `https://osu.ppy.sh/users/${beatmap.beatmapset.user_id}`
	let embed = new EmbedBuilder()
	.setAuthor({ name: `Mapset by ${beatmap.beatmapset.creator}`, url: creator_url, iconURL: avatar_url})
	.setURL(beatmap_url)
	.setTitle(title)
	.addFields({
		name: `${diff_emoji} **[${beatmap.version}]** [${star_rating.toLocaleString("en-US", {maximumFractionDigits: 2})}⭐]`,
		value: `${time_emoji} \`${time_str}\`・${bpm_emoji} \`${bpm_str}\`・${circle_emoji} \`${beatmap.count_circles}\`・${slider_emoji} \`${beatmap.count_sliders}\``
		+ `\n**AR: \`${ar}\`・OD: \`${od}\`・CS: \`${cs}\`・HP: \`${hp}\`**`
		+ `\n> ${rank}**・\`${mods_string}\`・${dpp}dpp | ${pp}pp・${format_double_dec(data.accuracy * 100)}%・**${statistics}**・${data.combo.toLocaleString("en-US")}x/${beatmap.max_combo.toLocaleString("en-US")}x**`
	})
	.setImage(beatmap.beatmapset.covers["cover@2x"])
	.setColor(Number(`0x${data.color.slice(1)}`))
	.setFooter({ text: `${ranked_str}`})
	return embed
}
const top = async (user: NewDroidUser, scores: DroidScoreExtended[], page: number) => {
	let i = (5 * page) + 1
	let embed = new EmbedBuilder()
	for (const score of scores) {
		const rank = await osu.emoji.rank(score.rank)
		let dpp = score.performance.dpp?.toFixed(2) || "--"
		let score_amount = Intl.NumberFormat('en-US', {
			notation: "compact",
			maximumFractionDigits: 1
		}).format(score.score);

		// let title = score.filename.slice( score.filename.indexOf(" - ") + 3, score.filename.length )
		// const mapper = score.filename.slice(0, score.filename.indexOf("[")).slice(score.filename.lastIndexOf("("), score.filename.lastIndexOf(")") + 1)
		// title = title.replace(`${mapper} `, "")

		const statistics = `[${score.count?.n300}/${score.count?.n100}/${score.count?.n50}/${score.count?.nMiss}]`
		let mods_string = `${score.mods.acronyms.length ? `+${score.mods.acronyms.join("")}` : ''}` || "+NM"
		if (score.mods.speed != 1) mods_string = `${mods_string} (${score.mods.speed.toFixed(2)}x)`
		embed.addFields({
			name: `**#${i}・${score.filename} \`${mods_string}\`**`,
			value: `> ${rank}**・${dpp}dpp・${format_double_dec(score.accuracy * 100)}%・**${statistics}・**\`${score_amount}\`・${score.combo.toLocaleString("en-US")}x・**<t:${score.played_date.valueOf() / 1000}:R>`,
		})
		i++
	}
	let dpp = user.dpp.toLocaleString("en-US", { maximumFractionDigits: 2 })
	let global_rank = user.rank.global.toLocaleString("en-US", { maximumFractionDigits: 2 })
	let country_rank = user.rank.country.toLocaleString("en-US", { maximumFractionDigits: 2 })
	let region = user.region.toUpperCase()
	embed.setAuthor({ name: `${user.username}・${dpp}dpp (#${global_rank}・${region}${country_rank})`, iconURL: `https://new.osudroid.moe/flags/${user.region.toUpperCase()}.png`, url: `https://osudroid.moe/profile.php?uid=${user.id}` })
	embed.setColor(Number(`0x${user.color.slice(1)}`))
	embed.setThumbnail(user.avatar_url)
	embed.setTimestamp()
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	return embed
}
export const embed = { score, card, top, calculate }