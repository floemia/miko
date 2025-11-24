import { GuildConfigEntry } from "@structures/database/GuildConfig";
import { APIEmbed, EmbedBuilder, Guild, User } from "discord.js";
import { DroidBanchoScore, DroidBanchoUser, DroidRXScore, DroidRXUser, DroidScore, DroidUser } from "@floemia/osu-droid-utils";
import { DroidServer } from "@structures/osu!droid";

/**
 * A cache entry for a user's osu!droid card.
 */
export interface DroidCardCache  {
    /**
     * The user's osu!droid account.
     */
    user: DroidUser,
    /**
     * The `Buffer` containing the user's osu!droid card.
     */
    cardBuffer: Buffer<ArrayBufferLike>
}

/**
 * Utility class for managing the cache.
 */
export abstract class CacheManager {
    /**
     * A `Map` containing the cached osu!droid main server score embeds.
     */
    static bancho_score_embeds: Map<string, APIEmbed> = new Map()

    /**
     * A `Map` containing the cached osudroid!rx score embeds.
     */
    static rx_score_embeds: Map<string, APIEmbed> = new Map()

    /**
     * A `Map` containing the cached osu!droid main server profile cards.
     */
    static bancho_card_buffers: Map<number, DroidCardCache> = new Map()

    /**
     * A `Map` containing the cached osudroid!rx profile cards.
     */
    static rx_card_buffers: Map<number, DroidCardCache> = new Map()

    /**
     * A `Map` containing the cached osu!droid main server linked IDs.
     */
    static bancho_users: Map<string, number> = new Map()

    /**
     * A `Map` containing the cached osudroid!rx linked IDs.
     */
    static rx_users: Map<string, number> = new Map()

    /**
     * A `Map` containing the cached default `DroidServer` of users.
     */
    static user_server: Map<string, DroidServer> = new Map()

    /**
     * A `Map` containing the cached guild configurations.
     */
    static guild_configs: Map<string, GuildConfigEntry> = new Map()


    /**
     * Store an embed for a given score to the cache.
     * @param score The `DroidScore` which the embed belongs to.
     * @param embed The created `EmbedBuilder` for the score.
     */
    static setScoreEmbed(score: DroidScore, embed: EmbedBuilder): void {
        if (!score.id) return
        const map = score instanceof DroidBanchoScore ? this.bancho_score_embeds : this.rx_score_embeds;
        map.set(`${score.id}-${score.total_score}-${score.played_at.valueOf()}`, embed.toJSON());
    }

    /**
     * Gets the cached score embed for a given score.
     * @param score The `DroidScore` which the embed belongs to.
     * @returns An instance of `EmbedBuilder` containing the score details.
     */
    static getScoreEmbed(score: DroidScore) {
        if (!score.id) return;
        const map = score instanceof DroidBanchoScore ? this.bancho_score_embeds : this.rx_score_embeds;
        return map.get(`${score.id}-${score.total_score}-${score.played_at.valueOf()}`);
    }

    /**
     * Stores the buffer of a given user's profile card to the cache.
     * @param user The `DroidUser` which the card belongs to.
     * @param cardBuffer A `Buffer` of the user's profile card image.
     */
    static setDroidCard(user: DroidUser, cardBuffer: Buffer<ArrayBufferLike>): void {
        const map = user instanceof DroidBanchoUser ? this.bancho_card_buffers : this.rx_card_buffers;
        map.set(user.id, { user: user, cardBuffer: cardBuffer });
    }

    /**
     * Gets the buffer of a given user's profile card from the cache.
     * @param user The `DroidUser` which the card belongs to.
     * @returns A `Buffer` of the user's profile card image.
     */
    static getDroidCard(user: DroidUser): Buffer<ArrayBufferLike> | undefined {
        const map = user instanceof DroidBanchoUser ? this.bancho_card_buffers : this.rx_card_buffers;
        const card = map.get(user.id);
        if (!card || card.user == user ) return;
        return card.cardBuffer;
    }

    /**
     * Stores the linked osu!droid account UID of a given Discord user to the cache.
     * @param discord_user The `User` which the linked account belongs to.
     * @param user The `DroidUser` account.
     */
    static setLinkedUser(discord_user: User, user: DroidUser): void {
        const map = user instanceof DroidBanchoUser ? this.bancho_users : this.rx_users;
        map.set(discord_user.id, user.id);
    }

    /**
     * Gets the linked osu!droid account UID of a given Discord user from the cache.
     * @param discord_user The `User` which the linked account belongs to.
     * @param server The `DroidServer` to get the linked account from.
     * @returns The linked osu!droid account UID.
     */
    static getLinkedUser(discord_user: User, server: DroidServer = "ibancho"): number | undefined {
        const map = server == "ibancho" ? this.bancho_users : this.rx_users;
        return map.get(discord_user.id);
    }

    /**
     * Stores the default osu!droid server of a given Discord user to the cache.
     * @param discord_user The Discord `User`.
     * @param server The `DroidServer` to set as the default.
     */
    static setDefaultServer(discord_user: User, server: DroidServer): void {
        this.user_server.set(discord_user.id, server);
    }

    /**
     * Gets the default osu!droid server of a given Discord user from the cache.
     * @param discord_user The Discord `User`.
     * @returns The default `DroidServer` of the user.
     */
    static getDefaultServer(discord_user: User): DroidServer | undefined {
        return this.user_server.get(discord_user.id);
    }

    /**
     * Gets the guild configuration of a given guild from the cache.
     * @param guild The `Guild` to get the configuration from.
     * @returns An instance of `GuildConfigEntry`.
     */
    static getGuildConfig(guild: Guild): GuildConfigEntry | undefined {
        return this.guild_configs.get(guild.id);
    }

    /**
     * Stores the guild configuration of a given guild to the cache.
     * @param guild The `Guild` in question.
     * @param config The `GuildConfigEntry` to store.
     */
    static setGuildConfig(guild: Guild, config: GuildConfigEntry): void {
        this.guild_configs.set(guild.id, config);
    }
}