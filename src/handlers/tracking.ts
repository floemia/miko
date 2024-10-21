import { MapInfo } from "@rian8337/osu-base"
import { client, logger } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/droidtracking"
import OsuAccountTrackModel from "../schemas/osutracking"
import { ChannelType } from "discord.js"
import { getAverageColor } from "fast-average-color-node"
import GuildConfigModel from "../schemas/guild"
import { v2 } from "osu-api-extended"
import { osu } from "../functions/osu/functions"

export const droid_tracking = async () => {

	var tracking_users = await DroidAccountTrackModel.find()
	if (tracking_users) {
		logger.sponsor(`osu!droid score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await DroidAccountTrackModel.find()
			for await (const user of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				var track_channel
				if (client.user.id == "1242645288305430678"){
					track_channel = client.channels.cache.get("1025132694125957191")
				} else {
					track_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user.guild }))?.channel.track}`)
				}
				if (!track_channel || track_channel.type != ChannelType.GuildText) continue

				const recents = await droid.scores.recent(user.uid)
				if (!recents) continue
				if (!recents[0]) continue
				if (recents[0].timestamp == user.timestamp) continue

				const play = recents[0]
				await DroidAccountTrackModel.findOneAndUpdate({ uid: play.user.id }, {
					timestamp: play.timestamp,
					last_score: play.score
				})

				const beatmap = await MapInfo.getInformation(play.hash)
				logger.info(`Creating score embed for ${play.user.username}\n${play.fallback_title}\n${play.accuracy}, ${play.mods}, ${play.scraped_pp}dpp\n`, "TRACKING")
				if (beatmap?.title) {
					play.beatmap = beatmap
					try {
						const average = await getAverageColor(`https://assets.ppy.sh/beatmaps/${play.beatmap?.beatmapSetId}/covers/cover.jpg`)
						play.embed_color = average.hex
					} catch (error) {
						logger.error(`invalid beatmap / no bg ${play.beatmap?.beatmapSetId}`, "TRACKING")
					}

					const calc = await droid.calculate(play)
					play.performance = calc.performance
					play.performance_fc = calc.performance_fc
				}
				const embed = await droid.embed.score(play)
				track_channel.send({ content: `<:droid_simple:1021473577951821824>  **osu!droid**・Score reciente de  **:flag_${user.country.toLowerCase()}:  ${play.user.username}**:\n-# Los valores de DPP y PP pueden no ser precisos.`, embeds: [embed] })
			}
		}
	}
}

export const osu_tracking = async () => {

	var tracking_users = await OsuAccountTrackModel.find()
	if (tracking_users) {
		logger.sponsor(`osu! score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await OsuAccountTrackModel.find()
			for await (const user of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				var track_channel
				if (client.user.id == "1242645288305430678"){
					track_channel = client.channels.cache.get("1025132694125957191")
				} else {
					track_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user.guild }))?.channel.track}`)
				}
				if (!track_channel || track_channel.type != ChannelType.GuildText) continue
				const recents = await v2.scores.user.category(user.uid, "recent", {mode: osu.gamemode.code(user.mode_int), limit: "1", include_fails: false})
				if (!recents || !recents[0] || recents[0].id == user.last_score_id ) continue

				const play = recents[0]
				await OsuAccountTrackModel.findOneAndUpdate({ guild: user.guild, uid: play.user.id, mode: user.mode }, {
					last_score_id: play.id
				})
				logger.info(`Creating score embed for ${play.user.username}\n${play.beatmapset.title} - ${user.mode}\n${(play.accuracy*100).toFixed(2)}, ${play.mods ? `+${play.mods.map(x => x.acronym).join('')}` : 'NM'}\n`, "TRACKING")
				const data = await osu.calculate(play)
				if (!data) return
				const embed = await osu.embed.score(play, data)
				track_channel.send({ content: `**${osu.gamemode.full(user.mode_int)}・**Score reciente de  **:flag_${user.country.toLowerCase()}:  ${play.user.username}**:`, embeds: [embed] })
			}
		}
	}
}