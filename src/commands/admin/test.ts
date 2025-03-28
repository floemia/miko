import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import { urlStorage } from "../../events/client/message"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Test command.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescriptionLocalization("es-ES", "Test command.")
		.addBooleanOption(opt => opt
			.setName("crash")
			.setDescription("Crash the bot.").setDescriptionLocalization("es-ES", "Crash the bot.")
		),
	developer: true,
	async execute(client, interaction) {
		await interaction.deferReply()
		let url = urlStorage.get(interaction.channelId)
		await interaction.editReply({ content: `🔗 Beatmap URL of <#${interaction.channelId}>: ${url}` })
	}
}