import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { start, stop, update } from "./subCommands/";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const subcommand = interaction.options.getSubcommand();
	switch (subcommand) {
		case "stop":
			await stop(client, interaction);
			break;
		case "start":
			await start(client, interaction);
			break;
		case "update":
			await update(client, interaction);
			break;
	}
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("tracking")
		.setDescription("unreachable")
		.addSubcommand(sub => sub
			.setName("stop")
			.setDescription("🛠️ (DEV!) Force stop the osu!droid scores tracking system.")
			.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Detener el sistema de tracking de scores de osu!droid.")
		)
		.addSubcommand(sub => sub
			.setName("start")
			.setDescription("🛠️ (DEV!) Start the osu!droid scores tracking system.")
			.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Iniciar el sistema de tracking de scores de osu!droid.")
		)
		.addSubcommand(sub => sub
			.setName("update")
			.setDescription("🛠️ (DEV!) Update the osu!droid scores tracking system's entries.")
			.setDescriptionLocalization("es-ES", "🛠️ (DEV!) Actualizar las entradas del sistema de tracking de scores de osu!droid.")
		)

export const developer: SlashCommand["developer"] = true;