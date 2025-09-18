import { SlashCommand } from "@structures/core";
import { MikoError } from "@structures/errors";
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction, str) => {
    const channel_id = interaction.options.getString("channel", true);
    const message = interaction.options.getString("message", true);
    const channel = client.channels.cache.get(channel_id);
    if (!channel) throw new MikoError("Channel not found.");
    if (!channel.isTextBased() || channel.type != ChannelType.GuildText) throw new MikoError("Channel is not a text channel.");
    if (!channel.permissionsFor(channel.client.user)!.has(PermissionFlagsBits.SendMessages))throw new MikoError("I don't have permissions to send messages in that channel.");

    await channel.sendTyping();
    setTimeout(async () => await channel.send(message), Math.floor(Math.random() * 7000));
}


export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("say")
        .setDescription("🛠️ (DEV!) Say something!")
        .addStringOption(option =>
            option.setName("channel")
                .setDescription("The desired channel.")
                .setRequired(true)
            )
        .addStringOption(option =>
            option.setName("message")
                .setDescription("The message to send.")
                .setRequired(true)
        )



export const dirname = __dirname;