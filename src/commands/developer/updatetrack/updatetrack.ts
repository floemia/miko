import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { ResponseEmbedBuilder, ResponseType } from "@utils/builders";
import { TrackingManager } from "@utils/managers";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction, str) => {
    const embed = new ResponseEmbedBuilder()
        .setType(ResponseType.SUCCESS)
        .setUser(interaction.user)
        .setDescription(`Updating the tracking list...`)
        .setColor("Purple")
        .setTimestamp()
    await interaction.editReply({ embeds: [embed] });
    await TrackingManager.refresh();
    embed.setDescription(`Successfully updated the tracking list.`);
    await interaction.editReply({ embeds: [embed] });

}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("updatetrack")
        .setDescription("🔘 (DEV!) Update the osu!droid scores tracking list.")

export const dirname = __dirname;