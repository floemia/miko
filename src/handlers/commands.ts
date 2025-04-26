import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js"
import { Table } from "tablifier"
import type { Command, GlobClient } from "../types"
import { loadFiles } from "../functions/files"
import { utils } from "../utils"

export async function handleCommands(client: GlobClient): Promise<void> {
	const table = new Table(" Slash Command ", " Status ")

	client.commands.clear()
	const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
	const error_commands: string[] = []

	const files = await loadFiles("commands")
	files.forEach(file => {
		const { command } = require(file) as { command: Command }
		try {
			client.commands.set(command.data.name, command)
			commands.push(command.data.toJSON())
		} catch (error: any) {
			error_commands.push(`${command.data.name} - ${error}`)
			utils.log.out({ prefix: "[BOT][COMMANDS][ERROR]", message: `An error has ocurred with the command ${command.data.name}. Details below.`, color: "Red", important: true })
			utils.log.err({ prefix: "[BOT][COMMANDS]", message: error.stack || "Unknown error" })
		}
	})

	client.application.commands.set(commands)
	utils.log.out({ prefix: "[BOT][COMMANDS]", message: `${client.commands.size} command(s) loaded successfully.`, color: "Green" })
	if (error_commands.length > 0) {
		utils.log.out({ prefix: "[BOT][COMMANDS][WARNING]", message: `${error_commands.length} command(s) failed to load. Check the console for more details.`, color: "Yellow", important: true })
	}
}
