import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droidppboard } from "../../functions/osu!droid/ppboard"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription("test"),

	async execute(client, interaction) {
		await interaction.deferReply()
		interaction.deleteReply()
		if (interaction.user.id != "596481414426525696") return
		await droidppboard.user(177955)
	},
}
