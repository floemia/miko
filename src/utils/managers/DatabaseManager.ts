import { DroidBanchoUser, DroidRXUser, DroidUser } from "@floemia/osu-droid-utils";
import { DroidServer } from "@structures/osu!droid/";
import { UserServer, RXUserLink, BanchoUserLink, GuildConfig, GuildConfigEntry, DroidTrack, DroidTrackingEntry } from "@structures/database";
import { Guild, TextChannel, User } from "discord.js";
import { Logger as log } from "@utils/helpers";
import mongoose from "mongoose";
import { CacheManager } from "./CacheManager";
export abstract class DatabaseManager {
    private static mongo_uri = process.env.MONGO_URI;

    /**
     * Initialize connection to MongoDB.
     */
    static async connect(): Promise<void> {
        if (!this.mongo_uri) throw new Error("process.env.MONGO_URI is not defined.");

        log.out({ prefix: "DATABASE", message: "Establishing connection to MongoDB..." });
        await mongoose.connect(this.mongo_uri);
        log.out({ prefix: "DATABASE", message: "Connection established!", important: true });
    }

    /**
     * Get the linked osu!droid user of a Discord user, and store the result in the cache.
     * @param discord_user The Discord user.
     * @param server The osu!droid server. Defaults to "ibancho".
     * @returns Either a `DroidBanchoUser` or a `DroidRXUser` object, depending on the server.
     */
    static async getLinkedUser(discord_user: User, server: DroidServer = "ibancho"): Promise<DroidBanchoUser | DroidRXUser | undefined> {
        const DroidServerUser = server == "ibancho" ? DroidBanchoUser : DroidRXUser;
        const ServerDocuments = server == "ibancho" ? BanchoUserLink : RXUserLink;
        const inCache = CacheManager.getLinkedUser(discord_user, server);
        if (inCache) return await DroidServerUser.get({ uid: inCache });
        const user_id = (await ServerDocuments.findOne({ discord_id: discord_user.id }))?.uid;
        if (!user_id) return;
        const user_droid = await DroidServerUser.get({ uid: user_id });
        if (!user_droid) return;

        CacheManager.setLinkedUser(discord_user, user_droid);
        return user_droid;
    }

    /**
     * Links an osu!droid account to a Discord user, and updates the cache.
     * @param discord_user The Discord user.
     * @param user The osu!droid user.
     */
    static async setLinkedUser(discord_user: User, user: DroidUser): Promise<void> {
        CacheManager.setLinkedUser(discord_user, user);
        const UserLinkServer = user instanceof DroidBanchoUser ? BanchoUserLink : RXUserLink;
        await UserLinkServer.findOneAndUpdate({ discord_id: discord_user.id },
            { uid: user.id, username: user.username, discord_id: discord_user.id },
            { upsert: true, new: true }
        );
    }

    /**
     * Gets the default osu!droid server of a Discord user, and store the result in the cache.
     * @param discord_user The Discord user.
     * @returns The default `DroidServer` of the Discord user.
     */
    static async getDefaultServer(discord_user: User): Promise<DroidServer | undefined> {
        const inCache = CacheManager.getDefaultServer(discord_user);
        if (inCache) return inCache;
        const db = await UserServer.findOne({ discord_id: discord_user.id });
        if (db) {
            CacheManager.setDefaultServer(discord_user, db.server);
            return db.server;
        }
    }

    /**
     * Sets the default osu!droid server of a Discord user, and updates the cache.
     * @param discord_user The Discord user.
     * @param server The `DroidServer` to set as default.
     */
    static async setDefaultServer(discord_user: User, server: DroidServer): Promise<void> {
        CacheManager.setDefaultServer(discord_user, server);
        await UserServer.findOneAndUpdate({ discord_id: discord_user.id },
            { discord_id: discord_user.id, server: server },
            { upsert: true, new: true }
        );
    }

    /**
     * Gets the configuration `Document` of a `Guild`, and store the result in the cache.
     * @param guild The `Guild` to get the configuration for.
     * @returns The configuration of the guild.
     */
    static async getGuildConfig(guild: Guild): Promise<GuildConfigEntry> {
        const inCache = CacheManager.getGuildConfig(guild);
        if (inCache) return inCache;

        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { "$setOnInsert": { id: guild.id }, },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
        return config;
    }

    /**
     * The channel the osu!droid score tracking system should send the scores to in a specific `Guild`.
     * @param guild The affected `Guild`.
     * @param channel The `TextChannel` to be set as the tracking channel.
     */
    static async setTrackChannel(guild: Guild, channel: TextChannel): Promise<void> {
        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { id: guild.id, channel: { track: channel.id } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
    }

    /**
     * Sets the status of the score tracking system in a specific `Guild`.
     * @param guild The affected `Guild`.
     * @param status Whether the tracking system should be enabled or not.
     */
    static async setTrackingStatus(guild: Guild, status: boolean) {
        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { id: guild.id, tracking_enabled: status },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
    }

    /**
     * Gets all users tracked by the osu!droid score tracking system.
     * @returns An array of `DroidTrackingEntry` objects.
     */
    static async getTrackingUsers(): Promise<DroidTrackingEntry[]> {
        return await DroidTrack.find();
    }

    /**
     * Updates the timestamp of an entry in the osu!droid score tracking system.
     * @param uid The UID of the user to update.
     * @param timestamp The new `Date` to set as the timestamp.
     */
    static async updateTrackingEntry(uid: number, timestamp: Date) {
        await DroidTrack.findOneAndUpdate(
            { uid: uid },
            { timestamp: timestamp },
        );
    }

    /**
     * Adds an entry to the osu!droid score tracking system.
     * @param droid_user The `DroidBanchoUser` to add.
     * @param guild The `Guild` the user is tracked in.
     * @returns `true` if the user was added, `false` if the user was already in.
     */
    static async addTrackingUser(droid_user: DroidBanchoUser, guild: Guild): Promise<boolean> {
        const result = await DroidTrack.findOneAndUpdate(
            { uid: droid_user.id },
            {
                $setOnInsert: {
                    uid: droid_user.id,
                    username: droid_user.username,
                    timestamp: new Date(),
                },
                $addToSet: { guilds: guild.id }
            },
            {
                upsert: true,
                returnDocument: "before",
                projection: { guilds: 1 }
            }
        );
        if (!result) return true;
        return !result.guilds.includes(guild.id);

    }

    /**
     * Removes an entry from the osu!droid score tracking system.
     * 
     * If the `guilds` array of the entry is empty, the entry will be deleted.
     * @param droid_user The `DroidBanchoUser` to remove.
     * @param guild The `Guild` the user is tracked in.
     * @returns `true` if the user was deleted, `false` if the user was not in the tracking system.
     */
    static async deleteTrackingUser(droid_user: DroidUser, guild: Guild) {
        const doc = await DroidTrack.findOne({ uid: droid_user.id });

        if (!doc || !doc.guilds.includes(guild.id)) return false;

        const updated = await DroidTrack.findOneAndUpdate(
            { uid: droid_user.id },
            { $pull: { guilds: guild.id } },
            { new: true }
        );

        if (updated && updated.guilds.length === 0) {
            await DroidTrack.deleteOne({ _id: updated._id });
        }

        return true;
    }

}
