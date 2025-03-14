import { InteractionContextType, ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import GuildConfigModel from "../../schemas/guild"


export const command: Command = {
	data: new SlashCommandBuilder()
		.setName("config")
		.setDescription("a")
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommandGroup(group =>
			group
				.setName('track')
				.setDescription('osu!droid - Opciones del sistema de tracking.')
				.addSubcommand(subcommand =>
					subcommand
						.setName("channel")
						.setDescription("Canal en el que se mandarán los scores recientes.")
						.addChannelOption(option => option.setName('channel').setDescription('Canal en el que se mandarán los scores recientes.')
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildText)))

				.addSubcommand(subcommand =>
					subcommand
						.setName("status")
						.setDescription("Estado del sistema de tracking.")
						.addIntegerOption(option => option.setName('status')
						.setDescription("Estado del sistema de tracking.")
							.addChoices(
								{ name: "on", value: 1 },
								{ name: "off", value: 0 }
							)
							.setRequired(true)))
		)
		.addSubcommandGroup(group =>
			group
				.setName('logs')
				.setDescription('General - Opciones de logs.')
				.addSubcommand(subcommand =>
					subcommand
						.setName("channel")
						.setDescription("Canal en el que se mandarán logs importantes.")
						.addChannelOption(option => option.setName('channel').setDescription('Canal en el que se mandarán logs importantes.')
							.setRequired(true)
							.addChannelTypes(ChannelType.GuildText)))
		),

	async execute(client, interaction) {
		await interaction.deferReply({ ephemeral: true })
		if (!interaction.guild || !interaction.channel) return

		const subcommandgroup = interaction.options.getSubcommandGroup()
		const subcommand = interaction.options.getSubcommand()
		const channel = interaction.options.getChannel("channel")
		var guild_db = await GuildConfigModel.findOne({ id: interaction.guild.id })
		if (!guild_db) {
			new GuildConfigModel({
				id: interaction.guild.id,
				tracking_enabled: true,
				channel: {
					track: "0",
					logs: "0"
				}
			}).save().then(async (e) => {
				guild_db = e
			})
		}

		const log_channel = client.channels.cache.get(`${guild_db?.channel.logs}`)

		if (subcommandgroup == "track") {

			if (subcommand == "channel") {
				if (!channel) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: `Canal inválido o no existe en ${interaction.guild.name}.`,
						interaction: interaction
					})]
				})

				if (channel.id == guild_db?.channel.track) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: `El canal de tracking ya es <#${channel.id}>.`,
						interaction: interaction
					})]
				})
				await guild_db?.updateOne({ "$set": { "channel.track": channel.id } })
				await interaction.editReply({
					embeds: [
						embed.response({
							type: "success",
							description: `El canal de tracking ahora es <#${channel.id}>.`,
							interaction: interaction
						})
					]
				})
				if (log_channel && log_channel.type == ChannelType.GuildText) {
					log_channel.send({
						embeds: [
							embed.logs({
								type: "warn",
								title: "Se cambió el canal de tracking.",
								description: `Fue cambiado por <@${interaction.user.id}>. El nuevo canal de tracking es <#${channel.id}>`,
								interaction: interaction
							})
						]
					})
				}
			}
			if (subcommand == "status") {

				let status = interaction.options.getInteger("status") == 1 ? true : false
				if (status == guild_db?.tracking_enabled) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: `El sistema de tracking ya está ${status ? "habilitado" : "deshabilitado"}.`,
						interaction: interaction
					})]
				})

				await guild_db?.updateOne({ "$set": { "tracking_enabled": status } })
				await interaction.editReply({
					embeds: [
						embed.response({
							type: "success",
							description: `El sistema de tracking ahora está ${status ? "habilitado" : "deshabilitado"}.`,
							interaction: interaction
						})
					]
				})
				if (log_channel && log_channel.type == ChannelType.GuildText) {
					log_channel.send({
						embeds: [
							embed.logs({
								type: "warn",
								title: "Se cambió el estado del sistema de tracking.",
								description: `Fue cambiado por <@${interaction.user.id}>. El sistema de tracking ahora está ${status ? "habilitado" : "deshabilitado"}.`,
								interaction: interaction
							})
						]
					})
				}
			}
		}

		else if (subcommandgroup == "logs") {
			if (subcommand == "channel") {
				if (!channel) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: `Canal inválido o no existe en ${interaction.guild.name}.`,
						interaction: interaction
					})]
				})
				if (channel.id == guild_db?.channel.logs) return await interaction.editReply({
					embeds: [embed.response({
						type: "error",
						description: `El canal de logs ya es <#${channel.id}>.`,
						interaction: interaction
					})]
				})

				await guild_db?.updateOne({
					"$set": {
						"channel.logs": channel.id
					}
				})
				await interaction.editReply({
					embeds: [
						embed.response({
							type: "success",
							description: `El canal de logs ahora es <#${channel.id}>.`,
							interaction: interaction
						})
					]
				})
				if (log_channel && log_channel.type == ChannelType.GuildText) {
					log_channel.send({
						embeds: [
							embed.logs({
								type: "warn",
								title: "Se cambió el canal de logs.",
								description: `Fue cambiado por <@${interaction.user.id}>. El nuevo canal de logs es <#${channel.id}>`,
								interaction: interaction
							})
						]
					})
				}
			}
		}
	}
}
