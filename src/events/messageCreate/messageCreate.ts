import { Event } from "@structures/core";
import { TextChannel } from "discord.js";

export const name = "messageCreate";
export const run: Event<"messageCreate">["run"] = async (client, message) => {
	if (message.author.bot) return;
	if (message.content.startsWith("m!say") && message.author.id in client.config.developers) {
		const args = message.content.split(" ");
		const channel = client.channels.cache.get(args[1]) as TextChannel | undefined;
		if (!channel) return;
		const text = args.slice(2).join(" ");
		await channel.sendTyping();
		setTimeout(async () => {
			await channel.send(text);
		}, 150 * text.length);
		await channel.send(text);
	}
}