import { SlashCommand } from "@structures/core";
import { SlashCommandBuilder } from "discord.js";
import { CacheManager } from "@utils/managers";
import { ResponseEmbedBuilder, ResponseType } from "@utils/builders";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction, str) => {
    const embed = new ResponseEmbedBuilder()
        .setType(ResponseType.SUCCESS)
        .setUser(interaction.user)
        .setDescription(`cards: ${CacheManager.bancho_card_buffers.size} 
            bancho users: ${CacheManager.bancho_users.size}
            rx users: ${CacheManager.rx_users.size}
            bancho scores: ${CacheManager.bancho_score_embeds.size}
            rx scores: ${CacheManager.rx_score_embeds.size}`)
        .setColor("Purple")
        .setTimestamp()

    await interaction.editReply({ embeds: [embed] });
}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("cache")
        .setDescription("🔘 (DEV!) Get the cache sizes.")

export const dirname = __dirname;