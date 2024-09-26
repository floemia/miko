import { MapInfo } from "@rian8337/osu-base"
import { client, logger } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/droidtracking"
import { ChannelType } from "discord.js"
import { getAverageColor } from "fast-average-color-node"
import GuildConfigModel from "../schemas/guild"

export const droid_tracking = async () => {

	var tracking_users = await DroidAccountTrackModel.find()
	if (tracking_users) {
		logger.sponsor(`osu!droid score tracking is running. Currently there are ${tracking_users.length} users.`, "TRACKING")
		while (true) {
			tracking_users = await DroidAccountTrackModel.find()
			for await (const user of tracking_users) {
				await new Promise(resolve => setTimeout(resolve, 25000))
				const track_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user.guild }))?.channel.track}`)
				if (!track_channel || track_channel.type != ChannelType.GuildText) continue

				const recents = await droid.recent(user.uid)
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
				track_channel.send({ content: `<:droid_simple:1021473577951821824>  **osu!droid** | Score reciente de  **:flag_${user.country.toLowerCase()}:\n-# Los valores de DPP y PP pueden no ser precisos.`, embeds: [embed] })
			}
		}
	}
}