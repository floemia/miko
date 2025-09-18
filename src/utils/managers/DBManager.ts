import mongoose, { set } from "mongoose";
import { BanchoUserLink, RXUserLink, DroidTrack, GuildConfig, UserServer } from "@structures/database";
import { DroidServer } from "@structures/servers";
import { DroidBanchoUser, DroidRXUser, DroidUser } from "@floemia/osu-droid-utils";
import { CacheManager } from "./CacheManager";
import { Guild, GuildMember, TextChannel, User } from "discord.js";

export abstract class DBManager {
    private static readonly mongoURI = process.env.MONGO_URI;

    static async connect() {
        if (!this.mongoURI) throw new Error("No MongoDB URI provided.");
        await mongoose.connect(this.mongoURI);
    }

    static async getLinkedUser(discord_user: User, server: DroidServer = "ibancho") {
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

    static async setLinkedUser(discord_user: User, user: DroidUser) {
        CacheManager.setLinkedUser(discord_user, user);
        const UserLinkServer = user instanceof DroidBanchoUser ? BanchoUserLink : RXUserLink;
        await UserLinkServer.findOneAndUpdate({ discord_id: discord_user.id },
            { uid: user.id, username: user.username, discord_id: discord_user.id },
            { upsert: true, new: true }
        );
    }

    static async getDefaultServer(discord_user: User) {
        const inCache = CacheManager.getDefaultServer(discord_user);
        if (inCache) return inCache;
        const db = await UserServer.findOne({ discord_id: discord_user.id });
        if (db) return db.server;
    }

    static async setDefaultServer(discord_user: User, server: DroidServer) {
        CacheManager.setDefaultServer(discord_user, server);
        await UserServer.findOneAndUpdate({ discord_id: discord_user.id },
            { discord_id: discord_user.id, server: server },
            { upsert: true, new: true }
        );
    }

    static async getGuildConfig(guild: Guild) {
        const inCache = CacheManager.getGuildConfig(guild);
        if (inCache) return inCache;

        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { "$setOnInsert": { id: guild.id }, },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
        return config;
    }

    static async setTrackChannel(guild: Guild, channel: TextChannel) {
        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { id: guild.id, channel: { track: channel.id } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
    }

    static async setTrackingStatus(guild: Guild, status: boolean) {
        const config = await GuildConfig.findOneAndUpdate({ id: guild.id },
            { id: guild.id, tracking_enabled: status },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        CacheManager.setGuildConfig(guild, config);
    }

    static async getTrackingUsers() {
        return await DroidTrack.find();
    }

    static async updateTrackingEntry(uid: number, timestamp: Date) {
        return await DroidTrack.findOneAndUpdate(
            { uid: uid },
            { timestamp: timestamp },
        );
    }

    static async addTrackingUser(droid_user: DroidBanchoUser, user: GuildMember) {
        return await DroidTrack.findOneAndUpdate(
            { uid: droid_user.id },
            {
                $setOnInsert: {
                    uid: droid_user.id,
                    guilds: [{
                        id: user.guild.id,
                        owner_id: user.id
                    }],
                    timestamp: droid_user.getRecentScores()[0].played_at ?? new Date(),
                },
                $addToSet: {
                    guilds: {
                        id: user.guild.id,
                        owner_id: user.id
                    }
                }
            },
            { upsert: true, new: true }
        );
    }

    static async deleteTrackingUser(droid_user: DroidUser, user: GuildMember) {
        return await DroidTrack.deleteOne({ uid: droid_user.id, guilds: { $elemMatch: { id: user.guild.id } } });
    }
}