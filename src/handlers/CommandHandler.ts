import path from "path";
import { client } from "@root";
import { SlashCommand } from "@structures/core";
import { type RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { FileManager } from "@utils/managers";
import { Logger as log } from "@utils/helpers";
import { Config } from "@core/Config";

const commandsPath = path.join(__dirname, "../commands/");
/**
 * Handles the registration of slash commands.
 */
export abstract class CommandHandler {
    /**
     * Registers all slash commands found in the commands directory.
     */
    static async registerCommands() {

        const devGuild = Config.test_guild;
        if (!devGuild) throw new Error("No test guild provided in Config");

        log.out({ prefix: "CLIENT", message: "Registering slash commands..." });
        const commands: RESTPostAPIApplicationCommandsJSONBody[] = [],
            devCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

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
        log.out({ prefix: "CLIENT", message: `${client.commands.size} slash commands registered! (and ${client.dev_commands.size} developer commands!)`, important: true });
    }
}
