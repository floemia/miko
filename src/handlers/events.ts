import type { Event, GlobClient } from "../types"
import { loadFiles } from "../functions/files"
import { logger } from ".."

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
		} catch (error) {
			error_events.push(`${event.name} - ${error}`)
		}
	})
	logger.info(`${client.events.size} event(s) loaded successfully.`, "EVENTS")
	if (error_events.length > 0){
		logger.error(`${error_events.length} event(s) failed to load => ${error_events.join()}`, "EVENTS")
	}
}
