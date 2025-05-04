import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import { urlStorage } from "../../events/client/message"
import { miko } from "miko-modules"
import { droid } from "../../functions/osu!droid/functions"
import { utils } from "../../utils"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Test command.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescriptionLocalization("es-ES", "Test command.")
		.addIntegerOption(opt => opt
			.setName("uid")
			.setDescription("UID of the osu!droid profile.").setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
		),
	developer: true,
	async execute(client, interaction) {
		await interaction.deferReply()
	}
}