import { Config } from "@core/Config";
import { ScoreRank } from "@rian8337/osu-base";
import { client } from "@root";
import { ApplicationEmoji, Snowflake, Collection, Guild, Emoji } from "discord.js";

export abstract class EmojiHelper {
    private static app_emojis: Collection<Snowflake, ApplicationEmoji>;
    private static guild: Guild;
    static readonly miko_emoji = "<:miko01:1417587405124403280>";

    /**
     * Get the emoji of a specific osu! score rank.
     * @param rank The `ScoreRank` to get the emoji of.
     * @returns An instance of `Emoji` representing the rank.
     */
    static getRankEmoji(rank: ScoreRank): Emoji | undefined {
        return client.emojis.cache.find(emoji => emoji.id == Config.rank_emojis[rank])
    }

    static getResponseEmoji(type: "success" | "error") : Emoji | undefined {
        const emoji = type == "success" ? Config.ok_emoji : Config.error_emoji;
        return client.emojis.cache.find(e => e.id == emoji);
    }


    /**
     * Get the emoji of a specific osu! beatmap ranking status.
     * @param status The `number` representing the ranking status.
     * @returns An instance of `Emoji` representing the ranking status.
     */
    static getStatusEmoji(status: number): Emoji | undefined {
        return client.emojis.cache.find(emoji => emoji.id == Config.status_emojis[Math.max(0, status) as keyof typeof Config.status_emojis])
    }

    /**
     * Gets the BPM emoji.
     * @returns An instance of `Emoji` representing the BPM emoji.
     */
    static getBPMEmoji(): Emoji | undefined {
        return client.emojis.cache.find(emoji => emoji.id == Config.bpm_emoji);
    }

    /**
     * Gets the length emoji.
     * @returns An instance of `Emoji` representing the length emoji.
     */
    static getLengthEmoji(): Emoji | undefined {
        return client.emojis.cache.find(emoji => emoji.id == Config.length_emoji);
    }
}