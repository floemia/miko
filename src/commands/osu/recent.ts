import { SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { MapInfo } from "@rian8337/osu-base"
import { getAverageColor } from "fast-average-color-node"
import { embed } from "../../functions/messages/embeds"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("recent")
    .setDescription("osu!droid - Muestra tu score más reciente.")
    .addIntegerOption(opt => opt
      .setName("uid")
      .setDescription("UID del usuario")
      .setRequired(true)
    )
    .addIntegerOption(opt => opt
      .setName("index")
      .setDescription("Indice de la play")
      .setMaxValue(50).setMinValue(1)
    ),

  async execute(client, interaction) {
    await interaction.deferReply({ephemeral: true})
    const recent = await droid.recent(interaction.options.getInteger("uid", true))

    if (!recent) return await interaction.editReply({
          embeds: [await embed.interaction("error", `El usuario no existe o no tiene scores recientes.`, interaction)]
      })

    var index = (interaction.options?.getInteger("index") || 1) - 1
    if (index > recent.length) index = recent.length - 1
    const beatmapInfo = await MapInfo.getInformation(recent[index].hash);
    if (beatmapInfo?.title) {
      recent[index].beatmap = beatmapInfo
      const calc = await droid.calculate(recent[index])
      recent[index].performance = calc.performance
      recent[index].performance_fc = calc.performance_fc

      try {
        const average = await getAverageColor(`https://assets.ppy.sh/beatmaps/${recent[index].beatmap?.beatmapsetID}/covers/cover.jpg`)
        recent[index].embed_color = average.hex
      } catch (error) {
        console.log(`invalid beatmap / no bg ${recent[index].beatmap?.beatmapsetID} `)
      }
    }

    const embed_score = await droid.embed.score(recent[index])
    await interaction.editReply({content: `<:droid_simple:1021473577951821824>  **osu!droid** | Score #${index + 1} de  :flag_${recent[0].user.country.toLowerCase()}:  **${recent[0].user.username}**:\n-# Los valores de DPP y PP pueden no ser precisos.`, embeds: [embed_score]})
  },
}
