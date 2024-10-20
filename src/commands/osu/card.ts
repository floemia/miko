import { AttachmentBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import { unlinkSync } from "fs"

export const command: Command = {
  data: new SlashCommandBuilder()
    .setName("card")
    .setDescription("osu!droid - (BETA) Genera una imagen con los datos de un perfil de osu!droid")
    .addIntegerOption(opt => opt
      .setName("uid")
      .setDescription("UID del usuario")
      .setRequired(true)
    ),

  async execute(client, interaction) {
    await interaction.deferReply()
    const data = await droid.scores.best(interaction.options.getInteger("uid", true))
	
    if (!data) return await interaction.editReply({
          embeds: [await embed.interaction("error", `El usuario no existe.`, interaction)]
      })

	const user = data[0].user
	const embed_card = await droid.embed.card(data)
	const attachment = new AttachmentBuilder(`./${user.id}-${user.username}.png`, { name: `${user.id}-${user.username}.png` });

	await interaction.editReply({ embeds: [embed_card], files: [attachment]})
	unlinkSync(`./${user.id}-${user.username}.png`)
  },
}
