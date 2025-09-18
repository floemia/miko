import { RankEmojis } from "@core";
import { client } from "@root";
import { ApplicationEmoji, Snowflake, Collection, Guild, Emoji } from "discord.js";

export abstract class EmojiHelper {
    private static app_emojis: Collection<Snowflake, ApplicationEmoji>;
    private static guild: Guild;
    static readonly miko_emoji = "<:miko01:1417587405124403280>";

    static async init() {
        this.app_emojis = await client.application!.emojis.fetch();
        this.guild = await client.guilds.fetch(client.config.test_guild);
    }

    static getRankEmoji(rank: string): Emoji | undefined {
        const isDebug = client.config.debug;    
        const emoji = isDebug ? this.guild.emojis.cache.find(e => e.name == rank) : this.app_emojis.find(e => e.id == `${client.config.emojis.ranks[(rank as keyof RankEmojis)]}`);
        return emoji;
    }

    static getStatusEmoji(status: number): Emoji | undefined {
        switch (status) {
            case 1: return this.guild.emojis.cache.find(e => e.name == "ranked");
            case 2: case 3: return this.guild.emojis.cache.find(e => e.name == "qf_aprv");
            case 4: return this.guild.emojis.cache.find(e => e.name == "loved");
            default: return this.guild.emojis.cache.find(e => e.name == "graveyard");
        }
    }
}