import type { Event } from "../../types"
import { urlStorage } from "./message"

export const event: Event<"messageUpdate"> = {
	name: "messageUpdate",

	async execute(client, oldMessage, newMessage) {
		if (newMessage.channel.lastMessageId != newMessage.id) return
		let timestamp = newMessage.createdTimestamp
		let key = urlStorage.get(newMessage.channelId)
		if (key) {
			let storage_timestamp = key.split(":")[1]
			if (Number(storage_timestamp) > timestamp) return
		}
		const regex = /https:\/\/osu\.ppy\.sh\/beatmapsets\/\d+#osu\/\d+/g;
		let url;
		if (newMessage.embeds.length) {
			for (const embed of newMessage.embeds) {
				let caught = embed.title?.match(regex) || undefined
				if (!caught) caught = embed.author?.url?.match(regex) || undefined
				if (caught) {
					url = caught[0]
					break
				}
			}

		} else {
			let list_urls = newMessage.content.match(regex)
			if (list_urls)
				url = list_urls[0]
		}
		if (url) {
			urlStorage.set(newMessage.channelId, `${url}::${timestamp}`)
		}
	}
}