import { SlashCommand } from "@structures/core";
import { Embeds } from "@utils";
import { en, es } from "@locales";
import { SlashCommandBuilder } from "discord.js";
import DiscordUserDefaultServerModel from "@structures/mongoose/DiscordUserDefaultServerSchema";

export const run: SlashCommand["run"] = async (client, interaction) => {
	await interaction.deferReply();
	const spanish = interaction.locale.includes("es");
	const str = spanish ? es : en;
	const server = interaction.options.getString("server", true) as "ibancho" | "rx";
	const fancy_name = server == "ibancho" ? "iBancho" : "osudroid!relax";

	await DiscordUserDefaultServerModel.findOneAndUpdate(
		{ discord_id: interaction.user.id },
		{
			discord_id: interaction.user.id,
			server: server,
		},
		{ upsert: true, new: true }
	);
	const embed = Embeds.response({ description: str.commands.defaultserver.response(fancy_name), user: interaction.user, color: "Green" })
	.setThumbnail(client.config.servers[server].iconURL)
	await interaction.editReply({ embeds: [embed] });
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