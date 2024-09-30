import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { MapInfo } from "@rian8337/osu-base"
import { getAverageColor } from "fast-average-color-node"
import { embed } from "../../functions/messages/embeds"
import { v2 } from "osu-api-extended"
import { osu } from "../../functions/osu/functions"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("osu!")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addIntegerOption(opt => opt
			.setRequired(true)
			.setDescription("id")
			.setName("uid")
		)
		.addIntegerOption(opt => opt
			.setRequired(true)
			.setDescription("mode")
			.setName("mode")
		),

	async execute(client, interaction) {
		await interaction.deferReply()
		const score = await v2.scores.user.category(interaction.options.getInteger("uid", true), "best",{mode: osu.gamemode.code(interaction.options.getInteger("mode") || 0)})
		const data = await osu.calculate(score[0])
		if (!data) return;

		const score_embed = await osu.embed.score(score[0], data)
		interaction.editReply({embeds: [score_embed]})
	},
}
