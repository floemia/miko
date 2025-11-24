import { ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";
import { MikoClient } from "@core/MikoClient";

/**
 * A basic slash command.
 */
export interface SlashCommand {
    /**
     * The main function of the slash command.
     * @param client The instance of this client.
     * @param interaction The interaction that triggered the command.
     */
	run(client: MikoClient, interaction: ChatInputCommandInteraction): Promise<any>;
    /**
     * The cooldown of the slash command.
     */
	cooldown?: number;

    /**
     * Whether the slash command is disabled or not.
     */
	disabled?: boolean;

    /**
     * Whether the slash command is only for developers or not.
     */
	developer?: boolean;

    /**
     * The data (name, description, etc.) of the slash command.
     */
	data: SharedSlashCommand;
}