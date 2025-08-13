import { client } from "@root";
import path from "path";
import { SlashCommand } from "@structures/core/SlashCommand";
import { REST, Routes, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { FileManager } from "@utils/managers";
const commandsPath = path.join(__dirname, "../commands");

export abstract class CommandHandler {
	public static async registerCommands() {

		const devGuild = client.config.test_guild;
		if (!devGuild) throw new Error("No test guild provided in config.json (as config.test_guild).");
		const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
		const devCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
		client.commands.clear();
		const commandFiles = FileManager.getJSFiles(commandsPath);
		for (const file of commandFiles) {
			const command = await import(file) as SlashCommand;
			if ("run" in command && "data" in command) {
				if (command.disabled) continue;
				if (command.developer) {
					devCommands.push(command.data.toJSON());
					client.dev_commands.set(command.data.name, command);
				} else {
					commands.push(command.data.toJSON());
					client.commands.set(command.data.name, command);
				}
			}
		}
		await client.application!.commands.set(commands);
		await client.guilds.cache.get(devGuild)!.commands.set(devCommands);
	}

	public static clearCommands() {
		const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);
		rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] })
			.then(() => console.log('✅ Cleared all global slash commands.'))
			.catch(console.error);
	}
}
