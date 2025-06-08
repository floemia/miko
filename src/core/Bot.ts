import config from "../../config.json";
import mongoose from "mongoose";
import { Client, ClientEvents, Collection } from "discord.js";
import { Logger } from "@utils";
import { CommandHandler, EventHandler } from "@handlers";
import { SlashCommand, Cooldown } from "@structures/core";
import { OsuAPIRequestBuilder } from "@rian8337/osu-base";
import { Tracking } from "./Tracking";
import { DBManager } from "./DBManager";

const env = process.env
const token = env.TOKEN;
const osuAPIKey = env.OSU_API_KEY;
const mongoURI = env.MONGO_URI;

export class Bot extends Client {
	public config = config;
	public commands = new Collection<string, SlashCommand>();
	public events = new Collection<keyof ClientEvents, (client: Bot, ...args: any) => Promise<any>>();
	public cooldowns = new Collection<string, Cooldown[]>();
	public db = new DBManager();
	public current_pfp: string = "";
	public tracking = new Tracking(this.config.tracking.interval);
	constructor() {
		super({
			intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"]
		});
	}

	public async start() {
		if (!token) throw new Error("No token provided (process.env.TOKEN).");
		if (!osuAPIKey) throw new Error("No osu! API key provided (process.env.OSU_API_KEY).");
		OsuAPIRequestBuilder.setAPIKey(osuAPIKey);
		Logger.out({ prefix: "[DATABASE]", message: "Connecting to MongoDB...", color: "Blue", important: true });
		await this.db.connect();
		Logger.out({ prefix: "[DATABASE]", message: `Success.`, color: "Blue" });

		await this.login(token);

		Logger.out({ prefix: "[CLIENT]", message: `Registering events...`, color: "Purple", important: true });
		await EventHandler.registerEvents();
		Logger.out({ prefix: "[CLIENT]", message: `Successfully registered ${this.events.size} event(s).`, color: "Purple" });

		Logger.out({ prefix: "[CLIENT]", message: `Registering slash commands...`, color: "Purple", important: true });
		await CommandHandler.registerCommands();
		Logger.out({ prefix: "[CLIENT]", message: `Successfully registered ${this.commands.size} slash command(s).`, color: "Purple" });

		if (this.config.tracking.droid.enabled) {
			await this.tracking.start();
		}
	}
}