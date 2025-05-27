import { EmbedBuilder } from "discord.js";
import { droid } from "./functions";
import { osu } from "../osu/functions";
import { client } from "../..";
import * as fs from "fs"
import { format_double_dec, num_formatted, time_formatted } from "../utils";
import { DroidUser as OldDroidUser, DroidScore as OldDroidScore } from "./types";
import { DroidCalculatedData, DroidRXScore, DroidScore, DroidUser, DroidBanchoScore, DroidBanchoUser, DroidRXUser } from "miko-modules";
import { v2 } from "osu-api-extended";
import { MapInfo } from "@rian8337/osu-base";

const countryCodeToEmoji = (code: string): string => {
	const countryCode = code.toUpperCase();
	if (!/^[A-Z]{2}$/.test(countryCode)) return '';

	// Convert each character to its regional indicator symbol
	const OFFSET = 0x1F1E6 - 'A'.charCodeAt(0);
	return countryCode
		.split('')
		.map(char => String.fromCodePoint(char.charCodeAt(0) + OFFSET))
		.join('');
}

const score = async (score: DroidScore, user: DroidUser) => {
	let iBancho = (score instanceof DroidBanchoScore)
	const rank = await osu.emoji.rank(score.rank)
	let server_name = iBancho ? "iBancho" : "osudroid!relax"
	let server_icon = iBancho ? `https://cdn.discordapp.com/icons/316545691545501706/a_2e882927641c2b4bb15e514d4e2829c7.webp` : `https://cdn.discordapp.com/icons/1095653998389907468/a_82bf78e259e9cb4ba4d4ca355e28e0df.webp`
	const statistics = !process.env.NEW_DROID_HOTFIX ? `[${score.count?.n300}/${score.count?.n100}/${score.count?.n50}/${score.count?.nMiss}]` : `${score.count.nMiss}❌`
	let title = `${score.filename} ${score.modsString()}`
	let combo = `${score.combo.toLocaleString("en-US")}x`
	const total_score = score.total_score.toLocaleString("en-US")
	const accuracy = format_double_dec(score.accuracy * 100)
	let pp_string = ""
	if (score instanceof DroidRXScore) pp_string = `${score.pp!.toFixed(2)}pp`
	let diff_string = ""
	const embed = new EmbedBuilder()
	let status_emoji = osu.emoji.status(-2);
	let user_string = ""
	if (user instanceof DroidBanchoUser) {
		let dpp = user.stats.dpp.toLocaleString("en-US", { maximumFractionDigits: 2 });
		let global_rank = user.stats.rank.global.toLocaleString("en-US");
		user_string = `${user.username}・${dpp}dpp (#${global_rank}`
		if (user.country) {
			user_string += ` ${countryCodeToEmoji(user.country)} ${user.stats.rank.country})`
		} else user_string += ")"
	} else if (user instanceof DroidRXUser) {
		let pp = user.stats.pp.toLocaleString("en-US");
		if (user.country) {
			user_string = `${countryCodeToEmoji(user.country)} ${user.username}・${pp}pp (#${user.stats.rank})`
		}
		user_string = `${user.username}・${pp}pp (#${user.stats.rank})`
	}
	let if_fc_string = ""
	if (score.beatmap) {
		embed.setURL(`https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`)
		const diff = score.difficulty!
		const stars_string = diff.stars.droid ? `${diff.stars.osu!.toFixed(2)}⭐` : ''
		const bpm = num_formatted(diff.bpm!)
		let ar = num_formatted(diff.ar!)
		let od = num_formatted(diff.od!)
		let cs = num_formatted(diff.cs!)
		let hp = num_formatted(diff.hp!)
		let mods = score.modsString()
		status_emoji = osu.emoji.status(score.beatmap.approved);
		if (score instanceof DroidRXScore) mods = mods.replace("+", "+RX");
		title = `${score.beatmap.artist} - ${score.beatmap.title} [${score.beatmap.version}] [${stars_string}] ${mods}`
		combo += `/${score.beatmap.maxCombo!.toLocaleString("en-US")}x`;
		if (score instanceof DroidBanchoScore) pp_string += `${score.dpp!.toFixed(2)}dpp | ${score.pp!.toFixed(2)}pp`
		if (!score.isFC()) {
			const score_fc = await DroidScore.ifFC(score);
			if_fc_string = ` (${score instanceof DroidBanchoScore ? `${score_fc.dpp?.toFixed(2)}dpp | ` : ``}${score_fc.pp!.toFixed(2)}pp ➜ FC ${format_double_dec(score_fc.accuracy * 100)}%)`
		}
		diff_string = `\`BPM: ${bpm} AR: ${ar} OD: ${od} CS: ${cs} HP: ${hp}\``
		embed.setURL(`https://osu.ppy.sh/beatmapsets/${score.beatmap.beatmapSetId}#osu/${score.beatmap.beatmapId}`)
		embed.setImage(`https://assets.ppy.sh/beatmaps/${score.beatmap.beatmapSetId}/covers/cover.jpg`)
	}

	let description = ""
	if (!score.beatmap) description = `> ${rank}**・${total_score}・${accuracy}%・**${statistics}**・${combo}**`
	else description = `> ${rank}**・${pp_string}・${accuracy}%**${if_fc_string}\n> **${total_score}・**${statistics}**・${combo}**\n> ${diff_string}`
	let timestamp = score.played_date
	if (process.env.NEW_DROID_HOTFIX && score instanceof DroidBanchoScore) timestamp.setHours(timestamp.getHours() - 2)
	embed.setTitle(`**${status_emoji} ${title}**`);
	embed.setAuthor({ name: user_string, iconURL: user.avatar_url, url: user.user_url })
	embed.setDescription(description);
	embed.setFooter({ text: `Server: ${server_name}`, iconURL: server_icon })
	embed.setTimestamp(timestamp);
	embed.setColor(Number(`0x${score.color.slice(1)}`))
	return embed;
}

