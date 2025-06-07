import { SlashCommand } from "@structures/core";
import { ChannelType, InteractionContextType, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { channel, status } from "./subCommands";
export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "status":
			await status(client, interaction);
			break;
		case "channel":
			await channel(client, interaction);
			break;
	}
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("config")
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
		.setDescription("unreachable")
		.addSubcommandGroup(sub => sub
			.setName("tracking")
			.setDescription("unreachable 2: Electric Boogaloo")
			.addSubcommand(sub => sub
				.setName("status")
				.setDescription("⚙️ Set the osu!droid scores tracking status.")
				.setDescriptionLocalization("es-ES", "⚙️ Cambiar el estado del sistema de tracking de scores de osu!droid.")
				.addStringOption(option =>
					option.setName("status")
						.setDescription("The desired status of the tracking system.")
						.setDescriptionLocalization("es-ES", "El estado deseado del sistema de tracking.")
						.setRequired(true)
						.addChoices(
							{ name: "enabled", value: "enabled", name_localizations: { "es-ES": "activado" } },
							{ name: "disabled", value: "disabled", name_localizations: { "es-ES": "desactivado" } })))
			.addSubcommand(sub => sub
				.setName("channel")
				.setDescription("⚙️ Set the osu!droid scores tracking channel.")
				.setDescriptionLocalization("es-ES", "⚙️ Cambiar el canal de tracking de scores de osu!droid.")
				.addChannelOption(option =>
					option.setName("channel")
						.addChannelTypes(ChannelType.GuildText)
						.setDescription("The desired channel for the tracking system.")
						.setDescriptionLocalization("es-ES", "El canal deseado para el sistema de tracking.")
						.setRequired(true))));
