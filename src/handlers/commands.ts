import type { RESTPostAPIApplicationCommandsJSONBody } from "discord.js"
import { Table } from "tablifier"
import { logger } from ".."
import type { Command, GlobClient } from "../types"
import { loadFiles } from "../functions/files"

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
    } catch (error) {
		error_commands.push(`${command.data.name} - ${error}`)
		console.log(error)
    }
  })

  client.application.commands.set(commands)
  logger.info(`${client.commands.size} command(s) loaded successfully.`,"COMMANDS")
  if (error_commands.length > 0){
	  logger.error(`${error_commands.length} command(s) failed to load => ${error_commands.join()}`, "COMMANDS")
  }
}