const card = async (user: OldDroidUser, scores: OldDroidScore[]) => {
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



// const calculate = async (data: DroidCalculatedData) => {
// 	const rank = await osu.emoji.rank(data.rank)
// 	let dpp = data.performance.dpp!.toFixed(2) || "--"
// 	let pp = data.performance.pp!.toFixed(2) || "--"
// 	let statistics = `[${data.count.n300}/${data.count.n100}/${data.count.n50}/${data.count.nMiss}]`
// 	let oss = data.rating.osu
// 	let droid = data.rating.droid

// 	let mult_cs = 1
// 	let mult_hp = 1

// 	if (data.mods.acronyms.includes("EZ")) {
// 		mult_cs = 0.5
// 		mult_hp = 0.5
// 	}
// 	if (data.mods.acronyms.includes("HR")) {
// 		mult_cs = 1.3
// 		mult_hp = 1.4
// 	}
// 	let ar = oss.approachRate.toLocaleString("en-US", { maximumFractionDigits: 2 })
// 	let od = oss.overallDifficulty.toLocaleString("en-US", { maximumFractionDigits: 2 })
// 	let cs = Math.min(data.beatmap.cs * mult_cs, 10).toLocaleString("en-US", { maximumFractionDigits: 2 })
// 	let hp = Math.min(data.beatmap.hp * mult_hp, 10).toLocaleString("en-US", { maximumFractionDigits: 2 })
// 	let beatmap = await v2.beatmap.id.lookup({ id: data.beatmap.beatmapId })
// 	let speed = 1
// 	if (data.mods.acronyms.includes("HT")) speed = 0.75
// 	if (data.mods.acronyms.includes("DT") || data.mods.acronyms.includes("NC")) speed = 1.5

// 	speed *= data.mods.speed
// 	let total_length = beatmap.total_length / speed

// 	let length_str = time_formatted(total_length)
// 	let default_length_str = time_formatted(beatmap.total_length)

// 	let mods_string = `${data.mods.acronyms.length ? `+${data.mods.acronyms.join("")}` : ''}` || "+NM"
// 	if (data.mods.speed != 1) mods_string = `${mods_string} (${data.mods.speed.toFixed(2)}x)`
// 	let title = `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title}`
// 	let beatmap_url = `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}`
// 	let star_rating = data.rating.osu.starRating
// 	let diff_emoji = osu.emoji.difficulty("osu", star_rating)

// 	let time_emoji = `<:time:1005980377304793190>`
// 	let bpm_emoji = `<:bpm:1005980375387996241>`
// 	let circle_emoji = `<:circle:1005980371881574492>`
// 	let slider_emoji = `<:slider:1005980368081522841>`
// 	let ranked_str = ""
// 	switch (beatmap.ranked) {
// 		case -2:
// 			ranked_str = "Graveyard"
// 			break;
// 		case -1:
// 			ranked_str = "WIP"
// 			break;
// 		case 0:
// 			ranked_str = "Unranked"
// 			break;
// 		case 1:
// 			ranked_str = "Ranked"
// 			break;
// 		case 2:
// 			ranked_str = "Approved"
// 			break;
// 		case 3:
// 			ranked_str = "Qualified"
// 			break;
// 		case 4:
// 			ranked_str = "Loved"
// 			break;
// 	}

// 	let time_str = `${length_str}${speed != 1 ? ` (${default_length_str})` : ""}`
// 	let bpm_str = `${(beatmap.bpm * speed).toFixed(2)}${speed != 1 ? ` (${beatmap.bpm})` : ""}`
// 	let avatar_url = `https://a.ppy.sh/${beatmap.beatmapset.user_id}`
// 	let creator_url = `https://osu.ppy.sh/users/${beatmap.beatmapset.user_id}`
// 	let embed = new EmbedBuilder()
// 		.setAuthor({ name: `Mapset by ${beatmap.beatmapset.creator}`, url: creator_url, iconURL: avatar_url })
// 		.setURL(beatmap_url)
// 		.setTitle(title)
// 		.addFields({
// 			name: `${diff_emoji} **[${beatmap.version}]** [${star_rating.toLocaleString("en-US", { maximumFractionDigits: 2 })}⭐]`,
// 			value: `${time_emoji} \`${time_str}\`・${bpm_emoji} \`${bpm_str}\`・${circle_emoji} \`${beatmap.count_circles}\`・${slider_emoji} \`${beatmap.count_sliders}\``
// 				+ `\n**AR: \`${ar}\`・OD: \`${od}\`・CS: \`${cs}\`・HP: \`${hp}\`**`
// 				+ `\n> ${rank}**・\`${mods_string}\`・${dpp}dpp | ${pp}pp・${format_double_dec(data.accuracy * 100)}%・**${statistics}**・${data.combo.toLocaleString("en-US")}x/${beatmap.max_combo.toLocaleString("en-US")}x**`
// 		})
// 		.setImage(beatmap.beatmapset.covers["cover@2x"])
// 		.setColor(Number(`0x${data.color.slice(1)}`))
// 		.setFooter({ text: `${ranked_str}` })
// 	return embed
// }
const top = async (user: DroidUser, scores: DroidScore[], page: number) => {
	let i = (5 * page) + 1
	let embed = new EmbedBuilder()
	const iBancho = (user instanceof DroidBanchoUser)
	const server_name = iBancho ? "iBancho" : "osudroid!relax"
	const server_icon = iBancho ? `https://cdn.discordapp.com/icons/316545691545501706/a_2e882927641c2b4bb15e514d4e2829c7.webp` : `https://cdn.discordapp.com/icons/1095653998389907468/a_82bf78e259e9cb4ba4d4ca355e28e0df.webp`

	for (const score of scores) {
		if (score instanceof DroidRXScore) {
			if (!score.beatmap) {
				const beatmapInfo = await MapInfo.getInformation(score.hash)
				if (!beatmapInfo) continue;
				score.beatmap = beatmapInfo;
				score.filename = beatmapInfo.artist + " - " + beatmapInfo.title + ` (${beatmapInfo.creator})` + " [" + beatmapInfo.version + "]";
			}
		}
		const rank = await osu.emoji.rank(score.rank)
		const pp = iBancho ? `${score.dpp!.toFixed(2)}dpp` : `${score.pp!.toFixed(2)}pp`
		const accuracy = `${format_double_dec(score.accuracy * 100)}%`
		const combo = `${score.combo.toLocaleString("en-US")}x`

		let score_amount = Intl.NumberFormat('en-US', {
			notation: "compact",
			maximumFractionDigits: 1
		}).format(score.total_score);

		const statistics = `[${score.count?.n300}/${score.count?.n100}/${score.count?.n50}/${score.count?.nMiss}]`
		let mods_string = score.modsString();
		embed.addFields({
			name: `**#${i}・${score.filename} \`${mods_string}\`**`,
			value: `> ${rank}**・${pp}・${accuracy}・**${statistics}・**\`${score_amount}\`・${combo}・**<t:${(score.played_date.valueOf() / 1000).toFixed(0)}:R>`,
		})
		i++
	}
	let user_string = user.username + "・"
	if (iBancho) {
		user_string += `${user.stats.dpp.toLocaleString("en-US", { maximumFractionDigits: 2 })}dpp `
		user_string += `(#${user.stats.rank.global.toLocaleString("en-US")}`
		if (user.country) {
			user_string += ` ${user.country.toUpperCase()}`
			if (process.env.NEW_DROID_HOTFIX) user_string += `)`
			else user_string += `${user.stats.rank.country!.toLocaleString("en-US")}`
		} else user_string += ")"

	} else if (user instanceof DroidRXUser) {
		user_string += `${user.stats.pp.toLocaleString("en-US")}pp `;
		user_string += `(#${user.stats.rank.toLocaleString("en-US")})`
	}
	embed.setAuthor({ name: user_string, iconURL: user.avatar_url, url: user.user_url })
	embed.setColor(Number(`0x${user.color.slice(1)}`))
	embed.setThumbnail(user.avatar_url)
	embed.setTimestamp()
	embed.setFooter({ text: `Server: ${server_name}`, iconURL: server_icon })
	return embed
}


export const embed = { score, card, top }
