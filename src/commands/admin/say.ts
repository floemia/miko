import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("say")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription("Diré algo.")
		.addStringOption(opt => opt.setName("msg")
			.setRequired(true)
			.setDescription("Mensaje a mandar."))
		.setDMPermission(false),

	async execute(client, interaction) {
		await interaction.deferReply()
		interaction.deleteReply()
		if (interaction.user.id != "596481414426525696") return
		await interaction.channel?.send({ content: interaction.options.getString("msg", true) })
	},
}
