import DroidAccountTrackModel from "@structures/mongoose/DroidAccountTrackSchema";
import GuildConfigModel from "@structures/mongoose/GuildConfigSchema";
import { DroidBanchoUser } from "miko-modules";
import { client } from "@root";
import { Embeds, Logger } from "@utils";
import { ChannelType } from "discord.js";
import { en, es } from "@locales";
export class Tracking {
	private cooldown: number = 10;
	private running: boolean = false;
	constructor(cooldown: number) {
		this.cooldown = cooldown;
	}

	public async start() {
		this.running = true;
		if (!client.config.tracking.droid.enabled) client.config.tracking.droid.enabled = true;
		let tracking_users = await DroidAccountTrackModel.find();
		Logger.out({ prefix: "[TRACKING]", message: `osu!droid tracking has started. Found ${tracking_users.length} entries.`, color: "Orange", important: true });
		while (this.running) {
			tracking_users = await DroidAccountTrackModel.find();
			for (const dbuser of tracking_users) {
				if (client.config.debug && dbuser.uid != 177955) continue;
				await new Promise(resolve => setTimeout(resolve, this.cooldown * 1000));
				if (!this.running) break;
				const user = await DroidBanchoUser.get({ uid: dbuser.uid });
				if (!user) continue;
				const score = (await user.scores.recent())[0];
				if (!score || score.played_date <= dbuser.timestamp) continue;
				Logger.out({ prefix: "[TRACKING]", message: `Creating score embed for ${user.username}...`, color: "Orange", important: true });
				Logger.out({ prefix: "[TRACKING]", message: `Beatmap: ${score.filename}`, color: "Orange" });
				Logger.out({ prefix: "[TRACKING]", message: `Guilds: ${dbuser.guilds.map(g => g.id)}`, color: "Orange" });
				await DroidAccountTrackModel.findOneAndUpdate(
					{ uid: dbuser.uid },
					{ timestamp: score.played_date },
				);
				for (const guild of dbuser.guilds) {
					if (client.config.debug && guild.id != "976981749848473610") continue;
					let dbguild = await GuildConfigModel.findOne({ id: guild.id });
					if (!dbguild || !dbguild.tracking_enabled) continue;
					const track_channel = client.channels.cache.get(dbguild.channel.track);
					if (!track_channel || track_channel.type != ChannelType.GuildText) continue
					const guild_locale = client.guilds.cache.get(guild.id)!.preferredLocale;
					const spanish = guild_locale.includes("es");
					const str = spanish ? es : en;

					const embed = await Embeds.score({ user: user, score: score });
					await track_channel.send({ content: str.tracking.message(user), embeds: [embed] });
				}
				Logger.out({ prefix: "[TRACKING]", message: `Embed sent and updated entry in database.`, color: "Orange" });
			}
		}
	}

	public stop() {
		Logger.out({ prefix: "[TRACKING]", message: "Stopping osu!droid tracking system.", color: "Orange", important: true });
		this.running = false;
	}

	public async refresh(): Promise<boolean> {
		const status_before = this.running;
		this.stop();
		Logger.out({ prefix: "[TRACKING]", message: "Updating osu!droid tracking system's entries...", color: "Orange", important: true });
		const tracking_users = await DroidAccountTrackModel.find();
		let i = 1;
		for (const dbuser of tracking_users) {
			await new Promise(resolve => setTimeout(resolve, 3000));
			const user = await DroidBanchoUser.get({ uid: dbuser.uid });
			if (!user) continue;
			const score = (await user.scores.recent())[0];
			Logger.out({ prefix: "[TRACKING]", message: `(${i++} of ${tracking_users.length}) Updating tracking entry for ${user.username}...`, color: "Orange", important: true });
			Logger.out({ prefix: "[TRACKING]", message: `Timestamp: ${score.played_date}`, color: "Orange" });
			await DroidAccountTrackModel.findOneAndUpdate(
				{ uid: dbuser.uid },
				{ timestamp: score.played_date },
			);
			Logger.out({ prefix: "[TRACKING]", message: `Saved.`, color: "Orange", important: true });
		}
		Logger.out({ prefix: "[TRACKING]", message: `Successfully updated ${tracking_users.length} entries.`, color: "Orange" });
		if (status_before)
			this.start();
		return true;
	}
}