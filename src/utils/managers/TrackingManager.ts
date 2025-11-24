import { DroidBanchoUser } from "@floemia/osu-droid-utils";
import { DatabaseManager } from "./DatabaseManager";
import { Logger as log } from "@utils/helpers";
import { ChannelType, Guild, PermissionFlagsBits, TextChannel } from "discord.js";
import { Config } from "@core/Config";
import { DroidTrackingEntry } from "@structures/database";
import { ScoreEmbedBuilder } from "@utils/builders";
import { client } from "@root";

export abstract class TrackingManager {
    /**
     * Whether the tracking system is enabled or not.
     */
    static enabled = Config.tracking.enabled;

    /**
     * Whether the tracking system is running or not.
     */
    static running: boolean = false;

    /**
     * The interval in milliseconds between each step.
     */
    static interval = Config.tracking.interval;

    /**
     * The entries of the osu!droid score tracking system.
     */
    static entries: DroidTrackingEntry[] = [];


    /**
     * Gets all users tracked by the osu!droid score tracking system.
     * @returns An array of `DroidTrackingEntry` objects.
     */
    static async getUsers(): Promise<DroidTrackingEntry[]> {
        return await DatabaseManager.getTrackingUsers();
    }
    /**
     * Adds a user to the tracking system.
     * @param user The `DroidBanchoUser` to add.
     * @param guild The `Guild` this user will be tracked in.
     * @returns `true` if the user was added, `false` if the user was already in.
     */
    static async addUser(user: DroidBanchoUser, guild: Guild): Promise<boolean> {
        return await DatabaseManager.addTrackingUser(user, guild);
    }

    /**
     * Deletes a user from the tracking system.
     * @param user The `DroidBanchoUser` to delete.
     * @param guild The `Guild` this user is tracked in.
     */
    static async deleteUser(user: DroidBanchoUser, guild: Guild): Promise<boolean> {
        return await DatabaseManager.deleteTrackingUser(user, guild);
    }


    private static async getUser(user: DroidTrackingEntry): Promise<DroidBanchoUser | undefined> {
        try {
            return await DroidBanchoUser.get({ uid: user.uid });
        } catch (error) {
            this.running = false;
            log.err({ prefix: "TRACKING", message: `osu!droid score tracking system stopped due to an error.`, error: error });
        }
    }

    /**
     * Gets the score tracking channel for a given `Guild`.
     * @param guild The Discord `Guild`.
     * @returns The `TextChannel` set as the score tracking channel.
     */
    static async getTrackingChannel(guild: Guild): Promise<TextChannel | undefined> {
        const guild_config = await DatabaseManager.getGuildConfig(guild);
        if (!guild_config) return;

        const channel = guild.channels.cache.get(guild_config.channel.track);
        return channel?.type == ChannelType.GuildText ? channel : undefined;
    }

    /**
     * Starts the score tracking system.
     */
    static async start(): Promise<void> {
        this.running = true;
        this.entries = await DatabaseManager.getTrackingUsers();
        log.out({ prefix: "TRACKING", message: `The osu!droid score tracking system is starting with ${this.entries.length} entries.` });
        while (this.running) {
            for (const dbuser of this.entries) {
                if (!this.running || !this.enabled) break;
                await new Promise(resolve => setTimeout(resolve, this.interval));
                const user = await this.getUser(dbuser);
                if (!user) continue;
                let scores = user.getRecentScores().filter(score => score.played_at > dbuser.timestamp).slice(0, 3).reverse();
                if (!scores.length) continue;

                log.out({ prefix: "TRACKING", message: `Processing ${scores.length} scores from ${dbuser.username}...` });
                for (const score of scores) {
                    if (!this.running || !this.enabled) break;
                    if (score == scores[scores.length - 1]) await DatabaseManager.updateTrackingEntry(dbuser.uid, score.played_at);
                    const embed = await new ScoreEmbedBuilder()
                        .setUser(user)
                        .setScore(score)
                    log.out({ prefix: "TRACKING", message: `${score.filename} + ${score.mods.toString() || "NM"}` });
                    for (const dbguild of dbuser.guilds) {
                        const guild = client.guilds.cache.get(dbguild);
                        if (!guild) continue;

                        const track_channel = await this.getTrackingChannel(guild);
                        if (!track_channel) continue;

                        const bot_member = guild.members.me!;
                        if (!bot_member.permissionsIn(track_channel).has(PermissionFlagsBits.SendMessages)) continue;
                        await track_channel.send({ embeds: [embed] });
                    }

                    // little delay to avoid flooding the channel with ten quintillion embeds at once
                    if (scores.length > 1) await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
        }
    }

    /**
     * Updates all of the osu!droid score tracking system's entries.
     */
    static async update(): Promise<void> {
        this.entries = await DatabaseManager.getTrackingUsers();
        const prev_state = this.running;
        this.stop();
        log.out({ prefix: "TRACKING", message: `Updating ${this.entries.length} entries...` });
        for (const entry of this.entries) {
            const user = await this.getUser(entry);
            if (!user) continue;
            const score = user.getRecentScores()[0];
            if (!score) continue;
            await DatabaseManager.updateTrackingEntry(entry.uid, score.played_at);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        log.out({ prefix: "TRACKING", message: "The osu!droid score tracking system's entries has been updated." });
        if (prev_state) this.start();
    }

    /**
     * Stops the score tracking system.
     */
    static stop(): void {
        if (this.running) log.out({ prefix: "TRACKING", message: "The osu!droid score tracking system has been stopped." });
        this.running = false;
    }
}