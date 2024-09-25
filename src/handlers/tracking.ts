import { MapInfo } from "@rian8337/osu-base"
import { client } from ".."
import { droid } from "../functions/osu!droid/functions"
import DroidAccountTrackModel from "../schemas/droidtracking"
import { ChannelType } from "discord.js"
import { getAverageColor } from "fast-average-color-node"
import GuildConfigModel from "../schemas/guild"

export const droid_tracking = async () => {

    var tracking_users = await DroidAccountTrackModel.find()
    setInterval(async () => {
       tracking_users = await DroidAccountTrackModel.find()
    },60000)

    if (tracking_users) {
        setInterval(async () => {
            tracking_users.forEach(async (user, i) => {
                setTimeout(async () => {
                    const track_channel =  client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: user.guild }))?.channel.track}`)
                    if (!track_channel || track_channel.type != ChannelType.GuildText) return

                    const recents = await droid.recent(user.uid)
                    if (!recents) return
                    if (!recents[0]) return
                    if (recents[0].timestamp == user.timestamp) return
                    
                    const play = recents[0]
                    const beatmap = await MapInfo.getInformation(play.hash)
                    console.log(`creando track para ${play.user.username}\n${play.fallback_title}\n\n`)
                    
                    if (beatmap?.title) {
                        play.beatmap = beatmap

                        try {
                            const average = await getAverageColor(`https://assets.ppy.sh/beatmaps/${play.beatmap?.beatmapsetID}/covers/cover.jpg`)
                            play.embed_color = average.hex
                          } catch (error) {
                            console.log(`invalid beatmap / no bg ${play.beatmap?.beatmapsetID} `)
                          }

                        const calc = await droid.calculate(play)
                        play.performance = calc.performance
                        play.performance_fc = calc.performance_fc
                    }
                    const embed = await droid.embed.score(play)
                    track_channel.send({content: `<:droid_simple:1021473577951821824>  **osu!droid** | Score reciente de  **:flag_${user.country.toLowerCase()}:  ${user.username}**\n-# Los valores de DPP y PP pueden no ser precisos.`,embeds: [embed]})
                    user.timestamp = play.timestamp
                    user.last_score = play.score

                    await DroidAccountTrackModel.findOneAndUpdate({uid: play.user.id}, {
                        timestamp: play.timestamp,
                        last_score: play.score
                    })

                    
                }, (i * 4000) + 4000 * i)
            }, )

        }, (tracking_users.length * 5000) + 5000 * tracking_users.length + 5000)
    }
}