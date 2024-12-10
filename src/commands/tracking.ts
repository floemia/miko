import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js"
import type { Command } from "../types"
import { droid } from "../functions/osu!droid/functions"
import { embed } from "../functions/messages/embeds"
import OsuAccountTrackModel from "../schemas/osutracking"
import DroidAccountTrackModel from "../schemas/droidtracking"
import GuildConfigModel from "../schemas/guild"
import { v2 } from "osu-api-extended"
import { osu } from "../functions/osu/functions"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("tracking")
		.setDMPermission(false)
		.setDescription("tracking yay")
		.addSubcommandGroup(group =>
			group
				.setName('osu')
				.setDescription('osu!')
				.addSubcommand(subcommand =>
					subcommand
						.setName("add").setNameLocalization("es-ES", "agregar")
						.setDescription("osu! - Add an user to the score tracking system.").setDescriptionLocalization("es-ES", "osu! - Añadir a un usuario al sistema de score tracking.")
						.addStringOption(option =>
							option.setName('username')
								.setDescription("Username of the osu! profile.").setDescriptionLocalization("es-ES", "Username del perfil de osu!")
								.setRequired(true))
						.addIntegerOption(option =>
							option.setName("mode").setNameLocalization("es-ES", "modo")
								.setDescription("Gamemode to track.")
								.setDescriptionLocalization("es-ES", "Modo de juego de osu!")
								.addChoices(
									[
										{ name: "osu!", value: 0 },
										{ name: "osu!taiko", value: 1 },
										{ name: "osu!catch", value: 2 },
										{ name: "osu!mania", value: 3 },
									]
								)))
				.addSubcommand(subcommand =>
					subcommand
						.setName("delete").setNameLocalization("es-ES", "eliminar")
						.setDescription("osu! - Delete an user to the score tracking system.")
						.setDescriptionLocalization("es-ES", "osu! - Eliminar a un usuario al sistema de score tracking.")
						.addStringOption(option =>
							option.setName('username')
								.setDescription('Username of the osu! profile.')
								.setDescriptionLocalization("es-ES", "Username del perfil de osu!")
								.setRequired(true))
						.addIntegerOption(option =>
							option.setName('mode').setNameLocalization("es-ES", "modo")
								.setDescription("Gamemode to remove from score tracking. If unspecified, all tracked gamemodes will be deleted.")
								.setDescriptionLocalization("es-ES", "Modo de juego a eliminar del sistema de score tracking. Si no se especifica uno, se borrarán todos.")
								.addChoices(
									[
										{ name: "osu!", value: 0 },
										{ name: "osu!taiko", value: 1 },
										{ name: "osu!catch", value: 2 },
										{ name: "osu!mania", value: 3 },
									]
								))

				)
		)
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
								.setDescriptionLocalization("es-ES", "UID del perfil de osu!droid.")
								.setRequired(true))
				)
		),

	async execute(client, interaction) {
		const subcommandgroup = interaction.options.getSubcommandGroup()
		const subcommand = interaction.options.getSubcommand()
		await interaction.deferReply({ ephemeral: true })
		const spanish = ["es-ES", "es-419"].includes(interaction.locale)

		if (!interaction.guild || !interaction.channel) return
		if (subcommandgroup == "droid") {
			const uid = interaction.options.getInteger("uid", true)
			const data = await droid.request(uid)
			if (!data) return interaction.editReply({
				embeds: [
					embed.response({
						type: "error",
						description: spanish ? `El usuario con UID \`${uid}\` no existe.` : `An osu!droid profile with UID \`${uid}\` doesn't exist.`,
						interaction: interaction
					})
				]
			})
			const user = await droid.user({ uid: uid })
			const scores = await droid.scores({ uid: uid, type: "recent", response: data })
			let score
			if (scores && scores.length) score = scores[0]
			else score = undefined
			if (subcommand == "add") return droid.tracking.add(user!, score, interaction)
			else return droid.tracking.remove(user!, interaction)

		} else {

			const username = interaction.options.getString("username", true)
			const gamemode_int = interaction.options.getInteger("mode") || undefined
			const user = await v2.user.details(username)
			if (!user) return interaction.editReply({
				embeds: [
					embed.response({
						type: "error",
						description: spanish ? `El usuario no existe.` : "User not found.",
						interaction: interaction
					})
				]
			})
			if (subcommand == "add") await osu.tracking.add(user, interaction, gamemode_int)
			else await osu.tracking.remove(user, interaction, gamemode_int)
		}
	}
}