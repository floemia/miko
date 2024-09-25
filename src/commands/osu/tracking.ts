import { ChannelType, PermissionsBitField, SlashCommandBuilder } from "discord.js"
import type { Command } from "../../types"
import { droid } from "../../functions/osu!droid/functions"
import { MapInfo } from "@rian8337/osu-base"
import { getAverageColor } from "fast-average-color-node"
import { embed } from "../../functions/messages/embeds"
import DroidAccountTrackModel from "../../schemas/droidtracking"
import GuildConfigModel from "../../schemas/guild"

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName("tracking")
        .setDescription("osu!droid - Añadir un perfil al sistema de tracking.")
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('osu!droid - Añadir un perfil al sistema de tracking.')
                .addIntegerOption(option => option.setName('uid').setDescription('UID de la cuenta a agregar.').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('osu!droid - Eliminar un perfil del sistema de tracking.')
                .addIntegerOption(option => option.setName('uid').setDescription('UID de la cuenta a eliminar.').setRequired(true))),

    async execute(client, interaction) {
        await interaction.deferReply({ephemeral: true})
        const subcommand = interaction.options.getSubcommand()
        const uid = interaction.options.getInteger("uid", true)
        if (!interaction.guild || !interaction.channel){
            return await interaction.editReply({
                embeds: [await embed.interaction("error", `Ve a un servidor para ejecutar ese comando.`, interaction)]
            })
        }
        const data = await droid.recent(uid)
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
            const user_already = await DroidAccountTrackModel.findOne({ discord_id: interaction.user.id , guild: interaction.guild.id })
            if (user_already?.guild == interaction.guild.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true)){
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
            }).save().then( async () => {
                await interaction.editReply({
                    embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue añadido al sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`, interaction)]
                })
            })
            if (log_channel && log_channel?.type == ChannelType.GuildText){
                log_channel.send({ embeds:[await embed.logs(
                    "success",
                    "Se añadió un usuario al sistema de tracking de osu!droid.",
                    `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue añadido por <@${interaction.user.id}>`,
                    interaction
                )]})
            }
        }

        if (subcommand == "delete") {
            if (!dbCheck) { 
                return await interaction.editReply({
                    embeds: [await embed.interaction("error", `El perfil  con UID \`${uid}]\` no está en el sistema.`, interaction)]
                })
            } else if (dbCheck.discord_id != interaction.user.id && !interaction.memberPermissions?.has(PermissionsBitField.Flags.ManageGuild, true) ) {
                return await interaction.editReply({
                    embeds: [await embed.interaction("error", `No puedes eliminar a  **:flag_${user.country.toLowerCase()}:  ${user.username}**  del sistema, porque no está asociado a tu cuenta de Discord.`, interaction)]
                })
            }
            await dbCheck.deleteOne().then( async () => {
                await interaction.editReply({
                    embeds: [await embed.interaction("success", `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue eliminado del sistema de tracking de  <:droid_simple:1021473577951821824>  **osu!droid**.`, interaction)]
                })

                if (log_channel && log_channel?.type == ChannelType.GuildText){
                    log_channel.send({ embeds:[await embed.logs(
                        "warn",
                        "Se eliminó a un usuario del sistema de tracking de osu!droid.",
                        `El usuario  **:flag_${user.country.toLowerCase()}:  ${user.username}**  fue añadido por <@${interaction.user.id}>`,
                        interaction
                    )]})
                }


            } )
        }
    }
}
