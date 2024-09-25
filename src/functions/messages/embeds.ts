import { Interaction, EmbedBuilder } from "discord.js"
import type { Command, GlobClient } from "../../types"
import { client } from "../../"
type colorType = "text" | "variable" | "error"
type embedType = "success" | "neutral" | "error" | "warn"


const themeColors = {
    text: "#ff8e4d",
    variable: "#ff624d",
    error: "#f5426c"
}

const embedColors = {
    success: {
        color: "43B581",
        emoji: "<:greencheck:900148615677358090>"
    },
    neutral: {
        color: "dedede",
        emoji: "<:graycheck:903741976061567027>"
    },
    error: {
        color: "f5426c",
        emoji: "<:redx:900142062568079460>"
    },
    warn: {
        color: "f5426c",
        emoji: "<:redwarn:903008123550335046>"
    }
}



export const interaction = async (type: embedType, description: string, interaction: Interaction) => {
    const embed = new EmbedBuilder()
        .setAuthor({ iconURL: interaction.user.displayAvatarURL(), name: `${interaction.user.displayName}` })
        .setTimestamp()
        .setDescription(`> ${embedColors[type].emoji} ${description}`)
        .setColor(Number(`0x${embedColors[type].color}`))
        .setFooter({ iconURL: client.user.displayAvatarURL(), text: client.user.username })
    return embed
}

const logs = async (type:embedType, title: string, description: string, interaction: Interaction) => {
    const embed = new EmbedBuilder()
    .setTitle(title)
    .setTimestamp()
    .setThumbnail(interaction.user.avatarURL({ size:2048 }))
    .setDescription(`> ${embedColors[type].emoji} ${description}`)
    .setColor(Number(`0x${embedColors[type].color}`))
    .setFooter({ iconURL: client.user.displayAvatarURL(), text: client.user.username })
return embed
}

export const embed = { logs, interaction }