import { Event } from "@structures/core/Event";
import { Logger } from "@utils/logger";
import { FileManager } from "@utils/managers";
import { ActivityOptions, ActivityType } from "discord.js";

export const name = "ready";

export const run: Event<"ready">["run"] = async (client) => {
	Logger.out({ prefix: "[CLIENT]", message: `Logged in as ${client.user?.displayName}!`, color: "Purple" })
	const avatars = FileManager.getAvatarList();
	setInterval(async () => {
		const candidates = avatars.filter(pfp => pfp != client.current_pfp);
		const random = candidates.length > 0
			? candidates[Math.floor(Math.random() * candidates.length)]
			: client.current_pfp;
		client.current_pfp = random;
		await client.user!.setAvatar(random);
	}, 60000 * 60);

	const activities: ActivityOptions[] = [
		{ name: "osu!droid", type: ActivityType.Playing },
	]

	// setInterval(async () => {
	client.user!.setActivity(activities[Math.floor(Math.random() * activities.length)]);
	// }, 1000 * 60);
}