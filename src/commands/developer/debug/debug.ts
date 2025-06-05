import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { SlashCommandBuilder } from "discord.js";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const status = interaction.options.getBoolean("enabled", true);
	client.config.debug = status;
	const embed = Embeds.response({ description: `\`client.config.debug\` is now \`${status}\`.`, user: interaction.user, color: "Green" });
	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("debug")
		.setDescription("unreachable")
		.addSubcommand(sub => sub
			.setName("status")
			.setDescription("🕵️ (DEV!) Set the status of the debug mode.")
			.setDescriptionLocalization("es-ES", "🕵️ (DEV!) Establece el estado del modo debug.")
			.addBooleanOption(option =>
				option.setName("enabled")
					.setDescription("Whether or not to enable the debug mode.")
					.setDescriptionLocalization("es-ES", "Si habilitar o no el modo debug.")
					.setRequired(true)));

export const developer: SlashCommand["developer"] = true;
