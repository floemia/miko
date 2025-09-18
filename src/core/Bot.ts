import config from "../../config.json";
import { Client, ClientEvents, Collection } from "discord.js";
import { Logger } from "@utils/logger";
import { CommandHandler, EventHandler } from "@handlers";
import { SlashCommand, Cooldown } from "@structures/core";
import { OsuAPIRequestBuilder } from "@rian8337/osu-base";
import { DBManager, TrackingManager } from "@utils/managers";
import { EmojiHelper } from "@utils/helpers";
import { ClientConfig } from "@core/types";

const env = process.env
const token = env.TOKEN;
const osuAPIKey = env.OSU_API_KEY;
const mongoURI = env.MONGO_URI;

export class Bot extends Client {
	public config = config as ClientConfig;
	public commands = new Collection<string, SlashCommand>();
	public dev_commands = new Collection<string, SlashCommand>();
	public events = new Collection<keyof ClientEvents, (client: Bot, ...args: any) => Promise<any>>();
	public cooldowns = new Collection<string, Cooldown[]>();
	public current_pfp: string = "";
	constructor() {
		super({
			intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"]
		});
	}

	public async start() {
		if (!token) throw new Error("No bot token provided (process.env.TOKEN).");
		if (!osuAPIKey) throw new Error("No osu! API key provided (process.env.OSU_API_KEY).");
		OsuAPIRequestBuilder.setAPIKey(osuAPIKey);

		Logger.out({ prefix: "[DATABASE]", message: "Connecting to MongoDB...", color: "Blue", important: true });
		await DBManager.connect();
		Logger.out({ prefix: "[DATABASE]", message: `Success.`, color: "Blue" });

		await this.login(token);

		Logger.out({ prefix: "[CLIENT]", message: `Registering events...`, color: "Purple", important: true });
		await EventHandler.registerEvents();
		Logger.out({ prefix: "[CLIENT]", message: `Successfully registered ${this.events.size} event(s).`, color: "Purple" });

		Logger.out({ prefix: "[CLIENT]", message: `Registering slash commands...`, color: "Purple", important: true });
		await CommandHandler.registerCommands();
		Logger.out({ prefix: "[CLIENT]", message: `Successfully registered ${this.commands.size} slash command(s) and ${this.dev_commands.size} developer command(s).`, color: "Purple" });
		await EmojiHelper.init();
		
		if (this.config.tracking.enabled) {
			await TrackingManager.start();
		}

	}
}