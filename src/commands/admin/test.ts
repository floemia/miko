import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import { urlStorage } from "../../events/client/message"
import { miko } from "miko-modules"
import { droid } from "../../functions/osu!droid/functions"
import { utils } from "../../utils"
import { MapInfo } from "@rian8337/osu-base"
import { DroidDifficultyCalculator, DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("test")
		.setDescription("Test command.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescriptionLocalization("es-ES", "Test command."),
	developer: true,
	async execute(client, interaction) {
		await interaction.deferReply()
		const map = await MapInfo.getInformation(4303461);
		if(!map) return
		const rating = new DroidDifficultyCalculator().calculate(map.beatmap);
		const perf = new DroidPerformanceCalculator(rating).calculate();
		console.log(rating)
		console.log(perf)
	}
}