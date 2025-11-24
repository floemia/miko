import { CommandHandler, EventHandler } from "@handlers";
import { SlashCommand } from "@structures/core";
import { Logger as log} from "@utils/helpers";
import { DatabaseManager } from "@utils/managers";
import { Client, ClientEvents, Collection } from "discord.js";
import fs from "fs";
import { Config } from "./Config";
import path from "path";
import { OsuAPIRequestBuilder } from "@rian8337/osu-base";
import { TrackingManager } from "@utils/managers/TrackingManager";

const env = process.env;
const token = env.BOT_TOKEN;

/**
 * Main instance of the bot.
 */
export class MikoClient extends Client<true> {
    /**
     * The MongoDB URI.
     */
    private readonly mongo_uri = env.MONGO_URI;

    /**
     * The osu!api v1 key.
     */
    private readonly osu_key = env.OSU_API_KEY;

    /**
     * `Collection` of slash commands.
     */
    commands = new Collection<string, SlashCommand>();
    /**
     * `Collection` of developer slash commands.
     */
    dev_commands = new Collection<string, SlashCommand>();

    /**
     * `Collection` of client events.
     */
    events = new Collection<keyof ClientEvents, (client: MikoClient, ...args: any) => Promise<any>>();

    constructor() {
        super({ intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"] });
    }

    /**
     * Starts the bot.
     * 
     * Needs `BOT_TOKEN`, `OSU_API_KEY` and `MONGO_URI` to be set in the `.env` file.
     */
    async start(): Promise<void> {
        if (!token) throw new Error("process.env.BOT_TOKEN is undefined.");
        if (!this.osu_key) throw new Error("process.env.OSU_API_KEY is undefined.");
        if (!this.mongo_uri) throw new Error("process.env.MONGO_URI is undefined.");
        OsuAPIRequestBuilder.setAPIKey(this.osu_key);
        log.out({ prefix: "CLIENT", message: "Starting all main components..." });

        await DatabaseManager.connect();

        await this.login(token);
        await EventHandler.registerEvents();
        await CommandHandler.registerCommands();
        await TrackingManager.start();
    }

    /**
     * Cycles through the avatars, changing them every hour.
     */
    startAvatarCycle(): void {
        let current_pfp: string | null = null;
        const dir_path = Config.avatar_cycle.path;
        const avatars = fs.readdirSync(dir_path).map(file => path.join(dir_path, file));
        setInterval(async () => {
            const candidates = avatars.filter(pfp => pfp != current_pfp);
            if (candidates.length == 0) return;
            current_pfp = candidates[Math.floor(Math.random() * candidates.length)] || null;
            await this.user.setAvatar(current_pfp);
        }, Config.avatar_cycle.interval);
    }
}