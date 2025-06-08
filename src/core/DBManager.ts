import mongoose, { set } from "mongoose";
import { BanchoUserLink, RXUserLink, DroidTrack, GuildConfig, UserServer } from "@structures/database";
import { DroidBanchoUser, DroidRXUser } from "miko-modules";
export class DBManager {
	private mongoURI: string;
	constructor() {
		if (!process.env.MONGO_URI) throw new Error("No MongoDB URI provided.");
		this.mongoURI = process.env.MONGO_URI;
	}

	public async connect() {
		await mongoose.connect(this.mongoURI);
	}
	public user = {
		async getDefaultServer(discord_id: string) {
			const db = await UserServer.findOneAndUpdate({ discord_id: discord_id },
				{ "$setOnInsert": { discord_id: discord_id }, },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			);
			return db.server;
		},

		async setDefaultServer(discord_id: string, server: "ibancho" | "rx") {
			await UserServer.findOneAndUpdate({ discord_id: discord_id },
				{ discord_id: discord_id, server: server },
				{ upsert: true, new: true }
			);
		},

		async link(user: DroidBanchoUser | DroidRXUser, discord_id: string) {
			const db = user instanceof DroidBanchoUser ? BanchoUserLink : RXUserLink;
			await db.findOneAndUpdate({ discord_id: discord_id },
				{ uid: user.id, username: user.username, discord_id: discord_id },
				{ upsert: true, new: true }
			);
		},

		async getDroidUser(discord_id: string, server?: "ibancho" | "rx") {
			if (!server) {
				const db = await UserServer.findOne({ discord_id: discord_id });
				if (db) server = db.server;
				else server = "ibancho";
			}
			const Request = server == "ibancho" ? BanchoUserLink : RXUserLink;
			return await Request.findOne({ discord_id: discord_id });
		}
	}

	public guilds = {
		async getConfig(guild_id: string) {
			return GuildConfig.findOneAndUpdate({ id: guild_id },
				{ "$setOnInsert": { id: guild_id }, },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			);
		},

		async setTrackChannel(guild_id: string, channel: string) {
			return GuildConfig.findOneAndUpdate({ id: guild_id },
				{ id: guild_id, channel: { track: channel } },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			);
		},

		async setTrackingStatus(guild_id: string, status: boolean) {
			return GuildConfig.findOneAndUpdate({ id: guild_id },
				{ id: guild_id, tracking_enabled: status },
				{ upsert: true, new: true, setDefaultsOnInsert: true }
			);
		}
	}

	public tracking = {
		async getUsers() {
			return await DroidTrack.find();
		},

		async updateEntry(uid: number, timestamp: Date) {
			return await DroidTrack.findOneAndUpdate(
				{ uid: uid },
				{ timestamp: timestamp },
			);
		},
	}
}