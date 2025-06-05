import { client } from "@root";
import path from "path";
import { SlashCommand } from "@structures/core/SlashCommand";
import { REST, Routes, type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { Files } from "@utils/Files";

const commandsPath = path.join(__dirname, "../commands");

export abstract class CommandHandler {
	public static async registerCommands() {
		const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
		client.commands.clear();
		const commandFiles = Files.getJsFiles(commandsPath);
		for (const file of commandFiles) {
			const command = await import(file) as SlashCommand;
			if ("run" in command && "data" in command) {
				client.commands.set(command.data.name, command);
				commands.push(command.data.toJSON());
			}
		}
		client.application!.commands.set(commands);
	}

	public static clearCommands() {
		const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);
		rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: [] })
			.then(() => console.log('✅ Cleared all global slash commands.'))
			.catch(console.error);
	}
}
