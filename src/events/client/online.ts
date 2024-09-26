import type { Event } from "../../types"
import { handleCommands } from "../../handlers/commands"
import { logger } from "../.."

export const event: Event<"ready"> = {
	name: "ready",
	once: true,
	
	async execute(client) {
		logger.info(`${client.user.username} is online!`)
		await handleCommands(client)
	}
}
