import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"

export const command: Command = {
  data: new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Comprueba la conexión."),

  async execute(client, interaction) {
    const delay = Date.now() - interaction.createdAt.getTime()
    const embed_reply = await embed.interaction("success", `El ping de ${client.user.username} es de \`${delay}ms\`.`, interaction)
    await interaction.reply({ embeds: [embed_reply], ephemeral: true })
  },
}
