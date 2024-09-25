import { ChannelType, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { embed } from "../../functions/messages/embeds"
import GuildConfigModel from "../../schemas/guild"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName("config")
        .setDescription("a")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('track')
                .setDescription('osu!droid - Opciones del sistema de tracking.')
                .addChannelOption(option => option.setName('channel').setDescription('Canal en el que se mandarán los scores recientes.').setRequired(true).addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('General - Opciones de logs.')
                .addChannelOption(option => option.setName('channel').setDescription('Canal en el que se mandarán logs importantes.').setRequired(true).addChannelTypes(ChannelType.GuildText))),

    async execute(client, interaction) {
        await interaction.deferReply({ ephemeral: true })
        if (!interaction.guild || !interaction.channel) {
            return await interaction.editReply({
                embeds: [await embed.interaction("error", `Ve a un servidor para ejecutar ese comando.`, interaction)]
            })
        }

        const subcommand = interaction.options.getSubcommand()
        const channel = interaction.options.getChannel("channel")
        if (!channel || !interaction.guild.channels.cache.has(channel.id)) {
            return await interaction.editReply({
                embeds: [await embed.interaction("error", `Canal inválido o no existe en ${interaction.guild.name}.`, interaction)]
            })
        }
        var guild_db = await GuildConfigModel.findOne({ id: interaction.guild.id })
        if (!guild_db) {
            new GuildConfigModel({
                id: interaction.guild.id,
                channel: {
                    track: "0",
                    logs: "0"
                }
            }).save().then(async (e) => {
                guild_db = e
            })
        }

        const log_channel = client.channels.cache.get(`${guild_db?.channel.logs}`)

        if (subcommand == "track") {
            await guild_db?.updateOne({"$set": {
                "channel.track": channel.id
            }
            })
            await interaction.editReply({
                embeds:[
                    await embed.interaction(
                        "success",
                        `El canal de tracking ahora es <#${channel.id}>.`,
                        interaction
                    )
                ]
            })
            if (log_channel && log_channel.type == ChannelType.GuildText) {
                log_channel.send({ embeds:[
                    await embed.logs(
                        "warn",
                        "Se cambió el canal de tracking.",
                        `Fue cambiado por <@${interaction.user.id}>. El nuevo canal de tracking es <#${channel.id}>`,
                        interaction
                    )
                ]})
            }
        }
        if (subcommand == "logs") {
            await guild_db?.updateOne({"$set": {
                "channel.logs": channel.id
            }
            })
            await interaction.editReply({
                embeds:[
                    await embed.interaction(
                        "success",
                        `El canal de logs ahora es <#${channel.id}>.`,
                        interaction
                    )
                ]
            })

            if (log_channel && log_channel.type == ChannelType.GuildText) {
                log_channel.send({ embeds:[
                    await embed.logs(
                        "warn",
                        "Se cambió el canal de logs.",
                        `Fue cambiado por <@${interaction.user.id}>. El nuevo canal de logs es <#${channel.id}>`,
                        interaction
                    )
                ]})
            }
        }


    }
}
