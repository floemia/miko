import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { DatabaseManager } from "@utils/managers";
import { InteractionEmbedBuilder } from "@utils/builders";
import { DroidServer } from "@structures/osu!droid";
import { Config } from "@core/Config";
import { InteractionHelper } from "@utils/helpers";

export const run: SlashCommand["run"] = async (client, interaction) => {
	const t = InteractionHelper.getLocale(interaction);
	const choice = interaction.options.getString("server", true) as DroidServer;
	const server = Config.servers[choice];
	const embed = new InteractionEmbedBuilder(interaction)
		.setMessage(t.commands.defaultserver.responses.ok(server))
		.setThumbnail(server.iconURL);
	
	await InteractionHelper.reply(interaction, { embeds: [embed] });
	await DatabaseManager.setDefaultServer(interaction.user, server.codename);
}

export const data: SlashCommand["data"] =
	new SlashCommandBuilder()
		.setName("defaultserver")
		.setDescription("🟣 Set your default osu!droid server.")
		.setDescriptionLocalization("es-ES", "🟣 Establece tu servidor predeterminado de osu!droid.")
		.addStringOption(option =>
			option.setName("server")
				.setDescription("The desired server.")
				.setDescriptionLocalization("es-ES", "El servidor deseado.")
				.setRequired(true)
				.addChoices(
					{ name: "iBancho", value: "ibancho" },
					{ name: "osudroid!relax", value: "rx" }));

export const dirname = __dirname;