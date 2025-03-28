import type { Event } from "../../types"
export const urlStorage = new Map<string, string>()

export const event: Event<"messageCreate"> = {
	name: "messageCreate",

	async execute(client, message) {
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