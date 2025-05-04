import { client } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/DroidAccountTrackSchema"
import { ChannelType } from "discord.js"
import GuildConfigModel from "../schemas/GuildConfigSchema"
import { DroidBanchoUser, DroidScoreExtended } from "miko-modules"
import { utils } from "../utils"

export const droid_tracking = async () => {
	var tracking_users = await DroidAccountTrackModel.find()
	if (tracking_users) {
		utils.log.out({ prefix: "[TRACKING]", message: "osu!droid score tracking is active. Tracking " + tracking_users.length + " accounts.", color: "Purple" })
		while (true) {
			tracking_users = await DroidAccountTrackModel.find()
			for await (const user_data of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 15000))
				const user = await DroidBanchoUser.get({ uid: user_data.uid })
				if (!user) continue
				const scores = await user.scores.recent()
				if (!scores.length || scores[0].played_date <= user_data.timestamp) continue
				const score = scores[0];
				console.log()
				utils.log.out({ prefix: "[TRACKING]", message: `osu!droid | Creating score embed for ${user.username}...`, color: "Purple", important: true })
				utils.log.out({ prefix: "[TRACKING]", message: `Sending in guilds: [${user_data.guilds.map(guild => guild.id).join(", ")}]\nBeatmap: ${score.filename}`, color: "Purple" })
				await score.calculate();
				const embed = await droid.embed.score(score, user)
				for (const guild_db of user_data.guilds) {
					let guild = client.guilds.cache.get(guild_db.id)
					if (!guild) continue

					const guild_config = await GuildConfigModel.findOne({ id: guild.id })
					if (!guild_config || !guild_config.tracking_enabled) continue
					const track_channel = client.channels.cache.get(`${guild_config?.channel.track}`)
					if (!track_channel || track_channel.type != ChannelType.GuildText) continue
					try {
						await track_channel.send({ content: `<:droid_simple:1021473577951821824>  **osu!droid**・Score reciente de  **${user.toString()}**:`, embeds: [embed] })
					} catch (error: any) {
						console.log()
						utils.log.out({ prefix: "[TRACKING][ERROR]", message: `An error has ocurred while sending the score embed to ${guild.name}, in the channel: #${track_channel.name}. Details below.`, color: "Red", important: true })
						utils.log.err({ prefix: "[TRACKING]", message: error.stack || "Unknown error" })
					}
				}
				utils.log.out({ prefix: "[TRACKING]", message: `Updating database entry for ${user.username}...`, color: "Purple", important: true })
				await DroidAccountTrackModel.findOneAndUpdate({ uid: user_data.uid }, { timestamp: score.played_date })
				utils.log.out({ prefix: "[TRACKING]", message: `Done.`, color: "Purple", important: true })

			}
		}
	}
}

