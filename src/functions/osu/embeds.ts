import { EmbedBuilder } from "discord.js";
import { ScoreDifficultyData } from "./types";
import { osu } from "../osu/functions";
import { client } from "../..";
import { response } from "osu-api-extended/dist/types/v2_scores_user_category";
import { getAverageColor } from "fast-average-color-node";
import { average_color, format_double_dec } from "../utils";

const score = async (recent: response, data: ScoreDifficultyData): Promise<EmbedBuilder> => {
	var difficulty_adjust = ''
	for (const mod of recent.mods) {
		if (mod.settings) {
			if (mod.settings.approach_rate) { difficulty_adjust = difficulty_adjust.concat(difficulty_adjust ? `, AR ${mod.settings.approach_rate}` : `(AR ${mod.settings.approach_rate}`) }
			if (mod.settings.overall_difficulty) { difficulty_adjust = difficulty_adjust.concat(difficulty_adjust ? `, OD ${mod.settings.overall_difficulty}` : `(OD ${mod.settings.overall_difficulty}`) }
			if (mod.settings.circle_size) { difficulty_adjust = difficulty_adjust.concat(difficulty_adjust ? `, CS ${mod.settings.circle_size}` : `(CS ${mod.settings.circle_size}`) }
			if (mod.settings.drain_rate) { difficulty_adjust = difficulty_adjust.concat(difficulty_adjust ? `, HP ${mod.settings.drain_rate}` : `(HP ${mod.settings.drain_rate}`) }
		}
	}
	if (difficulty_adjust) difficulty_adjust = difficulty_adjust.concat(")");

	const rank = osu.emoji.rank(recent.rank)
	const statistics: any = recent.statistics
	var ratio = `${recent.beatmap.mode == "mania" ? `${(statistics.perfect/statistics.great).toFixed(2) || "∞"}:1` : ''}`
	var hits = ''
	switch (recent.beatmap.mode) {
		case "osu": hits = `[${statistics.great || 0}/${statistics.ok || 0}/${statistics.meh || 0}/${statistics.miss || 0}]`; break
		case "taiko": hits = `[${statistics.great || 0}/${statistics.good || 0}/${statistics.miss || 0}]`; break
		case "fruits": hits = `[${statistics.great || 0}/${statistics.large_tick_hit || 0}/${statistics.small_tick_miss || 0}/${statistics.miss || 0}]`; break
		case "mania": hits = `[${statistics.perfect || 0}/${statistics.great || 0}/${statistics.good || 0}/${statistics.ok || 0}/${statistics.meh || 0}/${statistics.miss || 0}]`; break
	}

	const color = await average_color(`https://assets.ppy.sh/beatmaps/${recent.beatmapset.id}/covers/cover.jpg`)
	const pp_string = `${data.pp?.toFixed(2)} PP・${format_double_dec(recent.accuracy * 100)}%${data.fc.pp && data.fc.accuracy ? `・**( ${data.fc.pp?.toFixed(2)} PP ➜ FC ${format_double_dec(data.fc.accuracy)}% )**` : ''}`
	

	const embed = new EmbedBuilder()
	embed.setAuthor({ name: `${recent.beatmapset.artist} - ${recent.beatmapset.title} [${recent.beatmap.version}] ${data.stars?.toFixed(2)}⭐ ${recent.mods ? `+${recent.mods.map(x => x.acronym).join('')}` : ''} ${difficulty_adjust}`, iconURL: recent.user.avatar_url, url: `https://osu.ppy.sh/beatmapsets/${recent.beatmapset.id}#${recent.beatmap.mode}/${recent.beatmap.id}` })
	embed.setDescription(`> ${rank}**・${pp_string}・${recent.beatmap.mode == "mania" ? `${ratio}・` : ''}**${hits}**・**${recent.total_score.toLocaleString("en-US")}**・**${recent.max_combo.toLocaleString("en-US")}x/${data.combo?.toLocaleString("en-US")}x`)
	embed.setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL({ extension: "png" }) })
	embed.setColor(Number(`0x${color.hex.slice(1)}`))
	embed.setTimestamp(new Date(recent.ended_at))

	if (color.hex != "#dedede") {
		embed.setImage(`https://assets.ppy.sh/beatmaps/${recent.beatmapset.id}/covers/cover.jpg`)
	}

	return embed
}

export const embed = { score }