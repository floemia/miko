import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { SlashCommandBuilder } from "discord.js";
import { en, es } from "@locales";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;

	const embed = Embeds.response({
		description: str.commands.ping.response(client.ws.ping),
		user: interaction.user
	});
	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("ping")
		.setDescription("📶 Get Miko's ping.")
		.setDescriptionLocalization("es-ES", "📶 Obtener el ping de Miko.")

