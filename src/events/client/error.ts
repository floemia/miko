import type { Event } from "../../types"
import { utils } from "../../utils"

export const event: Event<"error"> = {
	name: "error",
	once: true,

	async execute(client, error) {
		utils.log.out({ prefix: "[BOT]", message: `An error has ocurred. Details below.`, color: "Red", important: true })
		utils.log.err({ prefix: "[BOT]", message: error.stack || "Unknown error" })
	},
}