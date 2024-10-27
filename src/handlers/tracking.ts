import { MapInfo } from "@rian8337/osu-base"
import { client, logger } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/droidtracking"
import OsuAccountTrackModel from "../schemas/osutracking"
import { ChannelType } from "discord.js"
import GuildConfigModel from "../schemas/guild"
import { v2 } from "osu-api-extended"
import { osu } from "../functions/osu/functions"
import { average_color } from "../functions/utils"

export const droid_tracking = async () => {
	var tracking_users = await DroidAccountTrackModel.find()
	if (tracking_users) {
		logger.info(`osu!droid score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await DroidAccountTrackModel.find()
			for await (const user_data of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				const track_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user_data.guild }))?.channel.track}`)
				if (!track_channel || track_channel.type != ChannelType.GuildText) continue

				const user = await droid.user({uid: user_data.uid, type: "with_recents", limit: 1})
				if (!user || !user.scores || user.scores[0].timestamp == user_data.timestamp) continue
				const play = user.scores[0]
				await DroidAccountTrackModel.findOneAndUpdate({ uid: user.id }, {
					timestamp: play.timestamp,
					last_score: play.score
				})

				const beatmap = await MapInfo.getInformation(play.hash)
				logger.info(`Creating score embed for ${user.username}`)

				if (beatmap?.title) {
					play.beatmap = beatmap
					const color = await average_color(`https://assets.ppy.sh/beatmaps/${play.beatmap?.beatmapSetId}/covers/cover.jpg`)
					play.embed_color = color.hex
					await droid.calculate(play)
				}

				console.log(play)
				const embed = await droid.embed.score(play)
				track_channel.send({ content: `<:droid_simple:1021473577951821824>  **osu!droid**・Score reciente de  **:flag_${user.country.toLowerCase()}:  ${user.username}**:\n-# Los valores de DPP y PP pueden no ser precisos.`, embeds: [embed] })
			}
		}
	}
}

export const osu_tracking = async () => {

	var tracking_users = await OsuAccountTrackModel.find()
	if (tracking_users) {
		logger.info(`osu! score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await OsuAccountTrackModel.find()
			for await (const user of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				const track_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user.guild }))?.channel.track}`)
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
