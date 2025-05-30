import { InteractionContextType, SlashCommandBuilder } from "discord.js"
import type { Command } from "../types"
import { droid } from "../functions/osu!droid/functions"
import { embed } from "../functions/messages/embeds"
import { DroidBanchoUser } from "miko-modules"
import en from "../locales/en"
import es from "../locales/es"
import { utils } from "../utils"
const languages = { en, es };
export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("tracking")
		.setContexts(InteractionContextType.Guild)
		.setDescription("tracking yay")
		.addSubcommandGroup(group =>
			group
				.setName('droid')
				.setDescription('osu!droid')
				.addSubcommand(subcommand =>
					subcommand
						.setName('add').setNameLocalization("es-ES", "agregar")
						.setDescription("osu!droid - Add an user to the score tracking system.")
						.setDescriptionLocalization("es-ES", "osu!droid - Agregar a un usuario al sistema de score tracking.")
						.addIntegerOption(option =>
							option.setName('uid')
								.setDescription('UID of the osu!droid profile.')
								.setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
								.setRequired(true))
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('delete').setNameLocalization("es-ES", "eliminar")
						.setDescription("osu!droid - Delete an user from the score tracking system.")
						.setDescriptionLocalization("es-ES", "osu!droid - Eliminar a un usuario del sistema de score tracking.")
						.addIntegerOption(option =>
							option.setName('uid')
								.setDescription('UID of the osu!droid profile.')
								.setDescriptionLocalization("es-ES", "UID del perfil de osu!droid."))
						.addStringOption(option =>
							option.setName('username')
								.setDescription('Username of the osu!droid profile.')
								.setDescriptionLocalization("es-ES", "Username del perfil de osu!droid."))
				)
		),

	async execute(client, interaction) {
		const subcommandgroup = interaction.options.getSubcommandGroup()
		const subcommand = interaction.options.getSubcommand()
		await interaction.deferReply({ ephemeral: true })
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)
		let response = spanish ? languages.es : languages.en

		if (!interaction.guild || !interaction.channel) return
		if (subcommandgroup == "droid") {
			let user: DroidBanchoUser | undefined;
			try { 
				user = await droid.get_droid_user(interaction, "ibancho") as DroidBanchoUser | undefined;
			} catch(error: any) {
				const embed = utils.embeds.error({ description: error.message, interaction, spanish });
				return await interaction.editReply({
					embeds: [embed]
				});
			}
			if (!user) return await interaction.editReply({
				embeds: [utils.embeds.error({ description: response.command.tracking.no_user, interaction, spanish })]
			})
			const scores = await user.scores.recent();
			let score = scores[0];

			if (subcommand == "add") return droid.tracking.add(user, score, interaction)
			else return droid.tracking.remove(user!, interaction)
		}
	}
}