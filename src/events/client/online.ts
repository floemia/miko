import type { Event } from "../../types"
import { handleCommands } from "../../handlers/commands"
import { logger } from "../.."
import { osu_api_connect } from "../../handlers/osu_api"
import { connect_mongoose } from "../../handlers/mongoose"
import { presence_loop } from "../../handlers/presence"

export const event: Event<"ready"> = {
	name: "ready",
	once: true,
	
	async execute(client) {
		await osu_api_connect()
		await connect_mongoose()
		await handleCommands(client)
		await presence_loop(client)
		logger.info(`${client.user.username} is online!`)
	}
}
