import { DroidCard } from "@floemia/osu-droid-card";
import { SlashCommand } from "@structures/core";
import { InteractionEmbedBuilder } from "@utils/builders";
import { CacheManager } from "@utils/managers";
import { SlashCommandBuilder } from "discord.js";

export const developer: SlashCommand["developer"] = true;

export const run: SlashCommand["run"] = async (client, interaction) => {
    const bancho_users = CacheManager.bancho_users;
    const rx_users = CacheManager.rx_users;
    const bancho_cards = CacheManager.bancho_card_buffers;
    const rx_cards = CacheManager.rx_card_buffers;
    const bancho_scores = CacheManager.bancho_score_embeds;
    const rx_scores = CacheManager.rx_score_embeds;
    const embed = new InteractionEmbedBuilder(interaction)
        .setMessage(`**bancho users:** ${bancho_users.size}\n**rx users:** ${rx_users.size}\n**bancho cards:** ${bancho_cards.size}\n**rx cards:** ${rx_cards.size}\n**bancho scores:** ${bancho_scores.size}\n**rx scores:** ${rx_scores.size}`)

    await interaction.editReply({ embeds: [embed] });

}

export const data: SlashCommand["data"] =
    new SlashCommandBuilder()
        .setName("cache")
        .setDescription("Get the cache size.")

export const dirname = __dirname;