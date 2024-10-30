import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("ping")
		.setDescription("Shows Miko's latency.").setDescriptionLocalization("es-ES", "Muestra la latencia de Miko."),

	async execute(client, interaction) {
		const delay = Date.now() - interaction.createdAt.getTime()

		await interaction.reply({
			embeds: [embed.response({
				type: "success",
				description: interaction.locale == "es-ES" ? 
				`El ping de ${client.user.username} es de \`${delay}ms\`.`
				: `${client.user.username}'s ping is \`${delay}ms\`.`,
				interaction: interaction
			})], 
			ephemeral: true
		})
	},
}
