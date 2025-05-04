import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import es from "../../locales/es";
import en from "../../locales/en";
import { utils } from "../../utils";
import DiscordUserDefaultServerModel from "../../schemas/DiscordUserDefaultServerSchema";
const languages = { en, es };
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("osu!droid - Set your default server.")
		.setDescriptionLocalization("es-ES", "osu!droid - Establece tu servidor predeterminado.")
		.addStringOption(opt => opt
			.setName("server")
			.setDescription("The server to set as default. Defaults to iBancho.")
			.setDescriptionLocalization("es-ES", "El servidor a establecer como predeterminado. Por defecto, iBancho.")
			.setRequired(true)
			.addChoices(
				{ name: "iBancho", value: "ibancho" },
				{ name: "osudroid!relax", value: "rx" },
			)
		),
	async execute(client, interaction) {
		await interaction.deferReply()

		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en
		let server = interaction.options.getString("server", true)
		const db = await DiscordUserDefaultServerModel.findOne({ discord_id: interaction.user.id })
		let msg = server == "ibancho" ? response.command.server.success_bancho() : response.command.server.success_rx()
		utils.log.out({ prefix: "[DATABASE]", message: `${interaction.user.username} set "${server}" as their default osu!droid server.`, color: "Purple" })
		if (db) {
			await db.updateOne({ "$set": { server: server } })
			return await interaction.editReply({
				embeds: [utils.embeds.success({ description: msg, interaction: interaction, spanish: spanish })]
			})
		}
		new DiscordUserDefaultServerModel({
			discord_id: interaction.user.id,
			server: server,
		}).save()
		await interaction.editReply({
			embeds: [utils.embeds.success({ description: msg, interaction: interaction, spanish: spanish })]
		})
	}
}