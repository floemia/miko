import { ChatInputCommandInteraction, SharedSlashCommand } from "discord.js";
import { Bot } from "@core";

export interface SlashCommand {
	run(client: Bot, interaction: ChatInputCommandInteraction): Promise<any>;
	dirname: string;
	cooldown?: number;
	disabled?: boolean;
	developer?: boolean;
	data: SharedSlashCommand;
}