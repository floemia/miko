import "dotenv/config"
import { Client, Collection } from "discord.js"
import type { GlobClient } from "./types"
import { handleEvents } from "./handlers/events"
import { presence_loop } from "./handlers/presence"
import { osu_api_connect } from "./handlers/osu_api"
import { connect_mongoose } from "./handlers/mongoose"
import Logger, { LoggerOptions } from "@ptkdev/logger"
export const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
}) as GlobClient

client.events = new Collection()
client.commands = new Collection()

handleEvents(client)
client.login(process.env.TOKEN)

connect_mongoose()
const options: LoggerOptions = {
	language: "en",
	colors: true,
	debug: true,
	info: true,
	warning: true,
	error: true,
	sponsor: true,
	write: true,
	type: "log",
	rotate: {
		size: "10M",
		encoding: "utf8",
	},
	path: {
		// remember: add string *.log to .gitignore
		debug_log: "./debug.log",
		error_log: "./errors.log",
	},
};

export const logger = new Logger(options)

client.on("ready", async () => {
	await presence_loop(client)
})

