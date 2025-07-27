import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder } from "@utils/builders";
import { SlashCommandBuilder } from "discord.js";

export const run: SlashCommand["run"] = async (client, interaction, str) => {	
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(str.commands.uptime.response(client.uptime!));

	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("uptime")
		.setDescription("🕒 Get Miko's uptime.")
		.setDescriptionLocalization("es-ES", "🕒 Obtener el tiempo de actividad de Miko.")

export const dirname = __dirname;