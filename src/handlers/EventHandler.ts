import { Event } from "@structures/core";
import path from "path";
import { client } from "@root";
import { FileManager } from "@utils/managers";
const eventsPath = path.join(__dirname, "../events");

export abstract class EventHandler {
	public static async registerEvents() {
		const eventsFiles = FileManager.getJSFiles(eventsPath);
		for (const file of eventsFiles) {
			const event = await import(file) as Event<any>;
			if ("run" in event) {
				const run = (...args: any[]) => event.run(client, ...args)
				client.events.set(event.name, run);
				if (event.rest) {
					if (event.once) client.rest.once(event.name, run)
					else client.rest.on(event.name, run)
				} else {
					if (event.once) client.once(event.name, run)
					else client.on(event.name, run)
				}
			}
		}
	}
}

