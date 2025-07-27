import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { debug, tracking } from "./subCommandGroups/";
import fs from "fs";
import path from "path";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const subcommandGroup = interaction.options.getSubcommandGroup();
	if (subcommandGroup == "debug") debug(client, interaction, str);
	else tracking(client, interaction, str);

	// lazy
	const config_path = path.join(__dirname, "../../../../config.json");
	fs.writeFileSync(config_path, JSON.stringify(client.config, null, 4));
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("settings")
		.setDescription("unreachable")
		.addSubcommandGroup(g => g
			.setName("tracking")
			.setDescription("unreachable")
			.addSubcommand(sub => sub
				.setName("status")
				.setDescription("🛠️ (DEV!) Set the status of the osu!droid scores tracking system.")
				.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Establecer el estado del sistema de tracking de scores de osu!droid.")
				.addStringOption(option =>
					option.setName("status")
						.setDescription("The desired status of the tracking system.")
						.setDescriptionLocalization("es-ES", "El estado deseado del sistema de tracking.")
						.setRequired(true)
						.addChoices(
							{ name: "enabled", value: "enabled", name_localizations: { "es-ES": "activado" } },
							{ name: "disabled", value: "disabled", name_localizations: { "es-ES": "desactivado" } })))
		)
		.addSubcommandGroup(g => g
			.setName("debug")
			.setDescription("unreachable")
			.addSubcommand(sub => sub
				.setName("status")
				.setDescription("🛠️ (DEV!) Set the status of the debug mode.")
				.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Establecer el estado del modo debug.")
				.addStringOption(option =>
					option.setName("status")
						.setDescription("The desired status of the debug mode.")
						.setDescriptionLocalization("es-ES", "El estado deseado del modo debug.")
						.setRequired(true)
						.addChoices(
							{ name: "enabled", value: "enabled", name_localizations: { "es-ES": "activado" } },
							{ name: "disabled", value: "disabled", name_localizations: { "es-ES": "desactivado" } })))
		)
		.addSubcommandGroup(g => g
			.setName("droid")
			.setDescription("unreachable")
			.addSubcommand(sub => sub
				.setName("method")
				.setDescription("🛠️ (DEV!) Set the current method of obtaining osu!droid data.")
				.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Establecer el método actual para obtener datos de osu!droid.")
				.addStringOption(option =>
					option.setName("method")
						.setDescription("The desired method of obtaining osu!droid data.")
						.setDescriptionLocalization("es-ES", "El método deseado para obtener datos de osu!droid.")
						.setRequired(true)
						.addChoices(
							{ name: "scraping", value: "scraping" },
							{ name: "api", value: "api" })))
		);
export const dirname = __dirname;