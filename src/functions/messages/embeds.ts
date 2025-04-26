import { Interaction, EmbedBuilder } from "discord.js"
import { client } from "../../"
import { EmbedType, EmbedColors } from "./types"

export const response = (params: {type: EmbedType, description: string, interaction: Interaction}) => {
    const embed = new EmbedBuilder()
        .setAuthor({ iconURL: params.interaction.user.displayAvatarURL(), name: `${params.interaction.user.displayName}` })
        .setTimestamp()
        .setDescription(`> ${EmbedColors[params.type].emoji} ${params.description}`)
        .setColor(Number(`0x${EmbedColors[params.type].color}`))
        .setFooter({ iconURL: client.user.displayAvatarURL(), text: client.user.username })
    return embed
}

const logs = (params: {type: EmbedType, title: string, description: string, interaction: Interaction}) => {
    const embed = new EmbedBuilder()
    .setTitle(params.title)
    .setTimestamp()
    .setThumbnail(params.interaction.user.avatarURL({ size:2048 }))
    .setDescription(`> ${EmbedColors[params.type].emoji} ${params.description}`)
    .setColor(Number(`0x${EmbedColors[params.type].color}`))
    .setFooter({ iconURL: client.user.displayAvatarURL(), text: client.user.username })
return embed
}

export const embed = { logs, response }