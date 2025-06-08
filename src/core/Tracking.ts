import { DroidBanchoUser } from "miko-modules";
import { client } from "@root";
import { Embeds, Logger } from "@utils";
import { ChannelType, GuildMemberFlagsBitField, PermissionFlagsBits } from "discord.js";
import { en, es } from "@locales";
export class Tracking {
	private cooldown: number = 10;
	private running: boolean = false;
	private page_down: boolean = false;
	constructor(cooldown: number) {
		this.cooldown = cooldown;
	}

	public async start() {
		this.running = true;
		if (!client.config.tracking.droid.enabled) client.config.tracking.droid.enabled = true;
		let tracking_users = await client.db.tracking.getUsers();
		Logger.out({ prefix: "[TRACKING]", message: `osu!droid tracking has started. Found ${tracking_users.length} entries.`, color: "Orange", important: true });
		while (this.running) {
			tracking_users = await client.db.tracking.getUsers();
			for (const dbuser of tracking_users) {
				if (client.config.debug && dbuser.uid != 177955) continue;
				await new Promise(resolve => setTimeout(resolve, this.cooldown * 1000));
				if (!this.running) break;
				let user: DroidBanchoUser | undefined;
				try {
					user = await DroidBanchoUser.get({ uid: dbuser.uid });
				} catch (error: any) {
					Logger.err({ prefix: "[TRACKING]", message: `An error has occured. Page down?`, color: "Red", important: true });
					Logger.err({ prefix: "[TRACKING]", message: `${error.stack}`, color: "Red" });
					Logger.out({ prefix: "[TRACKING]", message: `Retry loop was started (Interval: 120s)`, color: "Orange", important: true });
					this.page_down = true;
					while (this.page_down && this.running) {
						await new Promise(resolve => setTimeout(resolve, 120 * 1000));
						try {
							user = await DroidBanchoUser.get({ uid: dbuser.uid });
							this.page_down = false;
						} catch (error: any) {
							// page still down, retry
						}
					}
					Logger.out({ prefix: "[TRACKING]", message: `Page up! Continuing...`, color: "Orange", important: true });
				}
				// continue
				if (!user) continue;
				this.page_down = false;
				const score = (await user.scores.recent())[0];
				if (!score || score.played_date <= dbuser.timestamp) continue;
				Logger.out({ prefix: "[TRACKING]", message: `Creating score embed for ${user.username}...`, color: "Orange", important: true });
				Logger.out({ prefix: "[TRACKING]", message: `Beatmap: ${score.filename}`, color: "Orange" });
				Logger.out({ prefix: "[TRACKING]", message: `Guilds: ${dbuser.guilds.map(g => g.id)}`, color: "Orange" });
				await client.db.tracking.updateEntry(dbuser.uid, score.played_date);
				for (const guild of dbuser.guilds) {
					if (client.config.debug && guild.id != "976981749848473610") continue;
					let dbguild = await client.db.guilds.getConfig(guild.id);
					if (!dbguild || !dbguild.tracking_enabled) continue;
					const track_channel = client.channels.cache.get(dbguild.channel.track);
					if (!track_channel || track_channel.type != ChannelType.GuildText) continue

					const cache_guild = client.guilds.cache.get(guild.id);
					if (!cache_guild) continue;
					const bot_member = cache_guild.members.me!;
					if (!bot_member.permissionsIn(track_channel).has(PermissionFlagsBits.SendMessages)) continue;

					const guild_locale = cache_guild.preferredLocale;
					const spanish = guild_locale.includes("es");
					const str = spanish ? es : en;

					const embed = await Embeds.score({ user: user, score: score });
					await track_channel.send({ content: str.tracking.message(user), embeds: [embed] });
				}
				Logger.out({ prefix: "[TRACKING]", message: `The embed was sent and the entry was updated.`, color: "Orange" });
			}
		}
	}

	public stop() {
		Logger.out({ prefix: "[TRACKING]", message: "Stopping osu!droid tracking system.", color: "Orange", important: true });
		this.running = false;
		client.config.tracking.droid.enabled = false;
	}

	public async refresh(): Promise<boolean> {
		const status_before = this.running;
		this.stop();
		Logger.out({ prefix: "[TRACKING]", message: "Updating osu!droid tracking system's entries...", color: "Orange", important: true });
		const tracking_users = await client.db.tracking.getUsers();
		let i = 1;
		for (const dbuser of tracking_users) {
			await new Promise(resolve => setTimeout(resolve, 3000));
			const user = await DroidBanchoUser.get({ uid: dbuser.uid });
			if (!user) continue;
			const score = (await user.scores.recent())[0];
			Logger.out({ prefix: "[TRACKING]", message: `(${i++} of ${tracking_users.length}) Updating tracking entry for ${user.username}...`, color: "Orange", important: true });
			Logger.out({ prefix: "[TRACKING]", message: `Timestamp: ${score.played_date}`, color: "Orange" });
			await client.db.tracking.updateEntry(dbuser.uid, score.played_date);
			Logger.out({ prefix: "[TRACKING]", message: `Saved.`, color: "Orange", important: true });
		}
		Logger.out({ prefix: "[TRACKING]", message: `Successfully updated ${tracking_users.length} entries.`, color: "Orange" });
		if (status_before)
			this.start();
		return true;
	}
}