import type { Event, GlobClient } from "../types"
import { loadFiles } from "../functions/files"
import { utils } from "../utils"

export async function handleEvents(client: GlobClient): Promise<void> {
	client.events.clear()
	var error_events: string[] = []

	const files = await loadFiles("events")
	files.forEach(file => {
		const { event } = require(file) as { event: Event<any> }
		try {
			const execute = (...args: any[]) => event.execute(client, ...args)
			client.events.set(event.name, execute)
			if (event.rest) {
				if (event.once) client.rest.once(event.name, execute)
				else client.rest.on(event.name, execute)
			} else {
				if (event.once) client.once(event.name, execute)
				else client.on(event.name, execute)
			}
		} catch (error: any) {
			utils.log.out({ prefix: "[BOT]", message: `An error has ocurred with the event ${event.name}. Details below.`, color: "Red", important: true })
			utils.log.err({ prefix: "[BOT][EVENTS]", message: error.stack || "Unknown error" })
			error_events.push(event.name)
		}
	})
	utils.log.out({ prefix: "[BOT][EVENTS]", message: `${client.events.size} event(s) loaded successfully.`, color: "Green" })
	if (error_events.length > 0){
		utils.log.out({ prefix: "[BOT][EVENTS][WARNING]", message: `${error_events.length} event(s) failed to load. Check the console for more details.`, color: "Yellow", important: true })
	}
}
