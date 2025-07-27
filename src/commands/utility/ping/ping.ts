import { SlashCommand } from "@structures/core";
import { ResponseEmbedBuilder } from "@utils/builders";
import { SlashCommandBuilder } from "discord.js";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const embed = new ResponseEmbedBuilder()
		.setUser(interaction.user)
		.setDescription(str.commands.ping.response(client.ws.ping));

	await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("ping")
		.setDescription("📶 Get Miko's ping.")
		.setDescriptionLocalization("es-ES", "📶 Obtener el ping de Miko.")

export const dirname = __dirname;