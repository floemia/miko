import { EmbedBuilder, InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription("Diré algo.")
		.addStringOption(opt => opt.setName("msg")
			.setRequired(true)
			.setDescription("Mensaje a mandar."))
		.setContexts(InteractionContextType.Guild),

	async execute(client, interaction) {
		await interaction.deferReply()
		await interaction.deleteReply()
		if (!interaction.channel) return
		const channel = interaction.channel

		if (channel.isSendable()) {
			await channel.sendTyping()
			setTimeout(async () => {
				await channel.send(interaction.options.getString("msg", true))
			}, Math.floor(Math.random() * 5))
		}
		if (!channel) return

	},
}
