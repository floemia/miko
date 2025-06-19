import { SlashCommand } from "@structures/core";
import { Embeds, Misc } from "@utils";
import { SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";
export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	const embed = Embeds.response({
		description: str.commands.uptime.response(client.uptime!),
		user: interaction.user
	});
	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("🕒 Get Miko's uptime.")
		.setDescriptionLocalization("es-ES", "🕒 Obtener el tiempo de actividad de Miko.")

export const dirname = __dirname;