import type { Event } from "../../types"
import { handleCommands } from "../../handlers/commands"
import { osu_api_connect, connect_mongoose } from "../../handlers/connections"
import { presence_loop } from "../../handlers/presence"
import { utils } from "../../utils"

export const event: Event<"ready"> = {
	name: "ready",
	once: true,
	async execute(client) {
		await handleCommands(client)
		await osu_api_connect()
		await connect_mongoose()
		await presence_loop(client)
		utils.log.out({ prefix: "[BOT]", message: `${client.user.displayName} is online!`, color: "Green", important: true })
	}
}
