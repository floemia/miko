import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";


export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("config")
		.setDescription("unreachable")
		.addSubcommandGroup(sub => sub
			.setName("tracking")
			.setDescription("unreachable 2: Electric Boogaloo")
			.addSubcommand(sub => sub
				.setName("status")
				.setDescription("⚙️ Set the osu!droid scores tracking status.")
				.addBooleanOption(option =>
					option.setName("enabled")
						.setDescription("Whether or not to enable the tracking system.")
						.setRequired(true)))
			.addSubcommand(sub => sub
				.setName("refresh")
				.setDescription("🔄 Refresh the osu!droid scores tracking system.")
				.addBooleanOption(option =>
					option.setName("force")
						.setDescription("Whether or not to force the refreshing of the tracking system.")
						.setRequired(true)))
		)
