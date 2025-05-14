import { TextChannel } from "discord.js";
import type { Event } from "../../types"
export const urlStorage = new Map<string, string>()

export const event: Event<"messageCreate"> = {
	name: "messageCreate",

	async execute(client, message) {
		if (message.author.id == "596481414426525696" && message.content.startsWith("m!say")) {
			const msg = message.content.split(" ")
			const channel = client.channels.cache.get(msg[1]) as TextChannel;
			// !say (channel) (message)
			let text = msg.slice(2).join(" ");
			channel.sendTyping();
			setTimeout(async () => {
				await channel.send(text);
			}, Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000);

		}
		const regex = /https:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#osu\/\d+/g;
		let url;
		if (message.embeds.length) {
			for (const embed of message.embeds) {
				let caught = embed.title?.match(regex) || undefined
				if (!caught) caught = embed.author?.url?.match(regex) || undefined
				if (caught) {
					url = caught[0]
					break
				}
			}
		} else {
			let list_urls = message.content.match(regex)
			if (list_urls)
				url = list_urls[0]
		}
		if (url) {
			urlStorage.set(message.channelId, `${url}::${message.createdTimestamp}`)
		}
	}
}