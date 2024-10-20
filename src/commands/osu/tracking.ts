import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { embed } from "../../functions/messages/embeds"
import OsuAccountTrackModel from "../../schemas/osutracking"
import DroidAccountTrackModel from "../../schemas/droidtracking"
import GuildConfigModel from "../../schemas/guild"
import { v2 } from "osu-api-extended"
import { osu } from "../../functions/osu/functions"

export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("tracking")
		.setDMPermission(false)
		.setDescription("osu!droid - Añadir un perfil al sistema de tracking.")
		.addSubcommandGroup(group =>
			group
				.setName('osu')
				.setDescription('osu!')
				.addSubcommand(subcommand =>
					subcommand
						.setName('add')
						.setDescription('osu! - Añadir un perfil al sistema de tracking.')
						.addStringOption(option => option.setName('username').setDescription('Username de la cuenta a agregar.').setRequired(true))
						.addIntegerOption(option => option.setName("mode").setDescription("Modo de juego.").addChoices(
							[
								{ name: "osu!", value: 0 },
								{ name: "osu!taiko", value: 1 },
								{ name: "osu!catch", value: 2 },
								{ name: "osu!mania", value: 3 },
							]
						)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('delete')
						.setDescription('osu! - Eliminar un perfil del sistema de tracking.')
						.addStringOption(option => option.setName('username').setDescription('Username de la cuenta a eliminar.').setRequired(true))
				)
		)
		.addSubcommandGroup(group =>
			group
				.setName('droid')
				.setDescription('osu!droid')
				.addSubcommand(subcommand =>
					subcommand
						.setName('add')
						.setDescription('osu!droid - Añadir un perfil al sistema de tracking.')
						.addIntegerOption(option => option.setName('uid').setDescription('UID de la cuenta a agregar.').setRequired(true))
				)
				.addSubcommand(subcommand =>
					subcommand
						.setName('delete')
						.setDescription('osu!droid - Eliminar un perfil del sistema de tracking.')
						.addIntegerOption(option => option.setName('uid').setDescription('UID de la cuenta a eliminar.').setRequired(true))
				)
		),

	async execute(client, interaction) {
		const subcommandgroup = interaction.options.getSubcommandGroup()
		const subcommand = interaction.options.getSubcommand()
		await interaction.deferReply({ ephemeral: true })
		if (!interaction.guild || !interaction.channel) {
			return await interaction.editReply({
				embeds: [await embed.interaction("error", `Ve a un servidor para ejecutar ese comando.`, interaction)]
			})
		}

		if (subcommandgroup == "droid") {
			const uid = interaction.options.getInteger("uid", true)
			const data = await droid.scores.recent(uid)
			if (!data) {
				return interaction.editReply({ embeds: [await embed.interaction("error", `El usuario con UID \`${uid}\` no existe.`, interaction)] })
			}

			const user = data[0].user
			const recent = data[0]
			const dbCheck = await DroidAccountTrackModel.findOne({ uid: user.id, guild: interaction.guild.id })
			const log_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: interaction.guild.id }))?.channel.logs}`)

			if (subcommand == "add") {

				if (dbCheck?.guild == interaction.guild.id) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `El perfil  **:flag_${dbCheck.country.toLowerCase()}:  ${dbCheck.username}**  ya está en el sistema.`, interaction)]
					})
				}
				const user_already = await DroidAccountTrackModel.findOne({ discord_id: interaction.user.id, guild: interaction.guild.id })
				if (user_already?.guild == interaction.guild.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `Ya tienes un perfil en el sistema:  **:flag_${user_already.country.toLowerCase()}:  ${user_already.username}**\n>Utiliza el comando \`/tracking delete\` para borrarlo.`, interaction)]
					})
				}
				await new DroidAccountTrackModel({
					username: user.username,
					uid: user.id,
					timestamp: recent.timestamp,
					country: user.country,
					last_score: recent.score,
					discord_id: interaction.user.id,
					guild: interaction.guild.id,
				}).save().then(async () => {
					await interaction.editReply({
						embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue añadido al sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`, interaction)]
					})
				})
				if (log_channel && log_channel?.type == ChannelType.GuildText) {
					log_channel.send({
						embeds: [await embed.logs(
							"success",
							"Se añadió un usuario al sistema de tracking de osu!droid.",
							`El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue añadido por <@${interaction.user.id}>`,
							interaction
						)]
					})
				}
			}

			if (subcommand == "delete") {
				if (!dbCheck) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `El perfil  con UID \`${uid}]\` no está en el sistema.`, interaction)]
					})
				} else if (dbCheck.discord_id != interaction.user.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `No puedes eliminar a  **:flag_${user.country.toLowerCase()}:  ${user.username}**  del sistema, porque no está asociado a tu cuenta de Discord.`, interaction)]
					})
				}
				await dbCheck.deleteOne().then(async () => {
					await interaction.editReply({
						embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue eliminado del sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`, interaction)]
					})

					if (log_channel && log_channel?.type == ChannelType.GuildText) {
						log_channel.send({
							embeds: [await embed.logs(
								"warn",
								"Se eliminó a un usuario del sistema de tracking de osu!droid.",
								`El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue eliminado por <@${interaction.user.id}>`,
								interaction
							)]
						})
					}


				})
			}
		} else {
			const username = interaction.options.getString("username", true)
			const gamemode_int = interaction.options.getInteger("mode") || 0
			const gamemode = osu.gamemode.code(gamemode_int)
			const user = await v2.user.details(username, gamemode)
			if (!user) return await interaction.editReply({
				embeds: [
					await embed.interaction("error", "Ese usuario no existe.", interaction)
				]
			})
			const log_channel = client.channels.cache.get(`${(await GuildConfigModel.findOne({ id: interaction.guild.id }))?.channel.logs}`)
			if (subcommand == "add") {
				const dbCheck = await OsuAccountTrackModel.findOne({ uid: user.id, guild: interaction.guild.id, mode: gamemode })
				if (dbCheck?.guild == interaction.guild.id) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `El perfil  **:flag_${user.country_code.toLowerCase()}:  ${dbCheck.username}**  ya está en el sistema para ese modo.`, interaction)]
					})
				}
				const user_already = await OsuAccountTrackModel.findOne({ discord_id: interaction.user.id, guild: interaction.guild.id })
				if (user_already) {
					if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true) && user_already?.uid != user.id) {
						return await interaction.editReply({
							embeds: [await embed.interaction("error", `Ya tienes un perfil en el sistema:  **:flag_${user_already.country}:  ${user_already.username}**\n> Utiliza el comando \`/tracking osu delete\` para borrarlo.`, interaction)]
						})
					}
				}

				const recent = await v2.scores.user.category(user.id, "recent", { include_fails: false, mode: gamemode, limit: "1" })
				var score_id = 0
				if (recent[0]) {
					score_id = recent[0].id
				}
				await new OsuAccountTrackModel({
					username: user.username,
					uid: user.id,
					mode: gamemode,
					mode_int: gamemode_int,
					country: user.country.code.toLowerCase(),
					last_score_id: score_id,
					discord_id: interaction.user.id,
					guild: interaction.guild.id,
				}).save().then(async () => {
					await interaction.editReply({
						embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue añadido al sistema de tracking de  **${osu.gamemode.full(gamemode_int)}**.`, interaction)]
					})
				})
				if (log_channel && log_channel?.type == ChannelType.GuildText) {
					log_channel.send({
						embeds: [await embed.logs(
							"success",
							`Se añadió un usuario al sistema de tracking de osu!${gamemode.replace("fruits", "catch").replace("osu", '')}.`,
							`El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue añadido por <@${interaction.user.id}>`,
							interaction
						)]
					})
				}
			} else {
				const user_modes = await OsuAccountTrackModel.find({ uid: user.id, guild: interaction.guild.id })
				if (!user_modes) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `Ese usuario no está en el sistema.`, interaction)]
					})
				} else if (user_modes[0].discord_id != interaction.user.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)) {
					return await interaction.editReply({
						embeds: [await embed.interaction("error", `No puedes eliminar a  **:flag_${user_modes[0].country.toLowerCase()}:  ${user_modes[0].username}**  del sistema, porque no está asociado a tu cuenta de Discord.`, interaction)]
					})
				}
				await OsuAccountTrackModel.deleteMany({ uid: user.id, guild: interaction.guild.id }).then(async () => {
					await interaction.editReply({
						embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue eliminado del sistema de tracking de  **${osu.gamemode.full(gamemode_int)}**`, interaction)]
					})
					if (log_channel && log_channel?.type == ChannelType.GuildText) {
						log_channel.send({
							embeds: [await embed.logs(
								"warn",
								`Se eliminó a un usuario del sistema de tracking de osu!`,
								`El usuario  **:flag_${user.country.code.toLowerCase()}:  ${user.username}**  fue eliminado por <@${interaction.user.id}>`,
								interaction
							)]
						})
					}
				})
			}
		}
	}
}