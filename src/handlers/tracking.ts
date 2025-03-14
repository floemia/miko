import { MapInfo } from "@rian8337/osu-base"
import { client, logger } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/droidtracking"
import OsuAccountTrackModel from "../schemas/osutracking"
import { ChannelType } from "discord.js"
import GuildConfigModel from "../schemas/guild"
import { v2 } from "osu-api-extended"
import { osu } from "../functions/osu/functions"
import { miko } from "miko-modules"

export const droid_tracking = async () => {
	var tracking_users = await DroidAccountTrackModel.find()
	if (tracking_users) {
		logger.info(`osu!droid score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await DroidAccountTrackModel.find()
			for await (const user_data of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				const guild_config = await GuildConfigModel.findOne({ id: user_data.guild })
				if (!guild_config || !guild_config.tracking_enabled) continue
				const track_channel = client.channels.cache.get(`${guild_config?.channel.track}`)

				if (!track_channel || track_channel.type != ChannelType.GuildText) continue
				const data = await miko.request ({ uid: user_data.uid })
				if (data.error) continue
				const user = (await miko.user({ response: data }))!
				const scores = (await miko.scores({ uid: user_data.uid, type: "recent" }))!
				if (!scores || scores[0].played_date.valueOf() == user_data.timestamp) continue
				const play = scores[0]

				await DroidAccountTrackModel.findOneAndUpdate({ uid: user.id, guild: user_data.guild }, {
					timestamp: play.played_date.valueOf(),
					last_score: play.score
				})
				logger.info(`\nCreating osu!droid score embed for ${user.username}\nGUILD: ${user_data.guild}`)
				await miko.calculate(play)
				const embed = await droid.embed.score(play)
				track_channel.send({ content: `<:droid_simple:1021473577951821824>  **osu!droid**・Score reciente de  **:flag_${user.region.toLowerCase()}:  ${user.username}**:`, embeds: [embed] })
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
				const guild_config = await GuildConfigModel.findOne({ id: user.guild })
				if (!guild_config || !guild_config.tracking_enabled) continue

				const track_channel = client.channels.cache.get(`${guild_config?.channel.track}`)
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
