import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { DBManager } from "@utils/managers";
import { ResponseEmbedBuilder } from "@utils/builders";
import { DroidServer } from "@structures/servers";

export const run: SlashCommand["run"] = async (client, interaction, str) => {
	const server = interaction.options.getString("server", true) as DroidServer;
	const fancy_name = server == "ibancho" ? "iBancho" : "osudroid!relax";
	
	const embed = new ResponseEmbedBuilder()
	.setUser(interaction.user)
	.setDescription(str.commands.defaultserver.response(fancy_name))
	.setThumbnail(client.config.servers[server].iconURL);
	
	await interaction.editReply({ embeds: [embed] });
	await DBManager.setDefaultServer(interaction.user, server);
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("defaultserver")
		.setDescription("🔘 Set your default osu!droid server.")
		.setDescriptionLocalization("es-ES", "🔘 Establece tu servidor predeterminado de osu!droid.")
		.addStringOption(option =>
			option.setName("server")
				.setDescription("The desired server.")
				.setDescriptionLocalization("es-ES", "El servidor deseado.")
				.setRequired(true)
				.addChoices(
					{ name: "iBancho", value: "ibancho" },
					{ name: "osudroid!relax", value: "rx" }));

export const dirname = __dirname;