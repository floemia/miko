import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { DroidBanchoUser, DroidScrape, miko } from "miko-modules"
import { droid } from "../../functions/osu!droid/functions"
import { utils } from "../../utils"
import { DroidDifficultyCalculator, DroidPerformanceCalculator } from "@rian8337/osu-difficulty-calculator"
import DroidAccountTrackModel from "../../schemas/DroidAccountTrackSchema"
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("refresh")
		.setDescription("Refresh the tracking database.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	developer: true,
	async execute(client, interaction) {
		await interaction.deferReply()
		if (interaction.user.id != "596481414426525696") return await interaction.deleteReply()
		const tracking_users = await DroidAccountTrackModel.find()
		let i = 0
		for await (const user_data of tracking_users) {
			await new Promise(resolve => setTimeout(resolve, 2000))
			const user = (await DroidBanchoUser.get({ uid: user_data.uid }))!
			const recent = (await user.scores.recent())[0];
			// if (recent.played_date <= user_data.timestamp) continue
			utils.log.out({ prefix: "[TRACKING]", message: `(USER ${i + 1} of ${tracking_users.length}) Updating database entry for ${user.username}...`, color: "Purple", important: true })
			utils.log.out({ prefix: "[TRACKING]", message: `Timestamp: ${recent.played_date}`, color: "Purple" })
			await DroidAccountTrackModel.findOneAndUpdate({ uid: user_data.uid }, { timestamp: recent.played_date })
			utils.log.out({ prefix: "[TRACKING]", message: `Done.`, color: "Purple", important: true })
			i++;
		}
		utils.log.out({ prefix: "[TRACKING]", message: `All tracked users have been updated.`, color: "Purple", important: true })

	}
}